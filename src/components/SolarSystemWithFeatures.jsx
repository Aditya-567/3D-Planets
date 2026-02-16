import React, { useEffect, useRef, useState } from 'react';
import { Globe, Layers, Activity, Clock, Sun as SunIcon, X, Info, Type, Grid, ArrowLeft, Thermometer, Ruler, Zap, Hash, Eye, EyeOff } from 'lucide-react';

// --- SHARED DATA ---
const CELESTIAL_DATA = [
    { name: "Sun", type: "Star", description: "The star at the center of the Solar System. It provides almost all the energy for life on Earth.", textureImg: "8k_sun.jpg", size: 4.0, distance: 0, speed: 0, orbitColor: 0xffaa00, inclination: 0, node: 0, ecc: 0, moonCount: 0, temp: "5,500°C", radius: "696k km" },
    { name: "Mercury", type: "Planet", description: "Smallest planet, closest to the Sun. It has a solid, cratered surface, much like the Earth's Moon.", textureImg: "mercury.jpg", size: 0.3, distance: 10, speed: 0.04, orbitColor: 0xA5A5A5, inclination: 7.0, node: 48, ecc: 0.25, moonCount: 0, temp: "167°C", radius: "2.4k km" },
    { name: "Venus", type: "Planet", description: "Hottest planet with a thick atmosphere. Venus is similar in structure and size to Earth.", textureImg: "venusmap.jpg", size: 0.5, distance: 13, speed: 0.025, orbitColor: 0xE3BB76, inclination: 3.4, node: 76, ecc: 0.15, moonCount: 0, temp: "464°C", radius: "6.0k km" },
    { name: "Earth", type: "Planet", description: "Our home, the only known planet with life. It is the fifth largest planet in the solar system.", textureImg: "earth_daymap.jpg", size: 0.55, distance: 17, speed: 0.02, orbitColor: 0x2233FF, inclination: 0.0, node: 0, ecc: 0.12, isEarth: true, moonCount: 1, temp: "15°C", radius: "6.3k km" },
    { name: "Mars", type: "Planet", description: "The Red Planet, home to Olympus Mons. Mars is a dusty, cold, desert world with a very thin atmosphere.", textureImg: "marsmap.jpg", size: 0.4, distance: 22, speed: 0.015, orbitColor: 0xDD4422, inclination: 1.8, node: 49, ecc: 0.18, moonCount: 2, temp: "-65°C", radius: "3.3k km" },
    { name: "Jupiter", type: "Gas Giant", description: "Gas giant, largest planet in the system. It is more than twice as massive as all the other planets combined.", textureImg: "jupiter.jpg", size: 2.2, distance: 35, speed: 0.008, orbitColor: 0xD9A066, inclination: 1.3, node: 100, ecc: 0.12, moonCount: 95, temp: "-110°C", radius: "69.9k km" },
    { name: "Saturn", type: "Gas Giant", description: "Known for its spectacular ring system. Saturn is a gas giant with an average radius of about nine and a half times that of Earth.", textureImg: "saturnmap.jpg", size: 1.8, distance: 48, speed: 0.006, orbitColor: 0xF8D789, inclination: 2.5, node: 113, ecc: 0.14, hasRing: true, ringTexture: "saturn_ring.png", moonCount: 146, temp: "-140°C", radius: "58.2k km" },
    { name: "Uranus", type: "Ice Giant", description: "An ice giant that tilts on its side. Uranus is the only planet whose equator is nearly at a right angle to its orbit.", textureImg: "uranus.jpg", size: 1.2, distance: 60, speed: 0.004, orbitColor: 0x66CCFF, inclination: 0.8, node: 74, ecc: 0.05, hasRing: true, ringTexture: "uranus_ring.png", moonCount: 27, temp: "-195°C", radius: "25.3k km" },
    { name: "Neptune", type: "Ice Giant", description: "The most distant major planet. Neptune is dark, cold, and whipped by supersonic winds.", textureImg: "neptune.jpg", size: 1.2, distance: 74, speed: 0.003, orbitColor: 0x3333AA, inclination: 1.8, node: 131, ecc: 0.08, moonCount: 14, temp: "-200°C", radius: "24.6k km" },
    { name: "Pluto", type: "Dwarf Planet", description: "The most famous dwarf planet. Pluto is a complex world of ice mountains and frozen plains.", textureImg: "plutomap.jpg", size: 0.8, distance: 85, speed: 0.002, orbitColor: 0x9ca6b7, inclination: 17.2, node: 110, ecc: 0.3, moonCount: 5, temp: "-225°C", radius: "1.1k km" },
    { name: "Ceres", type: "Dwarf Planet", description: "Largest object in the asteroid belt. Ceres was the first object considered to be an asteroid.", textureImg: "ceresmap.jpg", size: 0.7, distance: 26, speed: 0.009, orbitColor: 0x888888, inclination: 10.6, node: 80, ecc: 0.08, moonCount: 0, temp: "-105°C", radius: "473 km" },
    { name: "Haumea", type: "Dwarf Planet", description: "Oval shaped fast-rotating dwarf planet located in the Kuiper Belt.", textureImg: "haumeamap.jpg", size: 0.6, distance: 92, speed: 0.0012, orbitColor: 0xaaaaaa, inclination: 28.0, node: 122, ecc: 0.19, moonCount: 2, temp: "-241°C", radius: "816 km" },
    { name: "Makemake", type: "Dwarf Planet", description: "Icy world in the Kuiper Belt. It is the second-brightest object in the Kuiper Belt as seen from Earth.", textureImg: "makemakemap.jpg", size: 0.6, distance: 98, speed: 0.0010, orbitColor: 0xaaaaaa, inclination: 29.0, node: 79, ecc: 0.16, moonCount: 1, temp: "-239°C", radius: "715 km" },
    { name: "Eris", type: "Dwarf Planet", description: "Massive dwarf planet in the scattered disc. It is one of the largest known dwarf planets in our solar system.", textureImg: "erismap.jpg", size: 0.62, distance: 110, speed: 0.0008, orbitColor: 0xaaaaaa, inclination: 44.0, node: 135, ecc: 0.44, moonCount: 1, temp: "-243°C", radius: "1.1k km" }
];

