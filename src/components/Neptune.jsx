import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Neptune = ({
    // Positioning
    top,
    bottom,
    left,
    right,
    className = "",
    style = {},

    // Customization
    neptuneSize = 0.65,
    neptuneRotationSpeed = 0.0013,
    // Neptune's rings are very faint and thin
    ringInnerRadius = 1.2,
    ringOuterRadius = 1.35,
    ringParticleCount = 25000,
    ringRotationSpeed = 0.005,
    atmosphereOpacity = 0.15,
    starCount = 8000,
    autoRotate = true,
    bgEnabled = true,
    starAngle = 0,
    cameraAngle = 0,
    cameraDistance = 2.8,
    cameraFov = 45,
    bgImageOpacity = 0.6,
    textureBaseUrl = 'https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public',
    containerHeight = '100vh',
    mouseInteractive = true
}) => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(neptuneRotationSpeed);
    const [isDragging, setIsDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: 0, long: 0 });

    // Initialize Three.js
    useEffect(() => {
        const cleanup = initThree();
        return cleanup;
    }, []);

    const initThree = () => {
        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Pure Black
        scene.fog = new THREE.FogExp2(0x000000, 0.0003); // Reduced fog for clearer stars

        // Camera
        // Increased far clipping plane to 8000 to see the background sphere
        const W = mountRef.current ? mountRef.current.clientWidth : window.innerWidth;
        const H = mountRef.current ? mountRef.current.clientHeight : window.innerHeight;
        const camera = new THREE.PerspectiveCamera(cameraFov, W / H, 0.1, 8000);
        const _camAngleRad = cameraAngle * (Math.PI / 180);
        camera.position.set(0, cameraDistance * Math.sin(_camAngleRad), cameraDistance * Math.cos(_camAngleRad));
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'anonymous';

        // --- 1. BACKGROUND SPHERE (8k Stars) ---
        const bgGeometry = new THREE.SphereGeometry(2500, 64, 64);
        const bgTexture = textureLoader.load(`${textureBaseUrl}/8k_stars.webp`);
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: bgTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: bgImageOpacity,
            depthWrite: false
        });
        const backgroundSphere = new THREE.Mesh(bgGeometry, bgMaterial);
        if (bgEnabled) scene.add(backgroundSphere);

        // --- 2. GALAXY SPHERE (Nebula particles - Deep Blues for Neptune) ---
        const galaxyCount = 20000;
        const galaxyGeometry = new THREE.BufferGeometry();
        const galaxyMaterial = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const galaxyVertices = [];
        const galaxyColors = [];

        for (let i = 0; i < galaxyCount; i++) {
            const r = 2500 + Math.random() * 1000;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            galaxyVertices.push(x, y, z);

            const col = new THREE.Color();
            const rand = Math.random();

            // Neptune Theme: Royal Blues, Dark Cyans, and Deep Purples
            if (rand > 0.6) col.setHex(0x4169e1); // Royal Blue
            else if (rand > 0.3) col.setHex(0x00ced1); // Dark Turquoise
            else col.setHex(0x483d8b); // Dark Slate Blue

            const intensity = 0.3 + Math.random() * 0.7;
            col.multiplyScalar(intensity);

            galaxyColors.push(col.r, col.g, col.b);
        }

        galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyVertices, 3));
        galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));
        const galaxyDome = new THREE.Points(galaxyGeometry, galaxyMaterial);
        scene.add(galaxyDome);

        // --- 3. Starfield (Foreground) ---
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            size: 0.09,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const starVertices = [];
        const starColors = [];
        const starBlinkParams = [];

        for (let i = 0; i < starCount; i++) {
            const r = 15 + Math.random() * 30;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            starVertices.push(x, y, z);

            const colorType = Math.random();
            if (colorType > 0.9) {
                starColors.push(0.8, 0.8, 1);
            } else if (colorType > 0.7) {
                starColors.push(1, 0.9, 0.8);
            } else {
                starColors.push(1, 1, 1);
            }

            starBlinkParams.push({
                speed: 0.5 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2
            });
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.rotation.y = starAngle * (Math.PI / 180);
        scene.add(stars);

        // --- Neptune Group ---
        const neptuneGroup = new THREE.Group();
        neptuneGroup.rotation.z = 28.3 * Math.PI / 180;
        scene.add(neptuneGroup);

        // Neptune Surface
        const neptuneGeometry = new THREE.SphereGeometry(neptuneSize, 64, 64);
        const neptuneMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load(`${textureBaseUrl}/neptune.jpg`),
            specular: new THREE.Color(0x001133),
            shininess: 18
        });
        const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
        neptune.castShadow = true;
        neptune.receiveShadow = true;
        neptuneGroup.add(neptune);

        // --- 4. Neptune's Faint Rings ---
        const ringGeometry = new THREE.BufferGeometry();
        const ringPositions = [];
        const ringColors = [];
        const ringSizes = [];

        for (let i = 0; i < ringParticleCount; i++) {
            const radius = ringInnerRadius + Math.random() * (ringOuterRadius - ringInnerRadius);
            const angle = Math.random() * Math.PI * 2;

            // Generate flat on XZ plane relative to the group
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 0.01; // Very thin

            ringPositions.push(x, y, z);

            const color = new THREE.Color();
            // Neptune's rings are very dark and dusty
            const shade = 0.1 + Math.random() * 0.2;
            color.setRGB(shade, shade, shade + 0.05); // Dark grey with hint of blue

            ringColors.push(color.r, color.g, color.b);
            ringSizes.push(0.002 + Math.random() * 0.003);
        }

        ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringPositions, 3));
        ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(ringColors, 3));
        ringGeometry.setAttribute('size', new THREE.Float32BufferAttribute(ringSizes, 1));

        const ringMaterial = new THREE.PointsMaterial({
            size: 0.003,
            vertexColors: true,
            transparent: true,
            opacity: 0.6, // Faint
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const neptuneRing = new THREE.Points(ringGeometry, ringMaterial);
        // Neptune rings are equatorial, so they align with the planet's rotation
        neptuneGroup.add(neptuneRing);

        // Atmosphere Glow
        const atmosphereGeometry = new THREE.SphereGeometry(neptuneSize + 0.02, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4169e1,
            transparent: true,
            opacity: atmosphereOpacity,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 3, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x5b7db1, 0.8);
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
        let windowHalfX = (mountRef.current ? mountRef.current.clientWidth : window.innerWidth) / 2;
        let windowHalfY = (mountRef.current ? mountRef.current.clientHeight : window.innerHeight) / 2;
        let isMouseDown = false;

        // Interaction Handlers
        const onDocumentMouseDown = (event) => {
            if (!mouseInteractive) return;
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
            setRotationSpeed(neptuneRotationSpeed / 2);
        };

        const onTouchStart = (event) => {
            if (!mouseInteractive) return;
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
            if (!isMouseDown && autoRotate) targetRotationY += neptuneRotationSpeed;

            neptuneGroup.rotation.y += (targetRotationY - neptuneGroup.rotation.y) * 0.05;
            neptuneGroup.rotation.x += (targetRotationX - neptuneGroup.rotation.x) * 0.05;

            // Rotate Ring
            neptuneRing.rotation.y -= ringRotationSpeed;

            // Rotate Starfields and Background
            stars.rotation.y -= 0.0012;
            backgroundSphere.rotation.y -= 0.0012;

            const time = Date.now() * 0.001;
            const colors = starGeometry.attributes.color.array;
            for (let i = 0; i < starCount; i++) {
                const { speed, phase } = starBlinkParams[i];
                const brightness = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * speed + phase));
                colors[i * 3] = brightness;
                colors[i * 3 + 1] = brightness;
                colors[i * 3 + 2] = brightness;
            }
            starGeometry.attributes.color.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const rW = mountRef.current ? mountRef.current.clientWidth : window.innerWidth;
            const rH = mountRef.current ? mountRef.current.clientHeight : window.innerHeight;
            windowHalfX = rW / 2;
            windowHalfY = rH / 2;
            camera.aspect = rW / rH;
            camera.updateProjectionMatrix();
            renderer.setSize(rW, rH);
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
            neptuneGeometry.dispose();
            neptuneMaterial.dispose();
            starGeometry.dispose();
            starMaterial.dispose();
            bgGeometry.dispose();
            bgMaterial.dispose();
            galaxyGeometry.dispose();
            galaxyMaterial.dispose();
            atmosphereGeometry.dispose();
            atmosphereMaterial.dispose();
        };
    };

    return (
        <div
            className={`relative w-full bg-black text-white overflow-hidden font-sans selection:bg-cyan-500/30 ${className}`}
            style={{
                position: top || bottom || left || right ? 'absolute' : 'relative',
                top,
                bottom,
                left,
                right,
                height: containerHeight,
                ...style
            }}
        >

            {/* 3D Canvas Container */}
            <div ref={mountRef} className={`absolute inset-0 z-0 ${mouseInteractive ? 'cursor-move' : 'cursor-default'}`} />

            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-70"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-70"></div>

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

        </div>
    );
};

export default Neptune;