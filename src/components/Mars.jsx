import React, { useEffect, useRef, useState } from 'react';

// Self-contained Three.js loader
const loadThree = () => {
    return new Promise((resolve, reject) => {
        if (window.THREE) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
};

const Mars = ({
    // Positioning
    top,
    bottom,
    left,
    right,
    className = "",
    style = {},

    // Customization
    marsSize = 0.6,
    phobosSize = 0.05,
    deimosSize = 0.04,
    phobosDistance = 0.8,
    deimosDistance = 1.2,
    phobosOrbitSpeed = 0.03,
    deimosOrbitSpeed = 0.015,
    marsRotationSpeed = 0.001,
    orbitOpacity = 0.06, // Configurable orbit visibility
    tailOpacity = 0.8,  // Configurable tail visibility
    starCount = 8000,
    autoRotate = true
}) => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(marsRotationSpeed);
    const [isDragging, setIsDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: 0, long: 0 });

    // Load Three.js
    useEffect(() => {
        let cancelled = false;

        loadThree()
            .then(() => {
                if (!cancelled && window.THREE) {
                    initThree();
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error('Failed to load Three.js:', error);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const initThree = () => {
        const THREE = window.THREE;

        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Pure Black
        scene.fog = new THREE.FogExp2(0x000000, 0.0003); // Reduced fog for clearer stars

        // Camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 8000);
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

        // --- 1. BACKGROUND SPHERE (8k Stars) ---
        const bgGeometry = new THREE.SphereGeometry(4000, 64, 64);
        const bgTexture = textureLoader.load('8k_stars.png');
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: bgTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            fog: false
        });
        const backgroundSphere = new THREE.Mesh(bgGeometry, bgMaterial);
        scene.add(backgroundSphere);

        // --- 2. GALAXY SPHERE (Nebula particles - Red/Rust/Orange tones for Mars) ---
        const galaxyCount = 20000;
        const galaxyGeometry = new THREE.BufferGeometry();
        const galaxyMaterial = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
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

            // Mars Theme: Deep Reds, Rusty Oranges, and Burnt Sienna
            if (rand > 0.6) col.setHex(0xb22222); // Firebrick
            else if (rand > 0.3) col.setHex(0xd2691e); // Chocolate
            else col.setHex(0xff4500); // OrangeRed

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
        scene.add(stars);

        // --- Mars Group ---
        const marsGroup = new THREE.Group();
        marsGroup.rotation.z = 25.2 * Math.PI / 180;
        scene.add(marsGroup);

        // Mars Surface
        const marsGeometry = new THREE.SphereGeometry(marsSize, 64, 64);
        const marsMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('marsmap.jpg'),
            shininess: 5
        });
        const mars = new THREE.Mesh(marsGeometry, marsMaterial);
        mars.castShadow = true;
        mars.receiveShadow = true;
        marsGroup.add(mars);

        // --- Moons (Phobos & Deimos) ---
        const moonsGroup = new THREE.Group();
        marsGroup.add(moonsGroup); // Add to mars group so they share the axial tilt

        const moonsData = [
            {
                name: "Phobos",
                size: phobosSize,
                distance: phobosDistance,
                speed: phobosOrbitSpeed,
                inclination: 18 * Math.PI / 180, // Specific inclination for Phobos orbit
                color: 0xffffff,
                texture: 'moon.jpg'
            },
            {
                name: "Deimos",
                size: deimosSize,
                distance: deimosDistance,
                speed: deimosOrbitSpeed,
                inclination: -4 * Math.PI / 180, // Specific inclination for Deimos orbit
                color: 0xffffff,
                texture: 'moon.jpg'
            }
        ];

        const activeMoons = [];

        moonsData.forEach(moon => {
            // Each moon gets its own inclination group to handle the orbit tilt
            const inclinationGroup = new THREE.Group();
            inclinationGroup.rotation.z = moon.inclination; // Rotate around Z to tilt the orbit plane
            moonsGroup.add(inclinationGroup);

            // 1. Static Orbit Line (0.2 Opacity)
            const orbitCurve = new THREE.EllipseCurve(
                0, 0,            // ax, ay
                moon.distance, moon.distance, // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,           // aClockwise
                0                // aRotation
            );
            const orbitPoints = orbitCurve.getPoints(100);
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            orbitGeometry.rotateX(Math.PI / 2); // Rotate to lay flat on the XZ plane of the inclination group

            const orbitMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: orbitOpacity
            });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            inclinationGroup.add(orbitLine);

            // 2. Moon Mesh
            const geometry = new THREE.SphereGeometry(moon.size, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                map: textureLoader.load(moon.texture),
                shininess: 5
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Initial position (will be updated in animation loop)
            const startAngle = Math.random() * Math.PI * 2;
            mesh.position.set(Math.cos(startAngle) * moon.distance, 0, Math.sin(startAngle) * moon.distance);
            inclinationGroup.add(mesh);

            // 3. Trail / Comet Tail (0.6 Opacity)
            const trailLength = 100;
            const trailGeometry = new THREE.BufferGeometry();
            const trailPositions = new Float32Array(trailLength * 3);
            const trailColors = new Float32Array(trailLength * 3);

            // Init trail positions
            for (let i = 0; i < trailLength; i++) {
                trailPositions[i * 3] = mesh.position.x;
                trailPositions[i * 3 + 1] = mesh.position.y;
                trailPositions[i * 3 + 2] = mesh.position.z;

                const alpha = 1 - (i / trailLength);
                trailColors[i * 3] = 1.0 * alpha;
                trailColors[i * 3 + 1] = 1.0 * alpha;
                trailColors[i * 3 + 2] = 1.0 * alpha;
            }

            trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
            trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

            const trailMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: tailOpacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const trail = new THREE.Line(trailGeometry, trailMaterial);
            inclinationGroup.add(trail);

            activeMoons.push({
                mesh: mesh,
                trail: trail,
                data: moon,
                angle: startAngle
            });
        });

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 3, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0xc1440e, 0.8);
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
            setRotationSpeed(marsRotationSpeed / 2);
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
            if (!isMouseDown && autoRotate) targetRotationY += marsRotationSpeed;

            marsGroup.rotation.y += (targetRotationY - marsGroup.rotation.y) * 0.05;
            marsGroup.rotation.x += (targetRotationX - marsGroup.rotation.x) * 0.05;

            // Rotate Starfields
            stars.rotation.y -= 0.0009;
            backgroundSphere.rotation.y -= 0.0009;

            // Animate Moons and Trails
            activeMoons.forEach(obj => {
                // Update Angle
                obj.angle += obj.data.speed;
                const newX = Math.cos(obj.angle) * obj.data.distance;
                const newZ = Math.sin(obj.angle) * obj.data.distance;

                obj.mesh.position.set(newX, 0, newZ);
                obj.mesh.rotation.y += 0.01;

                // Update Trail
                const positions = obj.trail.geometry.attributes.position.array;
                // Shift positions down to create trail effect
                for (let i = positions.length - 1; i > 2; i -= 3) {
                    positions[i] = positions[i - 3];     // z
                    positions[i - 1] = positions[i - 4]; // y
                    positions[i - 2] = positions[i - 5]; // x
                }
                // Set head to new pos
                positions[0] = newX;
                positions[1] = 0;
                positions[2] = newZ;
                obj.trail.geometry.attributes.position.needsUpdate = true;
            });

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
            marsGeometry.dispose();
            marsMaterial.dispose();
            activeMoons.forEach(m => {
                m.mesh.geometry.dispose();
                m.mesh.material.dispose();
                m.trail.geometry.dispose();
                m.trail.material.dispose();
            });
            starGeometry.dispose();
            starMaterial.dispose();
            bgGeometry.dispose();
            bgMaterial.dispose();
            galaxyGeometry.dispose();
            galaxyMaterial.dispose();
            textureLoader.dispose();
        };
    };

    return (
        <div
            className={`relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-orange-500/30 ${className}`}
            style={{
                position: top || bottom || left || right ? 'absolute' : 'relative',
                top,
                bottom,
                left,
                right,
                ...style
            }}
        >

            {/* 3D Canvas Container */}
            <div ref={mountRef} className="absolute inset-0 z-0 cursor-move" />

            {/* Background Ambience - Rusty Red/Orange tones for Mars */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>

            {/* Grid Overlay - subtle texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-t-red-500 rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-12 h-12 bg-red-500/10 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-red-500 font-mono tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Telemetry...</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Mars;