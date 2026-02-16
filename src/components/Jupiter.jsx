import { useEffect, useRef, useState } from 'react';

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

const Jupiter = ({
    // Positioning
    top,
    bottom,
    left,
    right,
    className = "",
    style = {},

    // Customization
    jupiterSize = 0.8,
    jupiterRotationSpeed = 0.002,
    // Ring properties - faint and thin compared to Saturn
    ringInnerRadius = 1.6,
    ringOuterRadius = 1.8,
    ringParticleCount = 40000, // Fewer particles than Saturn
    ringRotationSpeed = 0.005,
    starCount = 8000,
    autoRotate = true
}) => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(jupiterRotationSpeed);
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
        camera.position.z = 3.2;

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
        const bgGeometry = new THREE.SphereGeometry(2500, 64, 64);
        const bgTexture = textureLoader.load('8k_stars.png');
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: bgTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        const backgroundSphere = new THREE.Mesh(bgGeometry, bgMaterial);
        scene.add(backgroundSphere);

        // --- 2. GALAXY SPHERE (Nebula particles - Cream/Tan/Orange tones for Jupiter) ---
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

            // Jupiter Theme: Wheat, Burlywood, and Peru colors
            if (rand > 0.6) col.setHex(0xf5deb3); // Wheat
            else if (rand > 0.3) col.setHex(0xdeb887); // Burlywood
            else col.setHex(0xcd853f); // Peru

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

        // --- Jupiter Group ---
        const jupiterGroup = new THREE.Group();
        jupiterGroup.rotation.z = 3.1 * Math.PI / 180;
        scene.add(jupiterGroup);

        // Jupiter Surface
        const jupiterGeometry = new THREE.SphereGeometry(jupiterSize, 64, 64);
        const jupiterMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('jupiter.jpg'),
            shininess: 10
        });
        const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
        jupiter.castShadow = true;
        jupiter.receiveShadow = true;
        jupiterGroup.add(jupiter);

        // --- 4. Jupiter's Ring System (Thin Particle Ring) ---
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
            const y = (Math.random() - 0.5) * 0.02; // Very slight vertical spread

            ringPositions.push(x, y, z);

            // Jupiter's rings are dusty/dark, mostly reddish/grey
            const color = new THREE.Color();
            if (Math.random() > 0.5) {
                color.setHex(0x8a7e72); // Dusty grey-brown
            } else {
                color.setHex(0x5e544a); // Darker dust
            }

            // Add some transparency variation simulated by darkening color
            const opacity = 0.3 + Math.random() * 0.4;
            color.multiplyScalar(opacity);

            ringColors.push(color.r, color.g, color.b);

            // Very small particles
            ringSizes.push(0.002 + Math.random() * 0.003);
        }

        ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringPositions, 3));
        ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(ringColors, 3));
        ringGeometry.setAttribute('size', new THREE.Float32BufferAttribute(ringSizes, 1));

        const ringMaterial = new THREE.PointsMaterial({
            size: 0.003,
            vertexColors: true,
            transparent: true,
            opacity: 0.4, // Faint overall
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const jupiterRing = new THREE.Points(ringGeometry, ringMaterial);
        // Rotate to be flat (perpendicular to Y axis) in the group's local space
        // Since points are XZ, we might need to orient them if the group handles axial tilt.
        // Jupiter group is tilted Z=3.1deg. The points are XZ, so they form a ring around Y.
        // However, standard rings are usually equatorial.
        // Let's assume standard XZ plane is equatorial for this group.
        // But usually geometry needs to be rotated X=90 to be flat if logic assumes XY.
        // Here we built on XZ, so no extra rotation needed relative to planet equator.
        jupiterGroup.add(jupiterRing);


        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 3, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0xc88b3a, 0.8);
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
            setRotationSpeed(jupiterRotationSpeed / 2);
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
            if (!isMouseDown && autoRotate) targetRotationY += jupiterRotationSpeed;

            jupiterGroup.rotation.y += (targetRotationY - jupiterGroup.rotation.y) * 0.05;
            jupiterGroup.rotation.x += (targetRotationX - jupiterGroup.rotation.x) * 0.05;

            // Rotate Ring
            jupiterRing.rotation.y -= ringRotationSpeed;

            // Rotate Starfields and Background
            stars.rotation.y -= 0.0008;
            backgroundSphere.rotation.y -= 0.0008;

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
            jupiterGeometry.dispose();
            jupiterMaterial.dispose();
            starGeometry.dispose();
            starMaterial.dispose();
            bgGeometry.dispose();
            bgMaterial.dispose();
            galaxyGeometry.dispose();
            galaxyMaterial.dispose();
            ringGeometry.dispose();
            ringMaterial.dispose();
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

            {/* Background Ambience - Warm Orange/Brown tones for Jupiter */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-70"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-70"></div>

            {/* Grid Overlay - subtle texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-t-orange-500 rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-12 h-12 bg-orange-500/10 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-orange-500 font-mono tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Telemetry...</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Jupiter;