import { Activity, Clock, Globe, Layers, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const EarthwithTower = () => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const rotationSpeedRef = useRef(0.001);
    const [isDragging, setIsDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: 0, long: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());

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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
        const starCount = 3000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const starVertices = [];
        const starColors = [];

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

        // Atmosphere
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

        // --- REALISTIC TOWERS ON LAND ---
        const towerMeshes = [];

        // Materials
        const structureMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 40 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

        // Detailed Tower Mesh Generator
        const createDetailedTower = () => {
            const towerGroup = new THREE.Group();
            // 1. Base (Truss)
            const baseGeom = new THREE.CylinderGeometry(0.0015, 0.004, 0.025, 4);
            const base = new THREE.Mesh(baseGeom, structureMat);
            base.position.y = 0.0125;
            towerGroup.add(base);
            // 2. Mast
            const mastGeom = new THREE.CylinderGeometry(0.0003, 0.0008, 0.04, 4);
            const mast = new THREE.Mesh(mastGeom, structureMat);
            mast.position.y = 0.0325;
            towerGroup.add(mast);
            // 3. Dish
            const dishGeom = new THREE.ConeGeometry(0.0025, 0.0015, 16, 1, true);
            const dish = new THREE.Mesh(dishGeom, structureMat);
            dish.position.set(0, 0.04, 0);
            dish.rotation.x = -Math.PI / 3;
            towerGroup.add(dish);
            // 4. Light
            const lightGeom = new THREE.SphereGeometry(0.0008, 4, 4);
            const light = new THREE.Mesh(lightGeom, glowMat);
            light.position.y = 0.053;
            towerGroup.add(light);
            return towerGroup;
        };

        // List of major land coordinates
        const landLocations = [
            { lat: 40.7128, lon: -74.0060 }, // NYC
            { lat: 51.5074, lon: -0.1278 },  // London
            { lat: 35.6762, lon: 139.6503 }, // Tokyo
            { lat: -33.8688, lon: 151.2093 },// Sydney
            { lat: -22.9068, lon: -43.1729 },// Rio
            { lat: 30.0444, lon: 31.2357 },  // Cairo
            { lat: 19.0760, lon: 72.8777 },  // Mumbai
            { lat: 55.7558, lon: 37.6173 },  // Moscow
            { lat: 39.9042, lon: 116.4074 }, // Beijing
            { lat: 48.8566, lon: 2.3522 },   // Paris
            { lat: -33.9249, lon: 18.4241 }, // Cape Town
            { lat: 1.3521, lon: 103.8198 },  // Singapore
            { lat: 25.2048, lon: 55.2708 },  // Dubai
            { lat: 37.7749, lon: -122.4194 },// SF
            { lat: -12.0464, lon: -77.0428 },// Lima
            { lat: 52.5200, lon: 13.4050 },  // Berlin
            { lat: 13.7563, lon: 100.5018 }, // Bangkok
            { lat: 6.5244, lon: 3.3792 },    // Lagos
            { lat: 43.6532, lon: -79.3832 }, // Toronto
            { lat: 41.0082, lon: 28.9784 },  // Istanbul
            { lat: 19.4326, lon: -99.1332 }, // Mexico City
            { lat: 64.1466, lon: -21.9426 }, // Reykjavik
            { lat: 59.3293, lon: 18.0686 },  // Stockholm
            { lat: 50.4501, lon: 30.5234 },  // Kiev
            { lat: 24.7136, lon: 46.6753 },  // Riyadh
            { lat: 28.6139, lon: 77.2090 },  // New Delhi
            { lat: -6.2088, lon: 106.8456 }, // Jakarta
            { lat: 14.5995, lon: 120.9842 }, // Manila
            { lat: 37.5665, lon: 126.9780 }, // Seoul
            { lat: 31.2304, lon: 121.4737 }, // Shanghai
            { lat: -37.8136, lon: 144.9631 },// Melbourne
            { lat: -36.8485, lon: 174.7633 },// Auckland
            { lat: 21.3069, lon: -157.8583 },// Honolulu
            { lat: 61.2181, lon: -149.9003 },// Anchorage
            { lat: 49.2827, lon: -123.1207 },// Vancouver
            { lat: 41.8781, lon: -87.6298 }, // Chicago
            { lat: 25.7617, lon: -80.1918 }, // Miami
            { lat: 4.7110, lon: -74.0721 },  // Bogota
            { lat: -33.4489, lon: -70.6693 },// Santiago
            { lat: -34.6037, lon: -58.3816 },// Buenos Aires
            { lat: -1.2921, lon: 36.8219 }   // Nairobi
        ];

        const convertLatLngToVector = (lat, lon, radius) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = -radius * Math.sin(phi) * Math.cos(theta);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);
            return new THREE.Vector3(x, y, z);
        };

        landLocations.forEach(loc => {
            const pos = convertLatLngToVector(loc.lat, loc.lon, 0.6);
            const tower = createDetailedTower();

            tower.position.copy(pos);
            tower.lookAt(new THREE.Vector3(0, 0, 0));
            tower.rotateX(-Math.PI / 2);
            tower.position.setLength(0.6);

            earthGroup.add(tower);
            towerMeshes.push(tower);
        });

        // --- Signal Beams (Circular Loops) ---
        const activeSignals = [];
        const signalSpeed = 0.012;
        const trailSegments = 30;

        // Palette from image: Cyan, Orange
        const beamColors = [0x00ffcc, 0xff9900];

        // Create Connection Loops
        const towerCount = towerMeshes.length;
        for (let i = 0; i < towerCount; i++) {
            // Connect to random distant towers to create high loops
            const targets = [
                Math.floor(Math.random() * towerCount),
                Math.floor(Math.random() * towerCount)
            ];

            targets.forEach(targetIdx => {
                if (targetIdx !== i) {
                    const startPos = towerMeshes[i].position.clone();
                    const endPos = towerMeshes[targetIdx].position.clone();
                    const dist = startPos.distanceTo(endPos);

                    // Filter for connections that look good (medium to long distance)
                    if (dist > 0.3 && dist < 1.5) {
                        const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
                        const midLength = midPoint.length();
                        // Lift the arc significantly to make it "circular"
                        midPoint.setLength(midLength + dist * 0.7);

                        const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
                        const colorHex = beamColors[Math.floor(Math.random() * beamColors.length)];
                        const colorObj = new THREE.Color(colorHex);

                        // --- STATIC FAINT LINE (The Loop Path) ---
                        const points = curve.getPoints(50);
                        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                        const lineMat = new THREE.LineBasicMaterial({
                            color: colorHex,
                            transparent: true,
                            opacity: 0.15
                        });
                        const line = new THREE.Line(lineGeom, lineMat);
                        earthGroup.add(line);

                        // --- DOTTED COMET TRAIL ---
                        const trailGeom = new THREE.BufferGeometry();
                        const positions = new Float32Array(trailSegments * 3);
                        const colors = new Float32Array(trailSegments * 3);

                        trailGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                        trailGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

                        const trailMat = new THREE.PointsMaterial({
                            size: 0.008,
                            vertexColors: true,
                            transparent: true,
                            opacity: 1,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false
                        });

                        const signalMesh = new THREE.Points(trailGeom, trailMat);
                        earthGroup.add(signalMesh);

                        activeSignals.push({
                            mesh: signalMesh,
                            curve: curve,
                            progress: Math.random(),
                            color: colorObj
                        });
                    }
                }
            });
        }

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
        let isMouseDown = false;

        const onDocumentMouseDown = (event) => {
            if (event.target.tagName !== 'CANVAS') return;
            event.preventDefault();
            isMouseDown = true;
            setIsDragging(true);
            mouseXOnMouseDown = event.clientX - window.innerWidth / 2;
            mouseYOnMouseDown = event.clientY - window.innerHeight / 2;
            targetRotationXOnMouseDown = targetRotationX;
            targetRotationYOnMouseDown = targetRotationY;
        };

        const onDocumentMouseMove = (event) => {
            if (isMouseDown) {
                mouseX = event.clientX - window.innerWidth / 2;
                mouseY = event.clientY - window.innerHeight / 2;
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
        };

        const onTouchStart = (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                isMouseDown = true;
                setIsDragging(true);
                mouseXOnMouseDown = event.touches[0].pageX - window.innerWidth / 2;
                mouseYOnMouseDown = event.touches[0].pageY - window.innerHeight / 2;
                targetRotationXOnMouseDown = targetRotationX;
                targetRotationYOnMouseDown = targetRotationY;
            }
        }

        const onTouchMove = (event) => {
            if (isMouseDown && event.touches.length === 1) {
                event.preventDefault();
                mouseX = event.touches[0].pageX - window.innerWidth / 2;
                mouseY = event.touches[0].pageY - window.innerHeight / 2;
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

            if (!isMouseDown) {
                targetRotationY += rotationSpeedRef.current;
            }

            earthGroup.rotation.y += (targetRotationY - earthGroup.rotation.y) * 0.05;
            earthGroup.rotation.x += (targetRotationX - earthGroup.rotation.x) * 0.05;
            clouds.rotation.y += 0.0004;
            stars.rotation.y -= 0.0002;

            // Animate Signals (Comet Dotted Trails)
            activeSignals.forEach(signal => {
                signal.progress += signalSpeed;
                if (signal.progress > 1) signal.progress = 0;

                const positions = signal.mesh.geometry.attributes.position.array;
                const colors = signal.mesh.geometry.attributes.color.array;

                for (let i = 0; i < trailSegments; i++) {
                    const offset = i * 0.005;
                    let t = signal.progress - offset;

                    if (t < 0 || t > 1) {
                        // Hide segments out of bounds
                        positions[i * 3] = 0; positions[i * 3 + 1] = 0; positions[i * 3 + 2] = 0;
                        continue;
                    }

                    const point = signal.curve.getPoint(t);
                    positions[i * 3] = point.x;
                    positions[i * 3 + 1] = point.y;
                    positions[i * 3 + 2] = point.z;

                    // Fade tail
                    const alpha = Math.pow(1 - (i / trailSegments), 1.5);

                    colors[i * 3] = signal.color.r * alpha;
                    colors[i * 3 + 1] = signal.color.g * alpha;
                    colors[i * 3 + 2] = signal.color.b * alpha;
                }

                signal.mesh.geometry.attributes.position.needsUpdate = true;
                signal.mesh.geometry.attributes.color.needsUpdate = true;
            });

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

     
            {/* Bottom Control Panel */}
            <div className="absolute bottom-8 left-0 w-full px-8 z-10 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col  justify-end items-end gap-3">

                    {/* Orbital Control Panel */}
                    <div className="bg-black/40 backdrop-blur-xl p-5 shadow-2xl  w-64 pointer-events-auto relative overflow-hidden group  ">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-500/5 border border-cyan-500/20 rounded-md text-green-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-500">
                                <Navigation size={22} />
                            </div>
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Orbital Control</h3>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-mono mb-3">
                                    Sector: <span className="text-green-400 font-bold bg-green-950/30 px-1 rounded">{coordinates.lat}, {coordinates.long}</span>
                                </p>

                                {/* Rotation Speed Slider */}
                                <div className="w-full pr-2">
                                    <div className="flex justify-between text-[9px] text-slate-300 font-mono uppercase mb-1">
                                        <span>Earth Rotation Speed</span>
                                        <span className="text-green-400">{rotationSpeedRef.current && (rotationSpeedRef.current * 1000).toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.02"
                                        step="0.0005"
                                        defaultValue="0.001"
                                        onChange={(e) => rotationSpeedRef.current = parseFloat(e.target.value)}
                                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
                    </div>

                    {/* System Log */}
                    <div className="hidden lg:block bg-black/40 backdrop-blur-xl border border-white/5 p-4 rounded-lg shadow-xl w-64 pointer-events-auto h-24 overflow-hidden relative">
                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={10} /> System Log
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono"><span className="text-slate-600">10:04:27</span><span className="text-emerald-400">Telemetry sync established</span></div>
                            <div className="flex items-center gap-2 text-[10px] font-mono"><span className="text-slate-600">10:04:25</span><span className="text-blue-400">System uplink active</span></div>
                            <div className="flex items-center gap-2 text-[10px] font-mono"><span className="text-slate-600">10:04:22</span><span className="text-slate-400">Grid efficiency 98%</span></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                    </div>

                </div>
            </div>

        </div>
    );
};



export default EarthwithTower;