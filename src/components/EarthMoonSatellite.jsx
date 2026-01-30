import React, { useEffect, useRef, useState } from 'react';
import { Globe, MapPin, Navigation, Maximize, RotateCw, Moon, Zap, Layers, ChevronRight, Activity, Wifi, Clock, ArrowUpRight } from 'lucide-react';

const EarthMoonSatellite = () => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(0.0005);
    const [isDragging, setIsDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: 0, long: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [altitude, setAltitude] = useState(408.5); // km

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

    // Live Clock & Altitude Fluctuation
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            setAltitude(prev => prev + (Math.random() * 0.2 - 0.1));
        }, 1000);
        return () => clearInterval(timer);
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
        const starCount = 8000;
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
            // Use spherical coordinates to distribute stars evenly around the scene
            // This ensures infinite rotation without gaps
            const r = 15 + Math.random() * 30; // Radius between 15 and 45 units away
            const theta = 2 * Math.PI * Math.random(); // Azimuth
            const phi = Math.acos(2 * Math.random() - 1); // Elevation

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            starVertices.push(x, y, z);

            // Random star colors (mostly white/blueish)
            const colorType = Math.random();
            if (colorType > 0.9) {
                starColors.push(0.8, 0.8, 1); // Blueish tint
            } else if (colorType > 0.7) {
                starColors.push(1, 0.9, 0.8); // Yellowish tint
            } else {
                starColors.push(1, 1, 1); // White
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

        // --- Diverse Satellite System ---
        const satellites = [];
        const satelliteCount = 60;

        // Satellite Materials
        const goldFoilMat = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100,
            specular: 0xffeaa7
        });
        const solarPanelMat = new THREE.MeshPhongMaterial({
            color: 0x1e3a8a,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.2,
            shininess: 80,
            specular: 0xffffff
        });
        const techGreyMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 50 });
        const silverMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee, shininess: 100, specular: 0xffffff });

        // --- Satellite Generator Functions ---

        const createSatType1 = () => {
            const satGroup = new THREE.Group();
            const busGeom = new THREE.BoxGeometry(0.04, 0.04, 0.06);
            const bus = new THREE.Mesh(busGeom, goldFoilMat);
            satGroup.add(bus);
            const panelGeom = new THREE.BoxGeometry(0.18, 0.06, 0.005);
            const leftPanel = new THREE.Mesh(panelGeom, solarPanelMat);
            leftPanel.position.set(-0.12, 0, 0);
            const rightPanel = new THREE.Mesh(panelGeom, solarPanelMat);
            rightPanel.position.set(0.12, 0, 0);
            const strutGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.26, 8);
            const strut = new THREE.Mesh(strutGeom, techGreyMat);
            strut.rotation.z = Math.PI / 2;
            satGroup.add(leftPanel, rightPanel, strut);
            const dishGeom = new THREE.ConeGeometry(0.02, 0.01, 16, 1, true);
            const dish = new THREE.Mesh(dishGeom, techGreyMat);
            dish.position.set(0, 0.03, 0);
            dish.rotation.x = -Math.PI / 2;
            satGroup.add(dish);
            return satGroup;
        };

        const createSatType2 = () => {
            const satGroup = new THREE.Group();
            const bodyGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 16);
            const body = new THREE.Mesh(bodyGeom, silverMat);
            body.rotation.z = Math.PI / 2;
            satGroup.add(body);
            const capGeom = new THREE.CylinderGeometry(0.026, 0.026, 0.01, 16);
            const cap = new THREE.Mesh(capGeom, techGreyMat);
            cap.rotation.z = Math.PI / 2;
            cap.position.x = 0.04;
            satGroup.add(cap);
            const panelGeom = new THREE.BoxGeometry(0.04, 0.14, 0.005);
            const panel1 = new THREE.Mesh(panelGeom, solarPanelMat);
            panel1.position.set(0, 0, 0.04);
            const panel2 = new THREE.Mesh(panelGeom, solarPanelMat);
            panel2.position.set(0, 0, -0.04);
            const strutGeom = new THREE.CylinderGeometry(0.002, 0.002, 0.08);
            const strut = new THREE.Mesh(strutGeom, techGreyMat);
            strut.rotation.x = Math.PI / 2;
            satGroup.add(panel1, panel2, strut);
            return satGroup;
        };

        const createSatType3 = () => {
            const satGroup = new THREE.Group();
            const bodyGeom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
            const body = new THREE.Mesh(bodyGeom, techGreyMat);
            satGroup.add(body);
            const antGeom = new THREE.CylinderGeometry(0.001, 0.001, 0.15);
            const a1 = new THREE.Mesh(antGeom, silverMat);
            a1.position.set(0.025, 0.025, 0);
            a1.rotation.z = -Math.PI / 4;
            const a2 = new THREE.Mesh(antGeom, silverMat);
            a2.position.set(-0.025, -0.025, 0);
            a2.rotation.z = -Math.PI / 4;
            const a3 = new THREE.Mesh(antGeom, silverMat);
            a3.position.set(-0.025, 0.025, 0);
            a3.rotation.z = Math.PI / 4;
            const a4 = new THREE.Mesh(antGeom, silverMat);
            a4.position.set(0.025, -0.025, 0);
            a4.rotation.z = Math.PI / 4;
            satGroup.add(a1, a2, a3, a4);
            return satGroup;
        };

        // Palette for satellite trails
        const trailPalette = [
            0x06b6d4, // Cyan
            0x10b981, // Emerald
            0x8b5cf6, // Violet
            0x3b82f6, // Blue
            0xf59e0b  // Amber
        ];

        for (let i = 0; i < satelliteCount; i++) {
            const orbitGroup = new THREE.Group();
            orbitGroup.rotation.x = Math.random() * Math.PI * 2;
            orbitGroup.rotation.y = Math.random() * Math.PI * 2;
            orbitGroup.rotation.z = Math.random() * Math.PI * 2; // Randomize start position on orbit
            scene.add(orbitGroup);

            const type = Math.floor(Math.random() * 3);
            let satMesh;

            if (type === 0) satMesh = createSatType1();
            else if (type === 1) satMesh = createSatType2();
            else satMesh = createSatType3();

            satMesh.scale.set(0.15, 0.15, 0.15);

            // Close Atom Orbit Distance
            const distance = 0.72 + Math.random() * 0.12;

            satMesh.position.set(distance, 0, 0);
            satMesh.rotation.z = Math.random() * Math.PI;
            satMesh.rotation.y = Math.random() * Math.PI;

            // --- MOTION TRAIL (Dashed Lines - "Longer Dots & Thin") ---
            const trailGeometry = new THREE.BufferGeometry();
            const trailPositions = [];
            const trailColors = [];
            const segmentCount = 50; // Number of segments (dashes)
            const arcLength = Math.PI * 0.5;

            const dashSize = 0.025; // Length of each dash

            // Pick a random color for this satellite's trail
            const randomColorHex = trailPalette[Math.floor(Math.random() * trailPalette.length)];
            const colorStart = new THREE.Color(randomColorHex);
            const colorEnd = new THREE.Color(0x000000);

            for (let j = 0; j < segmentCount; j++) {
                const ratio = j / (segmentCount - 1);
                const angle = -ratio * arcLength;

                // Start of dash
                const x1 = distance * Math.cos(angle);
                const y1 = distance * Math.sin(angle);
                const z1 = 0;

                // End of dash (slightly behind)
                const x2 = distance * Math.cos(angle - dashSize);
                const y2 = distance * Math.sin(angle - dashSize);
                const z2 = 0;

                trailPositions.push(x1, y1, z1);
                trailPositions.push(x2, y2, z2);

                const fade = Math.pow(1 - ratio, 1.5);
                const r = colorStart.r * fade;
                const g = colorStart.g * fade;
                const b = colorStart.b * fade;

                trailColors.push(r, g, b); // Vertex 1 color
                trailColors.push(r, g, b); // Vertex 2 color
            }

            trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
            trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));

            // LineBasicMaterial renders 1px wide lines (thin)
            const trailMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const trail = new THREE.LineSegments(trailGeometry, trailMaterial);
            orbitGroup.add(trail);

            orbitGroup.add(satMesh);

            satellites.push({
                group: orbitGroup,
                speed: 0.0015 + Math.random() * 0.004,
                mesh: satMesh
            });
        }

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
        moon.position.set(0.9, 0, 0);
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
            if (!isMouseDown) targetRotationY += 0.01;

            earthGroup.rotation.y += (targetRotationY - earthGroup.rotation.y) * 0.05;
            earthGroup.rotation.x += (targetRotationX - earthGroup.rotation.x) * 0.05;
            clouds.rotation.y += 0.004;

            // Starfield slow rotation
            stars.rotation.y -= 0.002;


            // Animate Satellites
            satellites.forEach(sat => {
                sat.group.rotation.z += sat.speed;
                sat.mesh.rotation.x += 0.005;
            });

            moonOrbitGroup.rotation.y += 0.02;
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

            {/* Grid Overlay */}
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

          
            {/* Bottom Control Panel - Expanded */}
            <div className="absolute bottom-8 left-0 w-full px-8 z-10 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-end items-end gap-6">

                    {/* New Event Log */}
                    <div className="hidden lg:block bg-black/40 backdrop-blur-xl border border-white/5 p-4 rounded-lg shadow-xl w-64 pointer-events-auto h-24 overflow-hidden relative">
                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={10} /> System Log
                        </div>
                        <div className="space-y-1">
                            <LogEntry time={currentTime} text="Telemetry sync established" color="text-emerald-400" />
                            <LogEntry time={new Date(currentTime.getTime() - 2000)} text="Satellite uplink active" color="text-blue-400" />
                            <LogEntry time={new Date(currentTime.getTime() - 5000)} text="Solar array efficiency 98%" color="text-slate-400" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                    </div>

                </div>
            </div>

        </div>
    );
};

// --- Subcomponents ---

const LogEntry = ({ time, text, color }) => (
    <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className="text-slate-600">{time.toISOString().split('T')[1].split('.')[0]}</span>
        <span className={color}>{text}</span>
    </div>
);

const NavButton = ({ icon, label, active }) => (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden
    ${active
            ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}>
        {active && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500"></div>}
        {icon}
        <span>{label}</span>
    </button>
);

export default EarthMoonSatellite;