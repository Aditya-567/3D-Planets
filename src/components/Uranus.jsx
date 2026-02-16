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

const Uranus = ({
    // Positioning
    top,
    bottom,
    left,
    right,
    className = "",
    style = {},

    // Customization
    uranusSize = 0.65,
    // Rings are thinner and closer than Saturn's
    ringInnerRadius = 0.85,
    ringWidth = 0.25,
    ringParticleCount = 30000, // Uranus rings are faint
    uranusRotationSpeed = 0.0012,
    ringRotationSpeed = 0.0008,
    particleRotationSpeed = 0.008,
    starCount = 8000,
    autoRotate = true
}) => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(uranusRotationSpeed);
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

        // Calculate outer radius
        const ringOuterRadius = ringInnerRadius + ringWidth;

        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Pure Black
        scene.fog = new THREE.FogExp2(0x000000, 0.0003); // Reduced fog for clearer stars

        // Camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 8000);
        // Positioned to see the rings at an angle (matching the reference image)
        camera.position.set(0, 0, 3.2);
        camera.lookAt(0, 0, 0);

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

        // --- 2. GALAXY SPHERE (Nebula particles - Cool Colors for Uranus) ---
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

            // Uranus Theme: Cyans, Teals, and Light Blues
            if (rand > 0.6) col.setHex(0x00ced1); // Dark Turquoise
            else if (rand > 0.3) col.setHex(0x40e0d0); // Turquoise
            else col.setHex(0x4169e1); // Royal Blue

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

        // --- Uranus Group ---
        const uranusGroup = new THREE.Group();
        // Uranus has an extreme axial tilt of ~98 degrees
        uranusGroup.rotation.z = 97.8 * Math.PI / 180;
        scene.add(uranusGroup);

        // Uranus Surface
        const uranusGeometry = new THREE.SphereGeometry(uranusSize, 64, 64);
        const uranusMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('uranus.jpg'),
            shininess: 10
        });
        const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
        uranus.castShadow = true;
        uranus.receiveShadow = true;
        uranusGroup.add(uranus);

        // Uranus Rings - Base Mesh
        // Increased segments to 128 for smoother shadow edges
        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 128);
        const ringMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('uranus_ring.png'),
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            shininess: 5,
            depthWrite: false
        });

        const pos = ringGeometry.attributes.position;
        const uv = ringGeometry.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            const r = Math.sqrt(pos.getX(i) ** 2 + pos.getY(i) ** 2);
            const u = (r - ringInnerRadius) / (ringOuterRadius - ringInnerRadius);
            uv.setXY(i, u, 0.5);
        }

        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.castShadow = true;
        rings.receiveShadow = true;
        uranusGroup.add(rings);

        // --- Particle Ring System (Dark, faint rings) ---
        const particleRingLayers = [];
        const particleGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        for (let i = 0; i < ringParticleCount; i++) {
            const radius = ringInnerRadius + Math.random() * (ringOuterRadius - ringInnerRadius);
            const angle = Math.random() * Math.PI * 2;

            // Generate flat on X-Y plane to match ring orientation (will rotate x=90)
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * 0.01; // Extremely thin vertical spread

            positions.push(x, y, z);

            const color = new THREE.Color();
            // Uranus rings are very dark and narrow (charcoal/blackish)
            const shade = 0.1 + Math.random() * 0.2;
            color.setRGB(shade, shade, shade + 0.05); // Slight bluish tint to dark grey

            colors.push(color.r, color.g, color.b);
            sizes.push(0.002 + Math.random() * 0.003);
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.004,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.NormalBlending, // Normal blending for dark particles
            depthWrite: false,
            sizeAttenuation: true
        });

        const particleRing = new THREE.Points(particleGeometry, particleMaterial);
        particleRing.rotation.x = Math.PI / 2;

        particleRingLayers.push({
            mesh: particleRing,
            speed: particleRotationSpeed
        });
        uranusGroup.add(particleRing);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 3, 5);
        sunLight.castShadow = true;
        // Increased map size for smoother shadows
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.bias = -0.0001; // Bias to prevent acne
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x4fd0e7, 0.8);
        rimLight.position.set(-5, 1, -5);
        scene.add(rimLight);

        setLoading(false);

        // --- Interaction State ---
        let targetRotationX = 0;
        // Initialize Y rotation to ~45 degrees to match the oblique view in the image
        // Since the planet is tilted 98 degrees on Z, rotating Y rotates the "view" of the rings
        let targetRotationY = Math.PI / 4;

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
            setRotationSpeed(uranusRotationSpeed / 2);
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
            if (!isMouseDown && autoRotate) targetRotationY += uranusRotationSpeed;

            uranusGroup.rotation.y += (targetRotationY - uranusGroup.rotation.y) * 0.05;
            uranusGroup.rotation.x += (targetRotationX - uranusGroup.rotation.x) * 0.05;

            rings.rotation.z += ringRotationSpeed;

            // Rotate particle rings
            particleRingLayers.forEach(layer => {
                layer.mesh.rotation.z += layer.speed;
            });

            // Rotate Starfields
            stars.rotation.y -= 0.0009;
            backgroundSphere.rotation.y -= 0.0009;

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
            uranusGeometry.dispose();
            uranusMaterial.dispose();
            ringGeometry.dispose();
            ringMaterial.dispose();
            particleRingLayers.forEach(layer => {
                layer.mesh.geometry.dispose();
                layer.mesh.material.dispose();
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
            className={`relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-cyan-500/30 ${className}`}
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

            {/* Background Ambience - Cool Uranus Colors (Cyan/Blue) */}
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

export default Uranus;