const GlobeApp = () => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);

    // Camera & Interaction Refs
    const targetDistanceRef = useRef(280);
    const currentDistanceRef = useRef(280);
    const rotationSpeedRef = useRef(0.001);
    const cameraRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const frameIdRef = useRef(null);
    const solarSystemGroupRef = useRef(null);
    const raycasterRef = useRef(null);
    const mouseRef = useRef(null);

    // State
    const [isDragging, setIsDragging] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeView, setActiveView] = useState("SYSTEM"); // 'SYSTEM' or 'BODIES'
    const [selectedBody, setSelectedBody] = useState(null);
    const [showLabels, setShowLabels] = useState(true);

    // Sync state to ref for animation loop
    const showLabelsRef = useRef(showLabels);
    useEffect(() => { showLabelsRef.current = showLabels; }, [showLabels]);

    const selectedBodyRef = useRef(selectedBody);
    useEffect(() => { selectedBodyRef.current = selectedBody; }, [selectedBody]);

    // Sync view state with Three.js visibility
    useEffect(() => {
        if (solarSystemGroupRef.current) {
            // Toggle solar system visibility based on view mode
            solarSystemGroupRef.current.visible = (activeView === "SYSTEM");
        }
    }, [activeView]);

    // Load Three.js dynamically
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

        return () => {
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            if (rendererRef.current && mountRef.current) {
                // Safe cleanup to avoid context loss issues during hot reload
                try {
                    mountRef.current.removeChild(rendererRef.current.domElement);
                    rendererRef.current.dispose();
                } catch (e) {
                    console.log("Cleanup warning:", e);
                }
            }
        };
    }, []);

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const initThree = () => {
        if (!window.THREE) return;
        if (rendererRef.current) return; // Prevent double init

        const THREE = window.THREE;

        // --- HELPER FUNCTIONS ---
        const getPlanetPosition = (angle, xRadius, zRadius, inclination, node, centerX) => {
            const flatX = Math.cos(angle) * xRadius;
            const flatZ = Math.sin(angle) * zRadius;
            const shiftedX = flatX + centerX;
            const pos = new THREE.Vector3(shiftedX, 0, flatZ);
            pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), inclination);
            pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), node);
            return pos;
        };

        const createGlowTexture = (colorHex) => {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            const c = new THREE.Color(colorHex);
            const r = Math.floor(c.r * 255);
            const g = Math.floor(c.g * 255);
            const b = Math.floor(c.b * 255);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
            gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.5)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(canvas);
        };

        const createTextLabel = (text) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 128;
            context.font = 'Bold 48px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.shadowBlur = 10;
            context.shadowColor = 'rgba(0, 0, 0, 1.0)';
            context.lineWidth = 3;
            context.strokeStyle = 'black';
            context.strokeText(text.toUpperCase(), 256, 64);
            context.fillStyle = 'white';
            context.fillText(text.toUpperCase(), 256, 64);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(20, 5, 1);
            return sprite;
        };

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.0003);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 140, 280);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        // Raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        raycasterRef.current = raycaster;
        mouseRef.current = mouse;

        if (mountRef.current) {
            mountRef.current.innerHTML = ''; // Clear previous canvas
            mountRef.current.appendChild(renderer.domElement);
        }

        const textureLoader = new THREE.TextureLoader();

        // --- VARIABLES FOR ANIMATION ---
        // Explicitly declaring all variables here for scope access in animate()
        let sunMesh, sunCorona, sunBloom, sunBrightGlow, sunFlare, sunLabel;
        let asteroidBelt, kuiperBelt, backgroundSphere, stars, galaxyDome;
        let planetObjects = [];

        // Groups
        let backgroundGroup = new THREE.Group();
        scene.add(backgroundGroup);

        let solarSystemGroup = new THREE.Group();
        scene.add(solarSystemGroup);
        solarSystemGroupRef.current = solarSystemGroup;

        // --- 1. BACKGROUND ---
        const bgGeometry = new THREE.SphereGeometry(3000, 64, 64);
        const bgTexture = textureLoader.load('8k_stars.png');
        const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture, side: THREE.BackSide, transparent: true, opacity: 0.6, depthWrite: false });
        backgroundSphere = new THREE.Mesh(bgGeometry, bgMaterial);
        backgroundGroup.add(backgroundSphere);

        // --- 2. STARFIELD ---
        const starCount = 6000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.9 });
        const starVertices = [], starColors = [], starBaseColors = [], starBlinkParams = [];
        for (let i = 0; i < starCount; i++) {
            const r = 500 + Math.random() * 1500;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta), y = r * Math.sin(phi) * Math.sin(theta), z = r * Math.cos(phi);
            starVertices.push(x, y, z);
            const col = new THREE.Color();
            const colorType = Math.random();
            if (colorType > 0.9) col.setHSL(0.6, 0.8, 0.8);
            else if (colorType > 0.7) col.setHSL(0.1, 0.8, 0.8);
            else col.setHSL(0, 0, 1);
            starColors.push(col.r, col.g, col.b);
            starBaseColors.push(col.r, col.g, col.b);
            starBlinkParams.push({ speed: 0.5 + Math.random() * 2.0, offset: Math.random() * Math.PI * 2 });
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        stars = new THREE.Points(starGeometry, starMaterial);
        backgroundGroup.add(stars);

        // --- 3. GALAXY SPHERE ---
        const galaxyCount = 20000;
        const galaxyGeometry = new THREE.BufferGeometry();
        const galaxyMaterial = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        const galaxyVertices = [], galaxyColors = [];
        for (let i = 0; i < galaxyCount; i++) {
            const r = 2500 + Math.random() * 1000;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta), y = r * Math.sin(phi) * Math.sin(theta), z = r * Math.cos(phi);
            galaxyVertices.push(x, y, z);
            const col = new THREE.Color();
            const rand = Math.random();
            if (rand > 0.6) col.setHex(0x8a2be2); else if (rand > 0.3) col.setHex(0x00ced1); else col.setHex(0x4169e1);
            const intensity = 0.3 + Math.random() * 0.7;
            col.multiplyScalar(intensity);
            galaxyColors.push(col.r, col.g, col.b);
        }
        galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyVertices, 3));
        galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));
        galaxyDome = new THREE.Points(galaxyGeometry, galaxyMaterial);
        backgroundGroup.add(galaxyDome);

        // --- REALISTIC SUN ---
        const sunGeometry = new THREE.SphereGeometry(4.0, 64, 64);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('8k_sun.jpg'), color: 0xffffff });
        sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.userData = CELESTIAL_DATA[0];
        solarSystemGroup.add(sunMesh);

        sunLabel = createTextLabel("Sun");
        sunLabel.position.y = 8;
        solarSystemGroup.add(sunLabel);

        sunCorona = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(0xff4500), color: 0xff4500, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
        sunCorona.scale.set(13, 13, 1); solarSystemGroup.add(sunCorona);
        sunBloom = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(0xffaa00), color: 0xffaa00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
        sunBloom.scale.set(22, 22, 1); solarSystemGroup.add(sunBloom);
        sunBrightGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(0xffffee), color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
        sunBrightGlow.scale.set(10, 10, 1); solarSystemGroup.add(sunBrightGlow);
        sunFlare = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureLoader.load('lensflare0.png'), color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.8, depthWrite: false }));
        sunFlare.scale.set(40, 40, 1.0); solarSystemGroup.add(sunFlare);

        const sunLight = new THREE.PointLight(0xffffff, 2.5, 1500);
        solarSystemGroup.add(sunLight);
        scene.add(new THREE.AmbientLight(0x222222));

        // --- ASTEROID BELT ---
        const asteroidCount = 1500;
        const asteroidGeom = new THREE.DodecahedronGeometry(0.08, 0);
        const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8, metalness: 0.1, flatShading: true });
        const asteroidMeshInstanced = new THREE.InstancedMesh(asteroidGeom, asteroidMat, asteroidCount);
        const dummy = new THREE.Object3D();
        const instColor = new THREE.Color();
        for (let i = 0; i < asteroidCount; i++) {
            const r = 29 + Math.random() * 7, theta = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 2.0;
            dummy.position.set(r * Math.cos(theta), y, r * Math.sin(theta));
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scale = 0.5 + Math.random() * 1.5;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            asteroidMeshInstanced.setMatrixAt(i, dummy.matrix);
            const shade = 0.5 + Math.random() * 0.3;
            if (Math.random() > 0.8) instColor.setRGB(shade + 0.1, shade, shade - 0.1);
            else instColor.setRGB(shade, shade, shade);
            asteroidMeshInstanced.setColorAt(i, instColor);
        }
        asteroidMeshInstanced.instanceMatrix.needsUpdate = true;
        asteroidMeshInstanced.instanceColor.needsUpdate = true;
        asteroidMeshInstanced.rotation.z = 2 * (Math.PI / 180);
        asteroidMeshInstanced.rotation.x = 1 * (Math.PI / 180);
        asteroidBelt = asteroidMeshInstanced;
        solarSystemGroup.add(asteroidBelt);

        // --- KUIPER BELT ---
        const kuiperCount = 6000;
        const kuiperGeometry = new THREE.BufferGeometry();
        const kuiperMaterial = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.6 });
        const kuiperVertices = [], kuiperColors = [];
        for (let i = 0; i < kuiperCount; i++) {
            const r = 90 + Math.random() * 50, theta = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 5.0;
            kuiperVertices.push(r * Math.cos(theta), y, r * Math.sin(theta));
            const variation = Math.random() * 0.2;
            const bCol = new THREE.Color(0xaaccff);
            kuiperColors.push(bCol.r + variation, bCol.g + variation, bCol.b + variation);
        }
        kuiperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(kuiperVertices, 3));
        kuiperGeometry.setAttribute('color', new THREE.Float32BufferAttribute(kuiperColors, 3));
        kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
        kuiperBelt.rotation.z = 1.5 * (Math.PI / 180);
        kuiperBelt.rotation.x = 0.5 * (Math.PI / 180);
        solarSystemGroup.add(kuiperBelt);

        // --- BUILD PLANETS ---
        CELESTIAL_DATA.forEach(data => {
            if (data.name === "Sun") return;

            const inclinationRad = data.inclination * (Math.PI / 180);
            const nodeRad = data.node * (Math.PI / 180);
            const a = data.distance, e = data.ecc, b = a * Math.sqrt(1 - (e * e)), c = a * e;

            // Static Orbit
            const orbitCurve = new THREE.EllipseCurve(c, 0, a, b, 0, 2 * Math.PI, false, 0);
            const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(250));
            orbitGeom.rotateX(Math.PI / 2); orbitGeom.rotateZ(inclinationRad); orbitGeom.rotateY(nodeRad);
            solarSystemGroup.add(new THREE.Line(orbitGeom, new THREE.LineBasicMaterial({ color: data.orbitColor, transparent: true, opacity: 0.15 })));

            // Trail
            const trailGeom = new THREE.BufferGeometry();
            const tLen = 150, tPos = new Float32Array(tLen * 3), tCol = new Float32Array(tLen * 3);
            const bColor = new THREE.Color(data.orbitColor);
            for (let i = 0; i < tLen; i++) {
                const alpha = Math.pow(1 - (i / tLen), 2);
                tCol[i * 3] = bColor.r * alpha; tCol[i * 3 + 1] = bColor.g * alpha; tCol[i * 3 + 2] = bColor.b * alpha;
            }
            trailGeom.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
            trailGeom.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
            const trailLine = new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, linewidth: 2 }));
            solarSystemGroup.add(trailLine);

            // Planet Mesh
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 32, 32), new THREE.MeshPhongMaterial({ map: textureLoader.load(data.textureImg), specular: new THREE.Color(0x333333), shininess: 10 }));
            mesh.userData = data;
            if (data.name === "Haumea") mesh.scale.set(1.5, 0.75, 0.75);
            solarSystemGroup.add(mesh);

            // Label
            const label = createTextLabel(data.name);
            scene.add(label);

            // Rings
            if (data.hasRing && data.ringTexture) {
                const ringGeom = new THREE.RingGeometry(data.size * 1.4, data.size * 2.5, 64);
                const ringTex = textureLoader.load(data.ringTexture);
                const pos = ringGeom.attributes.position;
                const v3 = new THREE.Vector3();
                for (let i = 0; i < pos.count; i++) {
                    v3.fromBufferAttribute(pos, i);
                    ringGeom.attributes.uv.setXY(i, v3.length() < (data.size * 1.8) ? 0 : 1, 1);
                }
                const ringMat = new THREE.MeshPhongMaterial({ map: ringTex, color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8, emissive: 0x111111, emissiveIntensity: 0.2 });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ring.rotation.x = Math.PI / 2; ring.rotation.y = -0.2;
                mesh.add(ring);
            }

            // Moons
            const moonsGroup = new THREE.Group();
            solarSystemGroup.add(moonsGroup);
            const moons = [];
            if (data.moonCount > 0) {
                for (let m = 0; m < data.moonCount; m++) {
                    const moonDist = data.size * 1.5 + Math.random() * 1.5 + (m * 0.5);
                    const orbitSpeed = 0.02 + Math.random() * 0.05;
                    const tiltX = (Math.random() - 0.5) * 1.0; const tiltZ = (Math.random() - 0.5) * 1.0;
                    const orbitContainer = new THREE.Group();
                    orbitContainer.rotation.x = tiltX; orbitContainer.rotation.z = tiltZ;
                    moonsGroup.add(orbitContainer);

                    const moonOrbitGeom = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, moonDist, moonDist, 0, 2 * Math.PI).getPoints(64));
                    moonOrbitGeom.rotateX(Math.PI / 2);
                    orbitContainer.add(new THREE.Line(moonOrbitGeom, new THREE.LineBasicMaterial({ color: 0x88aabb, transparent: true, opacity: 0.1 })));

                    const moonRotator = new THREE.Group();
                    orbitContainer.add(moonRotator);
                    const moonSize = data.size * 0.15 + Math.random() * 0.1;
                    const moonGeom = new THREE.SphereGeometry(moonSize, 8, 8);
                    let moonMat = (data.name === "Earth" && m === 0) ? new THREE.MeshPhongMaterial({ map: textureLoader.load('moonmap.jpg'), shininess: 5 }) : new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 2 });
                    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
                    moonMesh.position.set(moonDist, 0, 0);
                    moonRotator.add(moonMesh);

                    const mtPos = new Float32Array(30 * 3), mtCol = new Float32Array(30 * 3), mtColor = new THREE.Color(0xffffff);
                    for (let k = 0; k < 30; k++) {
                        const alpha = Math.pow(1 - (k / 30), 2);
                        mtCol[k * 3] = mtColor.r * alpha; mtCol[k * 3 + 1] = mtColor.g * alpha; mtCol[k * 3 + 2] = mtColor.b * alpha;
                    }
                    const mtGeom = new THREE.BufferGeometry();
                    mtGeom.setAttribute('position', new THREE.BufferAttribute(mtPos, 3));
                    mtGeom.setAttribute('color', new THREE.BufferAttribute(mtCol, 3));
                    const moonTrailLine = new THREE.Line(mtGeom, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
                    orbitContainer.add(moonTrailLine);
                    moons.push({ rotator: moonRotator, mesh: moonMesh, trail: moonTrailLine, speed: orbitSpeed, angle: Math.random() * Math.PI * 2, dist: moonDist });
                }
            }

            planetObjects.push({
                mesh, trail: trailLine, label, data, moonsGroup, moons,
                angle: Math.random() * Math.PI * 2,
                xRadius: a, zRadius: b, centerOffset: c, inclination: inclinationRad, node: nodeRad
            });
        });

        setLoading(false);

        // --- Interaction ---
        let isMouseDown = false, mouseXOnMouseDown = 0, mouseYOnMouseDown = 0;
        let targetRotationYOnMouseDown = 0, targetRotationXOnMouseDown = 0, targetRotationY = 0, targetRotationX = 0;
        let mouseDownPos = new THREE.Vector2();

        const onDocumentMouseDown = (event) => {
            if (event.target.tagName !== 'CANVAS') return;
            isMouseDown = true; setIsDragging(true);
            mouseXOnMouseDown = event.clientX; mouseYOnMouseDown = event.clientY;
            targetRotationYOnMouseDown = targetRotationY; targetRotationXOnMouseDown = targetRotationX;
            mouseDownPos.set(event.clientX, event.clientY);
        };

        const onDocumentMouseMove = (event) => {
            if (isMouseDown) {
                targetRotationY = targetRotationYOnMouseDown + (event.clientX - mouseXOnMouseDown) * 0.005;
                targetRotationX = targetRotationXOnMouseDown + (event.clientY - mouseYOnMouseDown) * 0.005;
            }
        };

        const onDocumentMouseUp = (event) => {
            isMouseDown = false; setIsDragging(false);
            if (new THREE.Vector2(event.clientX, event.clientY).distanceTo(mouseDownPos) < 5 && cameraRef.current) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

                // Only interact if solar system is visible
                if (solarSystemGroupRef.current && solarSystemGroupRef.current.visible) {
                    const targets = [sunMesh, ...planetObjects.map(p => p.mesh)].filter(Boolean);
                    const intersects = raycasterRef.current.intersectObjects(targets);
                    if (intersects.length > 0) {
                        const obj = intersects[0].object;
                        const data = obj === sunMesh ? CELESTIAL_DATA[0] : obj.userData;
                        setSelectedBody(data);
                    } else {
                        setSelectedBody(null);
                    }
                }
            }
        };

        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('wheel', (e) => {
            targetDistanceRef.current = Math.max(20, Math.min(targetDistanceRef.current + e.deltaY * 0.05, 450));
        }, { passive: false });

        // --- Animation Loop ---
        let cameraTarget = new THREE.Vector3(0, 0, 0);

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (solarSystemGroup) {
                solarSystemGroup.rotation.y += (targetRotationY - solarSystemGroup.rotation.y) * 0.1;
                solarSystemGroup.rotation.x += (targetRotationX - solarSystemGroup.rotation.x) * 0.1;
            }
            if (asteroidBelt) asteroidBelt.rotation.y += 0.0005;
            if (kuiperBelt) kuiperBelt.rotation.y += 0.0002;
            if (backgroundSphere) backgroundSphere.rotation.y -= 0.0004;
            if (stars && stars.rotation) stars.rotation.y -= 0.0001;

            // Twinkle Stars
            if (stars && stars.geometry && stars.geometry.attributes.color) {
                const sColors = stars.geometry.attributes.color.array;
                const time = Date.now() * 0.001;
                for (let i = 0; i < starCount; i++) {
                    const baseR = starBaseColors[i * 3];
                    const baseG = starBaseColors[i * 3 + 1];
                    const baseB = starBaseColors[i * 3 + 2];
                    const twinkle = 0.7 + 0.3 * Math.sin(time * starBlinkParams[i].speed + starBlinkParams[i].offset);
                    sColors[i * 3] = baseR * twinkle;
                    sColors[i * 3 + 1] = baseG * twinkle;
                    sColors[i * 3 + 2] = baseB * twinkle;
                }
                stars.geometry.attributes.color.needsUpdate = true;
            }

            const time = Date.now() * 0.001;
            if (sunMesh) sunMesh.rotation.y += 0.002;
            const pulse = 1 + Math.sin(time * 2) * 0.03;
            if (sunBrightGlow) sunBrightGlow.scale.set(10 * pulse, 10 * pulse, 1);
            if (sunCorona) { sunCorona.scale.set(13 + pulse, 13 + pulse, 1); sunCorona.material.opacity = 0.9 + Math.sin(time * 3) * 0.1; }
            if (sunBloom) sunBloom.scale.set(22 + pulse, 22 + pulse, 1);
            if (sunFlare) { sunFlare.material.rotation -= 0.001; sunFlare.scale.set(45 + Math.sin(time * 1.5) * 2, 45 + Math.sin(time * 1.5) * 2, 1); sunFlare.material.opacity = 0.8 + Math.sin(time * 2) * 0.2; }

            // Update Labels Visibility
            const areLabelsVisible = showLabelsRef.current && solarSystemGroup.visible;
            if (sunLabel) {
                sunLabel.visible = areLabelsVisible;
                const sunPos = new THREE.Vector3().setFromMatrixPosition(sunMesh.matrixWorld);
                sunLabel.position.copy(sunPos).add(new THREE.Vector3(0, 8, 0));
            }

            planetObjects.forEach(obj => {
                obj.angle += obj.data.speed;
                const currentPos = getPlanetPosition(obj.angle, obj.xRadius, obj.zRadius, obj.inclination, obj.node, obj.centerOffset);
                obj.mesh.position.copy(currentPos);
                obj.mesh.rotation.y += 0.02;

                if (obj.label) {
                    obj.label.visible = areLabelsVisible;
                    // Must use world position in case group is rotated
                    const worldPos = new THREE.Vector3().setFromMatrixPosition(obj.mesh.matrixWorld);
                    obj.label.position.copy(worldPos).add(new THREE.Vector3(0, obj.data.size + 4, 0));
                }

                const positions = obj.trail.geometry.attributes.position.array;
                for (let i = 0; i < 150; i++) {
                    const backPos = getPlanetPosition(obj.angle - (i * 0.02), obj.xRadius, obj.zRadius, obj.inclination, obj.node, obj.centerOffset);
                    positions[i * 3] = backPos.x; positions[i * 3 + 1] = backPos.y; positions[i * 3 + 2] = backPos.z;
                }
                obj.trail.geometry.attributes.position.needsUpdate = true;

                if (obj.moonsGroup) {
                    obj.moonsGroup.position.copy(currentPos);
                    obj.moons.forEach(moon => {
                        moon.angle += moon.speed;
                        moon.rotator.rotation.y = moon.angle;
                        const mPos = moon.trail.geometry.attributes.position.array;
                        for (let k = 0; k < 30; k++) {
                            const pa = moon.angle - (k * 0.1), mx = Math.cos(pa) * moon.dist, mz = -Math.sin(pa) * moon.dist;
                            mPos[k * 3] = mx; mPos[k * 3 + 1] = 0; mPos[k * 3 + 2] = mz;
                        }
                        moon.trail.geometry.attributes.position.needsUpdate = true;
                    });
                }
            });

            // Camera Following Logic
            const focused = selectedBodyRef.current;
            let finalTarget = new THREE.Vector3(0, 0, 0);
            let distMult = 1.0;

            if (focused && solarSystemGroup.visible) {
                if (focused.name === "Sun") {
                    finalTarget.set(0, 0, 0);
                    distMult = 0.3;
                } else {
                    const pObj = planetObjects.find(p => p.data.name === focused.name);
                    if (pObj) {
                        pObj.mesh.getWorldPosition(finalTarget);
                        distMult = 0.2;
                    }
                }
            }

            cameraTarget.lerp(finalTarget, 0.05);

            const camX = cameraTarget.x;
            const camY = cameraTarget.y + currentDistanceRef.current * 0.4 * distMult;
            const camZ = cameraTarget.z + currentDistanceRef.current * distMult;

            currentDistanceRef.current += (targetDistanceRef.current - currentDistanceRef.current) * 0.02;

            camera.position.x += (camX - camera.position.x) * 0.05;
            camera.position.y += (camY - camera.position.y) * 0.05;
            camera.position.z += (camZ - camera.position.z) * 0.05;

            camera.lookAt(cameraTarget);
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    const handleBodySelect = (body) => {
        setSelectedBody(body);
        setActiveView("SYSTEM");
    };

    // --- CATALOG RENDERER ---
    const renderCatalog = () => (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-md overflow-y-auto p-10 animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto mt-20">
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Planetary Registry</h2>
                        <p className="text-slate-300 font-mono text-sm mt-1">Select a body to view details</p>
                    </div>
                    <button onClick={() => setActiveView("SYSTEM")} className="text-orange-500 hover:text-white uppercase font-bold text-xs tracking-widest flex items-center gap-2">
                        <X size={16} /> Close Registry
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CELESTIAL_DATA.map((planet) => (
                        <div
                            key={planet.name}
                            onClick={() => handleBodySelect(planet)}
                            className="group bg-black/50 border border-white/10 rounded-xl p-6 hover:bg-black/70 hover:border-orange-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden shadow-lg"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="w-8 h-8 rounded-full shadow-inner" style={{
                                        backgroundColor: `#${planet.orbitColor.toString(16)}`,
                                        background: `radial-gradient(circle at 30% 30%, #fff, #${planet.orbitColor.toString(16)})`
                                    }}></div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 group-hover:text-orange-400 transition-colors">{planet.type}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{planet.name}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-4">{planet.description}</p>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                                <div className="bg-white/5 px-2 py-1 rounded border border-white/5">{planet.moonCount} Moons</div>
                                <div className="bg-white/5 px-2 py-1 rounded border border-white/5">{planet.distance} AU</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-orange-500/30">
            <div ref={mountRef} className="absolute inset-0 z-0 cursor-move" />
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-900/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-2 border-slate-800 rounded-full border-t-orange-500 animate-spin"></div>
                        <p className="text-orange-500 font-mono tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Solar System...</p>
                    </div>
                </div>
            )}

            {/* Catalog Overlay */}
            {activeView === "BODIES" && renderCatalog()}

            {/* Header (Hidden when body selected) */}
            {!selectedBody && (
                <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none ">
                    <div className="w-full mx-auto flex flex-col gap-4 items-end">
                        <div className="hidden md:flex gap-1 pointer-events-auto bg-white/5 p-1 rounded-lg backdrop-blur-md border border-white/5">
                            <NavButton icon={<SunIcon size={16} />} label="System" active={activeView === "SYSTEM" && !selectedBody} onClick={() => { setActiveView("SYSTEM"); setSelectedBody(null); }} />
                            <NavButton icon={<Globe size={16} />} label="Bodies" active={activeView === "BODIES"} onClick={() => setActiveView("BODIES")} />
                            <NavButton
                                icon={showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
                                label={showLabels ? "Hide" : "Show"}
                                active={showLabels}
                                onClick={() => setShowLabels(!showLabels)}
                            />
                        </div>
                        <div className="pointer-events-auto group cursor-default">
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-950/30 border border-orange-900/30">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                    </span>
                                    <span className="text-orange-400/80 text-[10px] font-mono font-bold tracking-widest uppercase">Live Feed</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono tracking-wider">
                                    <Clock size={14} className="text-orange-500" />
                                    <span>{currentTime.toLocaleTimeString([], { hour12: false, timeZoneName: 'short' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Card Overlay (Top-Left) */}
            {selectedBody && activeView === "SYSTEM" && (
                <div className="absolute top-8 left-8 z-30 pointer-events-auto animate-in slide-in-from-left-10 fade-in duration-300">
                    <div className="w-[340px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(255,165,0,0.1)] pointer-events-none" />

                        {/* Header Image Context */}
                        <div className="h-32 w-full relative overflow-hidden bg-black/50">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30"
                                style={{
                                    background: `radial-gradient(circle, #${selectedBody.orbitColor.toString(16)} 0%, transparent 70%)`
                                }}
                            />
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <button onClick={() => setSelectedBody(null)} className="p-1.5 bg-black/50 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-full transition-all border border-white/10">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-6 z-20">
                                <span className="text-[10px] font-mono font-bold text-orange-400 tracking-widest uppercase mb-1 block">Subject Identified</span>
                                <h1 className="text-4xl font-black text-white tracking-tighter uppercase drop-shadow-lg">{selectedBody.name}</h1>
                            </div>
                        </div>

                        <div className="p-6 pt-4">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe size={10} className="text-orange-500" /> {selectedBody.type}
                                </span>
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Activity size={10} className="text-green-500" /> Active Tracking
                                </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-light mb-6">
                                {selectedBody.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Thermometer size={8} /> Surface Temp</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.temp || "N/A"}</div>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Ruler size={8} /> Radius</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.radius || "N/A"}</div>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Zap size={8} /> Orbital Speed</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.speed} km/s</div>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Hash size={8} /> Moons</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.moonCount}</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveView("BODIES")}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Grid size={12} /> Catalog
                                </button>
                                <button
                                    onClick={() => setSelectedBody(null)}
                                    className="flex-1 py-2.5 bg-orange-600/90 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
                                >
                                    <ArrowLeft size={12} /> System View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Card Overlay (Replaces Header when Active) */}
            {selectedBody && activeView === "SYSTEM" ? (
                <div className="absolute top-8 left-8 z-30 pointer-events-auto animate-in slide-in-from-left-10 fade-in duration-300">
                    {/* Enhanced Info Card */}
                    <div className="w-[340px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative group">
                        {/* Holographic Border Effect */}
                        <div className="absolute inset-0 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(255,165,0,0.1)] pointer-events-none" />

                        {/* Header Image / Color Context */}
                        <div className="h-32 w-full relative overflow-hidden bg-black/50">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30"
                                style={{
                                    background: `radial-gradient(circle, #${selectedBody.orbitColor.toString(16)} 0%, transparent 70%)`
                                }}
                            />
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <button onClick={() => setSelectedBody(null)} className="p-1.5 bg-black/50 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-full transition-all border border-white/10">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-6 z-20">
                                <span className="text-[10px] font-mono font-bold text-orange-400 tracking-widest uppercase mb-1 block">Subject Identified</span>
                                <h1 className="text-4xl font-black text-white tracking-tighter uppercase drop-shadow-lg">{selectedBody.name}</h1>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 pt-4">
                            {/* Classification Badge */}
                            <div className="flex items-center gap-3 mb-5">
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe size={10} className="text-orange-500" /> {selectedBody.type}
                                </span>
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Activity size={10} className="text-green-500" /> Active Tracking
                                </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-light mb-6">
                                {selectedBody.description}
                            </p>

                            {/* Data Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Thermometer size={8} /> Surface Temp</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.temp || "N/A"}</div>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Ruler size={8} /> Radius</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.radius || "N/A"}</div>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Zap size={8} /> Orbital Speed</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.speed} km/s</div>
                                </div>
                                <div className=" p-2.5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Hash size={8} /> Moons</div>
                                    <div className="text-sm font-mono font-bold text-white">{selectedBody.moonCount}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveView("BODIES")}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Grid size={12} /> Catalog
                                </button>
                                <button
                                    onClick={() => setSelectedBody(null)}
                                    className="flex-1 py-2.5 bg-orange-600/90 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
                                >
                                    <ArrowLeft size={12} /> System View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Standard Header (Visible when no object selected) */
                <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none ">
                    <div className="w-full mx-auto flex flex-col gap-4 items-end">
                        <div className="hidden md:flex gap-1 pointer-events-auto  p-1 rounded-lg  border border-white/5">
                            <NavButton icon={<SunIcon size={16} />} label="System" active={activeView === "SYSTEM" && !selectedBody} onClick={() => { setActiveView("SYSTEM"); setSelectedBody(null); }} />
                            <NavButton icon={<Globe size={16} />} label="Bodies" active={activeView === "BODIES"} onClick={() => setActiveView("BODIES")} />
                            <NavButton
                                icon={<Eye size={16} />}
                                label={showLabels ? "Hide" : "Show"}
                                active={showLabels}
                                onClick={() => setShowLabels(!showLabels)}
                            />
                        </div>
                        <div className="pointer-events-auto group cursor-default">
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-950/30 border border-orange-900/30">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                    </span>
                                    <span className="text-orange-400/80 text-[10px] font-mono font-bold tracking-widest uppercase">Live Feed</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono tracking-wider">
                                    <Clock size={14} className="text-orange-500" />
                                    <span>{currentTime.toLocaleTimeString([], { hour12: false, timeZoneName: 'short' })}</span>
                                </div>
                            </div>
                        </div>
                        <div className=" rounded-lg shadow-2xl max-w-md pointer-events-auto relative overflow-hidden group w-full md:w-auto">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-500/5 border border-orange-500/20 rounded-md text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                    <Globe size={16} className="text-orange-400" />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">NAVIGATION</h3>
                                    </div>
                                    <p className="text-[10px] text-slate-200 leading-relaxed font-mono">Drag: Rotate | Scroll: Zoom | Click: Object Info</p>
                                </div>
                            </div>
                        </div>
                        <div className=" pointer-events-auto relative">
                            <div className="text-[10px] font-bold text-slate-300 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <Layers size={10} /> ACTIVE BODIES
                            </div>
                            <div className="flex flex-col gap-2 bg-black/30 p-3 rounded-lg border border-white/5 ">
                                <LegendItem label="Sun" color="bg-yellow-200" />
                                <LegendItem label="Inner Planets" color="bg-blue-500" />
                                <LegendItem label="Gas Giants" color="bg-red-400" />
                                <LegendItem label="Dwarf Planets" color="bg-purple-500" />
                                <LegendItem label="Asteroid Belt" color="bg-gray-400" />
                                <LegendItem label="Kuiper Belt" color="bg-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const LegendItem = ({ label, color }) => (
    <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
        <span className="text-slate-300">{label}</span>
    </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden
    ${active
                ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,165,0,0.1)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
        {active && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500"></div>}
        {icon}
        <span>{label}</span>
    </button>
);

export default GlobeApp;