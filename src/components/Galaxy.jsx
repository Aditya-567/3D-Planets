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

// Helper to generate a soft glow texture for stars
const getTexture = (THREE) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};

// Helper to generate a CORE texture that fades after 70%
const getCoreTexture = (THREE) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);

    // Core remains bright/solid until 70%
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)'); // Start fading here
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent at edge

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};

// Reusable Control Card Component
const ControlCard = ({ label, value, children }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
        <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-white transition-colors">
                {label}
            </label>
            {value !== undefined && (
                <span className="text-xs font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                    {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value.toString()}
                </span>
            )}
        </div>
        {children}
    </div>
);

// Toggle Switch Component
const Toggle = ({ checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 flex items-center bg-gray-600 rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-blue-600' : 'bg-gray-700'}`}
    >
        <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
);

const Galaxy = ({
    stars = 100000,
    radius = 5.4,
    arms = 4,
    coreSize = 1.6,
    spinCurvature = 1.8,
    randomness = 0.36,
    innerColor = '#ffaa60',
    outerColor = '#1b3984',
    starSize = 0.05,
    rotationSpeed = 0.05,
    tilting = { x: 0.9, y: 0 },
    enableOptions = true,
    enableStarsBg = true, // Default Points BG
    movingStarsBg = true, // Default Moving
    enableImageBg = true, // New Prop for Image BG
    top,
    bottom,
    left,
    right,
    className = "",
    style = {}
}) => {
    const mountRef = useRef(null);
    const [isThreeLoaded, setIsThreeLoaded] = useState(false);

    // Initialize parameters state
    const [parameters, setParameters] = useState({
        count: stars,
        size: starSize,
        radius: radius,
        branches: arms,
        spin: spinCurvature,
        randomness: randomness,
        randomnessPower: 3,
        insideColor: innerColor,
        outsideColor: outerColor,
        rotationSpeed: rotationSpeed,
        coreSize: coreSize,
        bgEnabled: enableStarsBg,
        bgMoving: movingStarsBg,
        bgImageEnabled: enableImageBg // New state
    });

    const parametersRef = useRef(parameters);

    useEffect(() => {
        parametersRef.current = parameters;
    }, [parameters]);

    const [showControls, setShowControls] = useState(false);

    // Refs
    const sceneRef = useRef(null);
    const pointsRef = useRef(null);
    const coreRef = useRef(null);
    const bgStarsRef = useRef(null); // Ref for background points
    const bgSphereRef = useRef(null); // Ref for background sphere texture
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const geometryRef = useRef(null);
    const materialRef = useRef(null);
    const frameIdRef = useRef(null);
    const rotation = useRef({ ...tilting });

    // Load Three.js
    useEffect(() => {
        loadThree().then(() => {
            setIsThreeLoaded(true);
        });
    }, []);

    // Sync props to state
    useEffect(() => {
        setParameters(prev => ({
            ...prev,
            count: stars,
            size: starSize,
            radius: radius,
            branches: arms,
            spin: spinCurvature,
            randomness: randomness,
            insideColor: innerColor,
            outsideColor: outerColor,
            rotationSpeed: rotationSpeed,
            coreSize: coreSize,
            bgEnabled: enableStarsBg,
            bgMoving: movingStarsBg,
            bgImageEnabled: enableImageBg
        }));
        if (tilting) {
            rotation.current = { ...tilting };
        }

    }, [
        stars, radius, arms, coreSize, spinCurvature, randomness,
        innerColor, outerColor, starSize, rotationSpeed, tilting?.x, tilting?.y,
        enableOptions, enableStarsBg, movingStarsBg, enableImageBg
    ]);

    // Mouse interaction
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // --- INIT ---
        if (!mountRef.current || !isThreeLoaded) return;

        const THREE = window.THREE;
        const width = mountRef.current.offsetWidth || window.innerWidth;
        const height = mountRef.current.offsetHeight || window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#050508');
        scene.fog = new THREE.FogExp2('#050508', 0.04);
        sceneRef.current = scene;

        // Increased far plane to 10000 to see background stars
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        camera.position.set(0, 4, 6);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.offsetWidth;
            const h = mountRef.current.offsetHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        const animate = () => {
            const currentParams = parametersRef.current;
            const speed = currentParams.rotationSpeed;

            // Rotate Main Galaxy
            if (pointsRef.current) {
                pointsRef.current.rotation.y += speed * 0.01;
            }
            if (coreRef.current) {
                coreRef.current.rotation.y += speed * 0.01;
            }

            // Rotate Backgrounds (Left to Right)
            if (currentParams.bgMoving) {
                // Rotate points
                if (bgStarsRef.current) {
                    bgStarsRef.current.rotation.y -= 0.0005;
                }
                // Rotate texture sphere
                if (bgSphereRef.current) {
                    bgSphereRef.current.rotation.y -= 0.0002;
                }
            }

            const r = 8;
            const theta = rotation.current.x;
            const phi = rotation.current.y;

            const constrainedTheta = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, theta));

            camera.position.x = r * Math.sin(constrainedTheta) * Math.sin(phi);
            camera.position.y = r * Math.cos(constrainedTheta);
            camera.position.z = r * Math.sin(constrainedTheta) * Math.cos(phi);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            frameIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameIdRef.current);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (geometryRef.current) geometryRef.current.dispose();
            if (materialRef.current) {
                if (materialRef.current.map) materialRef.current.map.dispose();
                materialRef.current.dispose();
            }

            // Dispose background sphere
            if (bgSphereRef.current) {
                if (bgSphereRef.current.material.map) bgSphereRef.current.material.map.dispose();
                bgSphereRef.current.geometry.dispose();
                bgSphereRef.current.material.dispose();
            }
            renderer.dispose();
        };
    }, [isThreeLoaded]);

    // --- GALAXY & BACKGROUND GENERATOR ---
    useEffect(() => {
        if (!sceneRef.current || !isThreeLoaded) return;
        const THREE = window.THREE;

        // --- 1. CLEANUP ---
        if (pointsRef.current) {
            sceneRef.current.remove(pointsRef.current);
            pointsRef.current.geometry.dispose();
            if (pointsRef.current.material.map) pointsRef.current.material.map.dispose();
            pointsRef.current.material.dispose();
        }
        if (coreRef.current) {
            sceneRef.current.remove(coreRef.current);
            // Dispose all children meshes/sprites in the core group
            coreRef.current.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
        }
        if (bgStarsRef.current) {
            sceneRef.current.remove(bgStarsRef.current);
            bgStarsRef.current.geometry.dispose();
            if (bgStarsRef.current.material.map) bgStarsRef.current.material.map.dispose();
            bgStarsRef.current.material.dispose();
            bgStarsRef.current = null;
        }
        // Cleanup background sphere if disabled or re-created
        if (bgSphereRef.current) {
            sceneRef.current.remove(bgSphereRef.current);
            bgSphereRef.current.geometry.dispose();
            if (bgSphereRef.current.material.map) bgSphereRef.current.material.map.dispose();
            bgSphereRef.current.material.dispose();
            bgSphereRef.current = null;
        }


        // --- 2. MAIN GALAXY ---
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);
        const scales = new Float32Array(parameters.count * 1);

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);
        const whiteColor = new THREE.Color('#ffffff');

        const coreInfluenceRadius = parameters.coreSize * 1.5;

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;

            const radius = Math.random() * parameters.radius;
            const spinAngle = radius * parameters.spin;
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

            positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY * 0.5;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            let mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);

            const radiusRatio = radius / parameters.radius;
            if (radiusRatio > 0.7) {
                const fadeFactor = (radiusRatio - 0.7) * (1 / 0.3);
                mixedColor.lerp(new THREE.Color('#000000'), fadeFactor);
            }

            if (radius < coreInfluenceRadius) {
                const t = radius / coreInfluenceRadius;
                if (t < 0.7) {
                    mixedColor = whiteColor;
                } else {
                    const fadeT = (t - 0.7) / 0.3;
                    mixedColor = new THREE.Color().copy(whiteColor).lerp(colorInside, fadeT);
                }
            }

            colors[i3 + 0] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            scales[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

        geometryRef.current = geometry;

        const particleTexture = getTexture(THREE);
        const coreTexture = getCoreTexture(THREE);

        const material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            map: particleTexture
        });

        materialRef.current = material;

        const points = new THREE.Points(geometry, material);
        pointsRef.current = points;
        sceneRef.current.add(points);

        // --- 3. CORE STRUCTURE ---
        const coreGroup = new THREE.Group();
        sceneRef.current.add(coreGroup);
        coreRef.current = coreGroup;

        const barGeometry = new THREE.PlaneGeometry(1, 1);
        const barMaterial = new THREE.MeshBasicMaterial({
            map: coreTexture,
            color: new THREE.Color(parameters.insideColor),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
            opacity: 0.5
        });
        const barMesh = new THREE.Mesh(barGeometry, barMaterial);
        barMesh.rotation.x = -Math.PI / 2;
        barMesh.scale.set(parameters.coreSize * 4, parameters.coreSize * 2, 1);
        coreGroup.add(barMesh);

        const nucleusMaterial = new THREE.SpriteMaterial({
            map: coreTexture,
            color: new THREE.Color('#ffffff'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 1.0
        });
        const nucleusSprite = new THREE.Sprite(nucleusMaterial);
        nucleusSprite.scale.set(parameters.coreSize * 1.5, parameters.coreSize * 1.5, 1);
        coreGroup.add(nucleusSprite);

        // --- 4. BACKGROUND STARS (Procedural Points) ---
        if (parameters.bgEnabled) {
            const bgCount = 20000;
            const bgGeometry = new THREE.BufferGeometry();
            const bgPositions = new Float32Array(bgCount * 3);
            const bgColors = new Float32Array(bgCount * 3);

            for (let i = 0; i < bgCount; i++) {
                const r = 16 + Math.random() * 20;
                const theta = 2 * Math.PI * Math.random();
                const phi = Math.acos(2 * Math.random() - 1);

                bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                bgPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                bgPositions[i * 3 + 2] = r * Math.cos(phi);

                const starType = Math.random();
                const c = new THREE.Color();
                if (starType > 0.9) c.setHex(0xaaaaff);
                else if (starType > 0.6) c.setHex(0xffffee);
                else c.setHex(0xffffff);

                bgColors[i * 3] = c.r;
                bgColors[i * 3 + 1] = c.g;
                bgColors[i * 3 + 2] = c.b;
            }

            bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
            bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

            const bgMaterial = new THREE.PointsMaterial({
                size: 0.15,
                sizeAttenuation: true,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                map: particleTexture,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const bgPoints = new THREE.Points(bgGeometry, bgMaterial);
            bgPoints.renderOrder = -1; // Ensure procedural stars are behind galaxy
            sceneRef.current.add(bgPoints);
            bgStarsRef.current = bgPoints;
        }

        // --- 5. BACKGROUND SPHERE (Image Texture) ---
        if (parameters.bgImageEnabled) {
            const textureLoader = new THREE.TextureLoader();
            const bgSphereGeometry = new THREE.SphereGeometry(4000, 64, 64);
            const bgSphereTexture = textureLoader.load('8k_stars.png');
            const bgSphereMaterial = new THREE.MeshBasicMaterial({
                map: bgSphereTexture,
                side: THREE.BackSide,
                transparent: true,
                opacity: 1, // Increased from 0.6 to 1 to fix dullness
                depthWrite: false,
                fog: false
            });
            const backgroundSphere = new THREE.Mesh(bgSphereGeometry, bgSphereMaterial);
            backgroundSphere.renderOrder = -2; // Ensure background image is behind everything
            sceneRef.current.add(backgroundSphere);
            bgSphereRef.current = backgroundSphere;
        }

    }, [parameters, isThreeLoaded]);


    // --- HANDLERS ---
    const handleMouseDown = (e) => {
        isDragging.current = true;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const deltaMove = {
            x: e.clientX - previousMousePosition.current.x,
            y: e.clientY - previousMousePosition.current.y
        };
        rotation.current.y -= deltaMove.x * 0.005;
        rotation.current.x -= deltaMove.y * 0.005;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDragging.current = false; };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            isDragging.current = true;
            previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    const handleTouchMove = (e) => {
        if (!isDragging.current || e.touches.length !== 1) return;
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.current.x,
            y: e.touches[0].clientY - previousMousePosition.current.y
        };
        rotation.current.y -= deltaMove.x * 0.005;
        rotation.current.x -= deltaMove.y * 0.005;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    const updateParam = (key, value) => {
        setParameters(prev => ({ ...prev, [key]: value }));
    };

    const containerStyle = {
        position: (top || bottom || left || right) ? 'absolute' : 'relative',
        top: top,
        bottom: bottom,
        left: left,
        right: right,
        ...style
    };

    return (
        <div className={`w-full h-screen  overflow-hidden font-sans ${className}`} style={containerStyle}>
            <style>{`
        .glassy-scrollbar::-webkit-scrollbar {
          width: 8px; 
        }
        .glassy-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 99px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .glassy-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 99px;
          border: 2px solid rgba(0,0,0,0);
          background-clip: content-box;
        }
        .glassy-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
          background-clip: content-box;
        }
        
        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          cursor: pointer;
          margin-top: -6px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
      `}</style>

            <div
                ref={mountRef}
                className="w-full h-full cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
            />

            {!isThreeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-white/50 animate-pulse font-mono text-sm">Loading Physics Engine...</p>
                </div>
            )}

            {enableOptions && (
                <>
                    <div className={`absolute top-[12%] right-6 h-[calc(100vh-11rem)] w-[350px] transition-all duration-500 ease-out ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>

                        <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden">


                            <div className="flex-1 overflow-y-auto glassy-scrollbar p-4 space-y-3">

                                <ControlCard label="Environment">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-white/70">Bg Stars (Points)</span>
                                        <Toggle
                                            checked={parameters.bgEnabled}
                                            onChange={(val) => updateParam('bgEnabled', val)}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-white/70">Bg Image (Sphere)</span>
                                        <Toggle
                                            checked={parameters.bgImageEnabled}
                                            onChange={(val) => updateParam('bgImageEnabled', val)}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-white/70">Moving Background</span>
                                        <Toggle
                                            checked={parameters.bgMoving}
                                            onChange={(val) => updateParam('bgMoving', val)}
                                        />
                                    </div>
                                </ControlCard>

                                <ControlCard label="Stars Count" value={parameters.count}>
                                    <input
                                        type="range" min="1000" max="200000" step="1000"
                                        value={parameters.count}
                                        onChange={(e) => updateParam('count', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Radius of Galaxy" value={parameters.radius}>
                                    <input
                                        type="range" min="1" max="20" step="0.1"
                                        value={parameters.radius}
                                        onChange={(e) => updateParam('radius', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Arms of Galaxy" value={parameters.branches}>
                                    <input
                                        type="range" min="2" max="10" step="1"
                                        value={parameters.branches}
                                        onChange={(e) => updateParam('branches', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Core Size" value={parameters.coreSize}>
                                    <input
                                        type="range" min="0" max="5" step="0.1"
                                        value={parameters.coreSize}
                                        onChange={(e) => updateParam('coreSize', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Spin Curvature" value={parameters.spin}>
                                    <input
                                        type="range" min="-5" max="5" step="0.1"
                                        value={parameters.spin}
                                        onChange={(e) => updateParam('spin', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Randomness" value={parameters.randomness}>
                                    <input
                                        type="range" min="0" max="2" step="0.01"
                                        value={parameters.randomness}
                                        onChange={(e) => updateParam('randomness', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Rotation Speed" value={parameters.rotationSpeed}>
                                    <input
                                        type="range" min="0" max="0.5" step="0.001"
                                        value={parameters.rotationSpeed}
                                        onChange={(e) => updateParam('rotationSpeed', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Star Size" value={parameters.size}>
                                    <input
                                        type="range" min="0.01" max="0.5" step="0.01"
                                        value={parameters.size}
                                        onChange={(e) => updateParam('size', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </ControlCard>

                                <ControlCard label="Colors">
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex-1">
                                            <div className="text-[10px] text-white/50 mb-1 uppercase">Inner</div>
                                            <input
                                                type="color"
                                                value={parameters.insideColor}
                                                onChange={(e) => updateParam('insideColor', e.target.value)}
                                                className="w-full h-8 rounded cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] text-white/50 mb-1 uppercase">Outer</div>
                                            <input
                                                type="color"
                                                value={parameters.outsideColor}
                                                onChange={(e) => updateParam('outsideColor', e.target.value)}
                                                className="w-full h-8 rounded cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </ControlCard>

                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowControls(!showControls)}
                        className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all shadow-lg border border-white/10 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </>
            )}


        </div>
    );
};

export default Galaxy;