import React, { useEffect, useRef, useState } from 'react';
import { Globe, Layers, Activity, Clock, Sun as SunIcon } from 'lucide-react';
import { roughness } from 'three/tsl';

const SolarSystem = () => {
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

    // State
    const [isDragging, setIsDragging] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activePlanet, setActivePlanet] = useState("Solar System");

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
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
            if (rendererRef.current && mountRef.current) {
                mountRef.current.innerHTML = '';
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

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.0003);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 8000);
        camera.position.set(0, 140, 280);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        const textureLoader = new THREE.TextureLoader();

        // --- VARIABLES FOR ANIMATION ---
        // Declared in top scope of initThree to be accessible by animate()
        let sunMesh, sunCorona, sunBloom, sunBrightGlow, sunFlare;
        let asteroidBelt, kuiperBelt;
        let stars, galaxyDome, backgroundSphere; // backgroundSphere added here
        let planetObjects = [];
        let solarSystemGroup = new THREE.Group();
        scene.add(solarSystemGroup);

        // --- 1. BACKGROUND SPHERE (8k Stars Image) ---
        const bgGeometry = new THREE.SphereGeometry(3000, 64, 64);
        const bgTexture = textureLoader.load('8k_stars.png');
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: bgTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        backgroundSphere = new THREE.Mesh(bgGeometry, bgMaterial);
        scene.add(backgroundSphere);

        // --- 2. TWINKLING STARFIELD (Particles) ---
        const starCount = 9000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });

        const starVertices = [];
        const starColors = [];
        const starBaseColors = [];
        const starSpeeds = [];

        for (let i = 0; i < starCount; i++) {
            const r = 500 + Math.random() * 1500;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            starVertices.push(x, y, z);

            const colorType = Math.random();
            const col = new THREE.Color();
            if (colorType > 0.9) col.setHSL(0.6, 0.8, 0.8);
            else if (colorType > 0.7) col.setHSL(0.1, 0.8, 0.8);
            else col.setHSL(0, 0, 1);

            starColors.push(col.r, col.g, col.b);
            starBaseColors.push(col.r, col.g, col.b);
            starSpeeds.push(Math.random() * 3 + 1);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // --- 3. GALAXY SPHERE (Nebula particles) ---
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
            if (rand > 0.6) col.setHex(0x8a2be2);
            else if (rand > 0.3) col.setHex(0x00ced1);
            else col.setHex(0x4169e1);

            const intensity = 0.3 + Math.random() * 0.7;
            col.multiplyScalar(intensity);

            galaxyColors.push(col.r, col.g, col.b);
        }

        galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyVertices, 3));
        galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));
        galaxyDome = new THREE.Points(galaxyGeometry, galaxyMaterial);
        scene.add(galaxyDome);

        // --- REALISTIC SUN ---
        const sunGroup = new THREE.Group();
        solarSystemGroup.add(sunGroup);

        // 1. Sun Surface 
        const sunGeometry = new THREE.SphereGeometry(5.0, 64, 64);
        const sunTexture = textureLoader.load('8k_sun.jpg');
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: sunTexture,
            color: 0xffffff,
        });
        sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunGroup.add(sunMesh);

        // 2. Sun Glow (Corona) 
        const coronaTexture = createGlowTexture(0xff4500);
        const coronaMat = new THREE.SpriteMaterial({
            map: coronaTexture,
            color: 0xff4500,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        sunCorona = new THREE.Sprite(coronaMat);
        sunCorona.scale.set(13, 13, 1);
        sunGroup.add(sunCorona);

        // 3. Sun Bloom 
        const bloomTexture = createGlowTexture(0xffaa00);
        const bloomMat = new THREE.SpriteMaterial({
            map: bloomTexture,
            color: 0xffaa00,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        sunBloom = new THREE.Sprite(bloomMat);
        sunBloom.scale.set(22, 22, 1);
        sunGroup.add(sunBloom);

        // 4. Bright Core Glow 
        const brightGlowTexture = createGlowTexture(0xffffee);
        const brightGlowMat = new THREE.SpriteMaterial({
            map: brightGlowTexture,
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        sunBrightGlow = new THREE.Sprite(brightGlowMat);
        sunBrightGlow.scale.set(10, 10, 0.5);
        sunGroup.add(sunBrightGlow);

        // 5. LENS FLARE
        const flareTexture = textureLoader.load('lensflare0.png');
        const flareMaterial = new THREE.SpriteMaterial({
            map: flareTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 1,
            depthWrite: false
        });
        sunFlare = new THREE.Sprite(flareMaterial);
        sunFlare.scale.set(900, 90, 1.0);
        sunGroup.add(sunFlare);

        // Sun Light Source
        const sunLight = new THREE.PointLight(0xffffff, 4.5, 1900);
        sunGroup.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);

        // --- ASTEROID BELT ---
        const asteroidCount = 1900;
        const asteroidGeom = new THREE.DodecahedronGeometry(0.08, 0);
        const asteroidMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });

        const asteroidMesh = new THREE.InstancedMesh(asteroidGeom, asteroidMat, asteroidCount);

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();

        for (let i = 0; i < asteroidCount; i++) {
            const r = 29 + Math.random() * 7;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 2.0;

            dummy.position.set(r * Math.cos(theta), y, r * Math.sin(theta));
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scale = 0.5 + Math.random() * 1.5;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            asteroidMesh.setMatrixAt(i, dummy.matrix);

            const shade = 0.5 + Math.random() * 0.3;
            if (Math.random() > 0.8) {
                color.setRGB(shade + 0.1, shade, shade - 0.1);
            } else {
                color.setRGB(shade, shade, shade);
            }
            asteroidMesh.setColorAt(i, color);
        }
        asteroidMesh.instanceMatrix.needsUpdate = true;
        asteroidMesh.instanceColor.needsUpdate = true;
        asteroidMesh.rotation.z = 2 * (Math.PI / 180);
        asteroidMesh.rotation.x = 1 * (Math.PI / 180);
        asteroidBelt = asteroidMesh;
        solarSystemGroup.add(asteroidBelt);

        // --- KUIPER BELT ---
        const kuiperCount = 9000;
        const kuiperGeometry = new THREE.BufferGeometry();
        const kuiperMaterial = new THREE.PointsMaterial({
            size: 0.19,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            roughness: 0.9
        });
        const kuiperVertices = [];
        const kuiperColors = [];
        const baseKuiperColor = new THREE.Color(0xaaccff);

        for (let i = 0; i < kuiperCount; i++) {
            const r = 96 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 5.0;
            kuiperVertices.push(r * Math.cos(theta), y, r * Math.sin(theta));
            const variation = Math.random() * 0.2;
            kuiperColors.push(baseKuiperColor.r + variation, baseKuiperColor.g + variation, baseKuiperColor.b + variation);
        }
        kuiperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(kuiperVertices, 3));
        kuiperGeometry.setAttribute('color', new THREE.Float32BufferAttribute(kuiperColors, 3));
        kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
        kuiperBelt.rotation.z = 1.5 * (Math.PI / 180);
        kuiperBelt.rotation.x = 0.5 * (Math.PI / 180);
        solarSystemGroup.add(kuiperBelt);

        // --- PLANET DATA ---
        const planetsData = [
            { name: "Mercury", textureImg: "mercury.jpg", size: 0.6, distance: 10, speed: 0.04, orbitColor: 0xA5A5A5, inclination: 10.0, node: 48, ecc: 0.25, moonCount: 0 },
            { name: "Venus", textureImg: "venusmap.jpg", size: 0.9, distance: 13, speed: 0.025, orbitColor: 0xE3BB76, inclination: 3.4, node: 76, ecc: 0.15, moonCount: 0 },
            { name: "Earth", textureImg: "earth_daymap.jpg", size: 0.95, distance: 17, speed: 0.02, orbitColor: 0x2233FF, inclination: 0.0, node: 0, ecc: 0.12, isEarth: true, moonCount: 1 },
            { name: "Mars", textureImg: "marsmap.jpg", size: 0.99, distance: 22, speed: 0.015, orbitColor: 0xDD4422, inclination: 2.8, node: 49, ecc: 0.18, moonCount: 2 },
            { name: "Jupiter", textureImg: "jupiter.jpg", size: 2.8, distance: 44, speed: 0.008, orbitColor: 0xD9A066, inclination: 1.3, node: 100, ecc: 0.12, moonCount: 4 },
            { name: "Saturn", textureImg: "saturnmap.jpg", size: 1.9, distance: 54, speed: 0.006, orbitColor: 0xF8D789, inclination: 2.5, node: 113, ecc: 0.14, hasRing: true, ringTexture: "saturn_ring.png", moonCount: 8 },
            { name: "Uranus", textureImg: "uranus.jpg", size: 1.4, distance: 64, speed: 0.004, orbitColor: 0x66CCFF, inclination: 0.8, node: 74, ecc: 0.05, hasRing: true, ringTexture: "uranus_ring.png", moonCount: 5 },
            { name: "Neptune", textureImg: "neptune.jpg", size: 1.2, distance: 74, speed: 0.003, orbitColor: 0x3333AA, inclination: 1.8, node: 131, ecc: 0.08, moonCount: 3 },
            { name: "Pluto", textureImg: "plutomap.jpg", size: 0.8, distance: 85, speed: 0.002, orbitColor: 0x9ca6b7, inclination: 17.2, node: 110, ecc: 0.3, moonCount: 1 },
            { name: "Ceres", textureImg: "ceresmap.jpg", size: 0.7, distance: 26, speed: 0.012, orbitColor: 0x888888, inclination: 10.6, node: 80, ecc: 0.08, moonCount: 0 },
            { name: "Haumea", textureImg: "haumeamap.jpg", size: 0.6, distance: 92, speed: 0.0018, orbitColor: 0xaaaaaa, inclination: 28.0, node: 122, ecc: 0.19, moonCount: 2 },
            { name: "Makemake", textureImg: "makemakemap.jpg", size: 0.6, distance: 98, speed: 0.0016, orbitColor: 0xaaaaaa, inclination: 29.0, node: 79, ecc: 0.16, moonCount: 1 },
            { name: "Eris", textureImg: "erismap.jpg", size: 0.62, distance: 110, speed: 0.0012, orbitColor: 0xaaaaaa, inclination: 44.0, node: 135, ecc: 0.44, moonCount: 1 }
        ];

        planetsData.forEach(data => {
            const inclinationRad = data.inclination * (Math.PI / 180);
            const nodeRad = data.node * (Math.PI / 180);

            const a = data.distance;
            const e = data.ecc;
            const b = a * Math.sqrt(1 - (e * e));
            const c = a * e;

            // 1. Static Orbit Line
            const orbitCurve = new THREE.EllipseCurve(c, 0, a, b, 0, 2 * Math.PI, false, 0);
            const points = orbitCurve.getPoints(250);
            const orbitGeom = new THREE.BufferGeometry().setFromPoints(points);
            orbitGeom.rotateX(Math.PI / 2);
            orbitGeom.rotateZ(inclinationRad);
            orbitGeom.rotateY(nodeRad);
            const orbitMat = new THREE.LineBasicMaterial({ color: data.orbitColor, transparent: true, opacity: 0.15 });
            const orbitLine = new THREE.Line(orbitGeom, orbitMat);
            solarSystemGroup.add(orbitLine);

            // 2. Comet Tail
            const trailLength = 150;
            const trailPositions = new Float32Array(trailLength * 3);
            const trailColors = new Float32Array(trailLength * 3);
            const baseColor = new THREE.Color(data.orbitColor);

            for (let i = 0; i < trailLength; i++) {
                trailPositions[i * 3] = 0; trailPositions[i * 3 + 1] = 0; trailPositions[i * 3 + 2] = 0;
                const alpha = Math.pow(1 - (i / trailLength), 2);
                trailColors[i * 3] = baseColor.r * alpha;
                trailColors[i * 3 + 1] = baseColor.g * alpha;
                trailColors[i * 3 + 2] = baseColor.b * alpha;
            }
            const trailGeom = new THREE.BufferGeometry();
            trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
            trailGeom.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
            const trailMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, linewidth: 2 });
            const trailLine = new THREE.Line(trailGeom, trailMat);
            solarSystemGroup.add(trailLine);

            // 3. Planet Mesh
            let geometry = new THREE.SphereGeometry(data.size, 32, 32);
            let material = new THREE.MeshPhongMaterial({
                map: textureLoader.load(data.textureImg),
                specular: new THREE.Color(0x333333),
                shininess: 10
            });

            if (data.isEarth) {
                material = new THREE.MeshPhongMaterial({
                    map: textureLoader.load('earth_daymap.jpg'),
                    specularMap: textureLoader.load('earth_specular.jpg'),
                    normalMap: textureLoader.load('earth_normal.jpg'),
                    specular: new THREE.Color(0x333333),
                    shininess: 15
                });
                const atmoGeom = new THREE.SphereGeometry(data.size * 1.05, 32, 32);
                const atmoMat = new THREE.MeshPhongMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2, side: THREE.BackSide, blending: THREE.AdditiveBlending });
                const atmosphere = new THREE.Mesh(atmoGeom, atmoMat);
                solarSystemGroup.add(atmosphere);
            }

            const mesh = new THREE.Mesh(geometry, material);
            if (data.name === "Haumea") mesh.scale.set(1.5, 0.75, 0.75);

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
                ring.rotation.x = Math.PI / 2;
                ring.rotation.y = -0.2;
                mesh.add(ring);
            }

            if (data.isEarth) {
                const moonGeom = new THREE.SphereGeometry(data.size * 0.27, 16, 16);
                const moonMat = new THREE.MeshPhongMaterial({ map: textureLoader.load('moonmap.jpg'), shininess: 5, specular: new THREE.Color(0x000000) });
                const moonMesh = new THREE.Mesh(moonGeom, moonMat);
                moonMesh.position.set(data.size * 2.5, 0, 0);
                mesh.add(moonMesh);
            }

            solarSystemGroup.add(mesh);

            // 4. Moons
            const moonsGroup = new THREE.Group();
            solarSystemGroup.add(moonsGroup);
            const moons = [];

            if (data.moonCount > 0) {
                for (let m = 0; m < data.moonCount; m++) {
                    const moonDist = data.size * 1.5 + Math.random() * 1.5 + (m * 0.5);
                    const orbitSpeed = 0.02 + Math.random() * 0.05;
                    const tiltX = (Math.random() - 0.5) * 1.0;
                    const tiltZ = (Math.random() - 0.5) * 1.0;

                    const orbitContainer = new THREE.Group();
                    orbitContainer.rotation.x = tiltX;
                    orbitContainer.rotation.z = tiltZ;
                    moonsGroup.add(orbitContainer);

                    const moonOrbitCurve = new THREE.EllipseCurve(0, 0, moonDist, moonDist, 0, 2 * Math.PI, false, 0);
                    const moonOrbitPoints = moonOrbitCurve.getPoints(64);
                    const moonOrbitGeom = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
                    moonOrbitGeom.rotateX(Math.PI / 2);
                    const moonOrbitMat = new THREE.LineBasicMaterial({ color: 0x88aabb, transparent: true, opacity: 0.1 });
                    const moonOrbitLine = new THREE.Line(moonOrbitGeom, moonOrbitMat);
                    orbitContainer.add(moonOrbitLine);

                    const moonRotator = new THREE.Group();
                    orbitContainer.add(moonRotator);

                    const moonSize = data.size * 0.15 + Math.random() * 0.1;
                    const moonGeom = new THREE.SphereGeometry(moonSize, 8, 8);
                    let moonMat;
                    if (data.isEarth && m === 0) moonMat = new THREE.MeshPhongMaterial({ map: textureLoader.load('moonmap.jpg'), shininess: 5 });
                    else moonMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 2 });
                    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
                    moonMesh.position.set(moonDist, 0, 0);
                    moonRotator.add(moonMesh);

                    // Moon Trail
                    const mtLength = 30;
                    const mtPos = new Float32Array(mtLength * 3);
                    const mtCol = new Float32Array(mtLength * 3);
                    const mtColor = new THREE.Color(0xffffff);
                    for (let k = 0; k < mtLength; k++) {
                        const alpha = Math.pow(1 - (k / mtLength), 2);
                        mtCol[k * 3] = mtColor.r * alpha;
                        mtCol[k * 3 + 1] = mtColor.g * alpha;
                        mtCol[k * 3 + 2] = mtColor.b * alpha;
                    }
                    const mtGeom = new THREE.BufferGeometry();
                    mtGeom.setAttribute('position', new THREE.BufferAttribute(mtPos, 3));
                    mtGeom.setAttribute('color', new THREE.BufferAttribute(mtCol, 3));
                    const mtMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
                    const moonTrailLine = new THREE.Line(mtGeom, mtMat);
                    orbitContainer.add(moonTrailLine);

                    moons.push({ rotator: moonRotator, mesh: moonMesh, trail: moonTrailLine, speed: orbitSpeed, angle: Math.random() * Math.PI * 2, dist: moonDist });
                }
            }

            planetObjects.push({
                mesh: mesh,
                trail: trailLine,
                moonsGroup: moonsGroup,
                moons: moons,
                data: data,
                angle: Math.random() * Math.PI * 2,
                xRadius: a,
                zRadius: b,
                centerOffset: c,
                inclination: inclinationRad,
                node: nodeRad
            });
        });

        setLoading(false);

        // --- Interaction Logic ---
        let isMouseDown = false;
        let mouseXOnMouseDown = 0;
        let mouseYOnMouseDown = 0;
        let targetRotationYOnMouseDown = 0;
        let targetRotationXOnMouseDown = 0;
        let targetRotationY = 0;
        let targetRotationX = 0;

        const onDocumentMouseDown = (event) => {
            if (event.target.tagName !== 'CANVAS') return;
            event.preventDefault();
            isMouseDown = true;
            setIsDragging(true);
            mouseXOnMouseDown = event.clientX;
            mouseYOnMouseDown = event.clientY;
            targetRotationYOnMouseDown = targetRotationY;
            targetRotationXOnMouseDown = targetRotationX;
        };

        const onDocumentMouseMove = (event) => {
            if (isMouseDown) {
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                const deltaX = (mouseX - mouseXOnMouseDown) * 0.005;
                const deltaY = (mouseY - mouseYOnMouseDown) * 0.005;
                targetRotationY = targetRotationYOnMouseDown + deltaX;
                targetRotationX = targetRotationXOnMouseDown + deltaY;
            }
        };

        const onDocumentMouseUp = () => {
            isMouseDown = false;
            setIsDragging(false);
        };

        // SLOW SMOOTH ZOOM
        const onDocumentWheel = (event) => {
            const newDist = targetDistanceRef.current + event.deltaY * 0.05;
            targetDistanceRef.current = Math.max(20, Math.min(newDist, 450));
        };

        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('wheel', onDocumentWheel, { passive: false });

        // --- Animation Loop ---
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            if (solarSystemGroup) {
                solarSystemGroup.rotation.y += (targetRotationY - solarSystemGroup.rotation.y) * 0.1;
                solarSystemGroup.rotation.x += (targetRotationX - solarSystemGroup.rotation.x) * 0.1;
            }

            if (asteroidBelt) asteroidBelt.rotation.y += 0.0015;
            if (kuiperBelt) kuiperBelt.rotation.y += 0.0005;

            // Rotate Background Galaxy Dome
            if (backgroundSphere) {
                backgroundSphere.rotation.y -= 0.0004;
            }

            // Twinkle Stars
            if (stars && stars.geometry && stars.geometry.attributes.color) {
                const sColors = stars.geometry.attributes.color.array;
                const time = Date.now() * 0.001;
                for (let i = 0; i < starCount; i++) {
                    const baseR = starBaseColors[i * 3];
                    const baseG = starBaseColors[i * 3 + 1];
                    const baseB = starBaseColors[i * 3 + 2];

                    const twinkle = 0.7 + 0.3 * Math.sin(time * starSpeeds[i] + i);
                    sColors[i * 3] = baseR * twinkle;
                    sColors[i * 3 + 1] = baseG * twinkle;
                    sColors[i * 3 + 2] = baseB * twinkle;
                }
                stars.geometry.attributes.color.needsUpdate = true;
                stars.rotation.y -= 0.0004;
            }

            const time = Date.now() * 0.001;
            if (sunMesh) sunMesh.rotation.y += 0.002;

            const pulse = 1 + Math.sin(time * 2) * 0.03;

            if (sunBrightGlow) sunBrightGlow.scale.set(10 * pulse, 10 * pulse, 1);
            if (sunCorona) {
                sunCorona.scale.set(13 + pulse, 13 + pulse, 1);
                sunCorona.material.opacity = 0.9 + Math.sin(time * 3) * 0.1;
            }
            if (sunBloom) sunBloom.scale.set(22 + pulse, 22 + pulse, 1);

            if (sunFlare) {
                sunFlare.material.rotation -= 0.001;
                const flareScale = 45 + Math.sin(time * 1.5) * 2.0;
                sunFlare.scale.set(flareScale, flareScale, 1.0);
                sunFlare.material.opacity = 0.8 + Math.sin(time * 2) * 0.2;
            }

            planetObjects.forEach(obj => {
                obj.angle += obj.data.speed;
                const currentPos = getPlanetPosition(obj.angle, obj.xRadius, obj.zRadius, obj.inclination, obj.node, obj.centerOffset);
                obj.mesh.position.copy(currentPos);
                obj.mesh.rotation.y += 0.02;

                if (obj.moonsGroup) {
                    obj.moonsGroup.position.copy(currentPos);
                    obj.moons.forEach(moon => {
                        moon.angle += moon.speed;
                        moon.rotator.rotation.y = moon.angle;
                        const posArr = moon.trail.geometry.attributes.position.array;
                        const tLen = 30;
                        for (let k = 0; k < tLen; k++) {
                            const pastAngle = moon.angle - (k * 0.1);
                            const mx = Math.cos(pastAngle) * moon.dist;
                            const mz = -Math.sin(pastAngle) * moon.dist;
                            posArr[k * 3] = mx; posArr[k * 3 + 1] = 0; posArr[k * 3 + 2] = mz;
                        }
                        moon.trail.geometry.attributes.position.needsUpdate = true;
                    });
                }

                const positions = obj.trail.geometry.attributes.position.array;
                const trailLength = 150;
                for (let i = 0; i < trailLength; i++) {
                    const angleBack = obj.angle - (i * 0.02);
                    const backPos = getPlanetPosition(angleBack, obj.xRadius, obj.zRadius, obj.inclination, obj.node, obj.centerOffset);
                    positions[i * 3] = backPos.x; positions[i * 3 + 1] = backPos.y; positions[i * 3 + 2] = backPos.z;
                }
                obj.trail.geometry.attributes.position.needsUpdate = true;
            });

            currentDistanceRef.current += (targetDistanceRef.current - currentDistanceRef.current) * 0.02;
            camera.position.z = currentDistanceRef.current;
            camera.position.y = currentDistanceRef.current * 0.4;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };
        frameIdRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', onDocumentMouseDown);
            document.removeEventListener('mousemove', onDocumentMouseMove);
            document.removeEventListener('mouseup', onDocumentMouseUp);
            document.removeEventListener('wheel', onDocumentWheel);

            // Cleanup geometries
            sunGeometry.dispose();
            starGeometry.dispose();
            planetObjects.forEach(p => {
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
            });
        };
    };

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans selection:bg-orange-500/30">

            {/* 3D Canvas Container */}
            <div ref={mountRef} className="absolute inset-0 z-0 cursor-move" />

            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-900/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-2 border-slate-800 rounded-full border-t-orange-500 animate-spin"></div>
                        <p className="text-orange-500 font-mono tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Solar System...</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none ">
                <div className="w-full mx-auto flex flex-col gap-4 items-end">

                    <div className="hidden md:flex gap-1 pointer-events-auto bg-white/5 p-1 rounded-lg backdrop-blur-md border border-white/5">
                        <NavButton icon={<SunIcon size={16} />} label="Solar System" active={activePlanet === "Solar System"} />
                        
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
                                <p className="text-[10px] text-slate-200 leading-relaxed font-mono">
                                    Drag to rotate view. Scroll to zoom.
                                </p>
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

          

        </div>
    );
};

// --- Subcomponents ---

const LegendItem = ({ label, color }) => (
    <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
        <span className="text-slate-300">{label}</span>
    </div>
);

const NavButton = ({ icon, label, active }) => (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden
    ${active
            ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,165,0,0.1)]'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}>
        {active && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500"></div>}
        {icon}
        <span>{label}</span>
    </button>
);

export default SolarSystem;