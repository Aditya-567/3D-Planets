import React, { useEffect, useRef, useState } from 'react';
import { Globe, MapPin, Navigation, Maximize, RotateCw, Moon, Zap, Layers, ChevronRight, Activity } from 'lucide-react';

const EarthandMoon = () => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(0.001);
    const [isDragging, setIsDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: 0, long: 0 });

    // Load Three.js
    useEffect(() => {
        const loadThree = async () => {
            if (window.THREE) {
                initThree();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.async = true;
            script.onload = initThree;
            document.body.appendChild(script);
        };

        loadThree();
    }, []);

    const initThree = () => {
        const THREE = window.THREE;

        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Pure Black
        scene.fog = new THREE.FogExp2(0x000000, 0.02);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.8;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        const textureLoader = new THREE.TextureLoader();

        // --- Starfield ---
        const starCount = 2000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const starVertices = [];
        const starColors = [];
        const starBlinkParams = [];

        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 30;
            const y = (Math.random() - 0.5) * 30;
            const z = - (Math.random()) * 20;
            starVertices.push(x, y, z);
            starColors.push(1, 1, 1);
            starBlinkParams.push({
                speed: 0.2 + Math.random() * 2.0,
                phase: Math.random() * Math.PI * 2
            });
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // --- Earth Group ---
        const earthGroup = new THREE.Group();
        earthGroup.rotation.z = 23.4 * Math.PI / 180;
        scene.add(earthGroup);

        // Earth Surface
        const earthGeometry = new THREE.SphereGeometry(0.6, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
            specularMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'),
            normalMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
            specular: new THREE.Color(0x333333),
            shininess: 15
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.castShadow = true;
        earth.receiveShadow = true;
        earthGroup.add(earth);

        // Atmosphere Glow
        const atmosphereGeometry = new THREE.SphereGeometry(0.62, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // Clouds
        const cloudGeometry = new THREE.SphereGeometry(0.605, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        earthGroup.add(clouds);

        // --- Moon Setup ---
        const moonOrbitGroup = new THREE.Group();
        moonOrbitGroup.rotation.z = 15 * Math.PI / 180;
        scene.add(moonOrbitGroup);

        const moonGeometry = new THREE.SphereGeometry(0.09, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'),
            shininess: 5,
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(1.0, 0, 0);
        moon.castShadow = true;
        moon.receiveShadow = true;
        moonOrbitGroup.add(moon);


        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 3, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
        rimLight.position.set(-5, 1, -5);
        scene.add(rimLight);

        setLoading(false);

        // --- Interaction State ---
        let targetRotationX = 0;
        let targetRotationY = 0;
        let targetRotationXOnMouseDown = 0;
        let targetRotationYOnMouseDown = 0;
        let mouseX = 0;
        let mouseY = 0;
        let mouseXOnMouseDown = 0;
        let mouseYOnMouseDown = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;
        let isMouseDown = false;

        // Interaction Handlers
        const onDocumentMouseDown = (event) => {
            if (event.target.tagName !== 'CANVAS') return;
            event.preventDefault();
            isMouseDown = true;
            setIsDragging(true);
            mouseXOnMouseDown = event.clientX - windowHalfX;
            mouseYOnMouseDown = event.clientY - windowHalfY;
            targetRotationXOnMouseDown = targetRotationX;
            targetRotationYOnMouseDown = targetRotationY;
            setRotationSpeed(0);
        };

        const onDocumentMouseMove = (event) => {
            if (isMouseDown) {
                mouseX = event.clientX - windowHalfX;
                mouseY = event.clientY - windowHalfY;
                targetRotationY = targetRotationYOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
                targetRotationX = targetRotationXOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;

                setCoordinates({
                    lat: Math.round(-(targetRotationX * 180 / Math.PI) % 90),
                    long: Math.round((targetRotationY * 180 / Math.PI) % 180)
                });
            }
        };

        const onDocumentMouseUp = () => {
            isMouseDown = false;
            setIsDragging(false);
            setRotationSpeed(0.0005);
        };

        const onTouchStart = (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                isMouseDown = true;
                setIsDragging(true);
                mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
                mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
                targetRotationXOnMouseDown = targetRotationX;
                targetRotationYOnMouseDown = targetRotationY;
                setRotationSpeed(0);
            }
        }

        const onTouchMove = (event) => {
            if (isMouseDown && event.touches.length === 1) {
                event.preventDefault();
                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
                targetRotationY = targetRotationYOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
                targetRotationX = targetRotationXOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;
            }
        }

        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('touchstart', onTouchStart, false);
        document.addEventListener('touchmove', onTouchMove, false);
        document.addEventListener('touchend', onDocumentMouseUp, false);

        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (!isMouseDown) targetRotationY += 0.001;

            earthGroup.rotation.y += (targetRotationY - earthGroup.rotation.y) * 0.05;
            earthGroup.rotation.x += (targetRotationX - earthGroup.rotation.x) * 0.05;
            clouds.rotation.y += 0.0004;

            moonOrbitGroup.rotation.y += 0.005;
            moon.rotation.y += 0.01;

            const time = Date.now() * 0.001;
            const colors = starGeometry.attributes.color.array;
            for (let i = 0; i < starCount; i++) {
                const { speed, phase } = starBlinkParams[i];
                const brightness = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * speed + phase));
                colors[i * 3] = brightness;     // R
                colors[i * 3 + 1] = brightness; // G
                colors[i * 3 + 2] = brightness; // B
            }
            starGeometry.attributes.color.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', onDocumentMouseDown);
            document.removeEventListener('mousemove', onDocumentMouseMove);
            document.removeEventListener('mouseup', onDocumentMouseUp);
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onDocumentMouseUp);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            earthGeometry.dispose();
            earthMaterial.dispose();
            moonGeometry.dispose();
            moonMaterial.dispose();
            starGeometry.dispose();
            starMaterial.dispose();
            textureLoader.dispose();
        };
    };

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-cyan-500/30">

            {/* 3D Canvas Container */}
            <div ref={mountRef} className="absolute inset-0 z-0 cursor-move" />

            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

            {/* Grid Overlay - subtle texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-t-cyan-500 rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-12 h-12 bg-cyan-500/10 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-cyan-500 font-mono tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Telemetry...</p>
                    </div>
                </div>
            )}

            {/* All Overlay UI Elements have been removed as requested */}

        </div>
    );
};

export default EarthandMoon;