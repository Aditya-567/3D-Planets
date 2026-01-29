import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- 3D Globe Component ---
const GlobeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Track resources for disposal to prevent WebGL context loss
        const disposables = [];

        // 1. Scene Setup
        const scene = new THREE.Scene();
        // Pure black background
        scene.fog = new THREE.FogExp2(0x000000, 0.03);

        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 7.5;

        // Add powerPreference to try and avoid context loss on lower-end devices
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // 2. Objects Group
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // -- A. The Black Hole Core (Occlusion) --
        const coreGeo = new THREE.SphereGeometry(1.98, 64, 64);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        mainGroup.add(core);
        disposables.push(coreGeo, coreMat);

        // -- B. The "Ocean" (Dotted Map) --
        const maxParticles = 20000;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(maxParticles * 3);
        const pSizes = new Float32Array(maxParticles);

        for (let i = 0; i < maxParticles; i++) {
            pPos[i * 3] = 0; pPos[i * 3 + 1] = 0; pPos[i * 3 + 2] = 0;
            pSizes[i] = 0;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

        // GREEN Data Points
        const pMat = new THREE.PointsMaterial({
            size: 0.035,
            color: 0x4ade80,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
        const landPoints = new THREE.Points(pGeo, pMat);
        mainGroup.add(landPoints);
        disposables.push(pGeo, pMat);

        // --- EARTH TEXTURE LOADING ---
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const newPos = new Float32Array(maxParticles * 3);
            const newSizes = new Float32Array(maxParticles);

            let particleIndex = 0;
            let attempts = 0;
            const maxAttempts = 300000;

            while (particleIndex < maxParticles && attempts < maxAttempts) {
                attempts++;
                const u = Math.random();
                const v = Math.random();
                const theta_s = 2 * Math.PI * u;
                const phi_s = Math.acos(2 * v - 1);

                const r = 2.02;
                const x = r * Math.sin(phi_s) * Math.cos(theta_s);
                const y = r * Math.sin(phi_s) * Math.sin(theta_s);
                const z = r * Math.cos(phi_s);

                const lat = Math.asin(y / r);
                const lon = Math.atan2(x, z);
                const mapU = (lon / (2 * Math.PI)) + 0.5;
                const mapV = (lat / Math.PI) + 0.5;

                const px = Math.floor(mapU * canvas.width);
                const py = Math.floor((1 - mapV) * canvas.height);
                const index = (py * canvas.width + px) * 4;
                const red = imgData.data[index];

                // Ocean (dark pixels) gets dots
                if (red < 50) {
                    newPos[particleIndex * 3] = x;
                    newPos[particleIndex * 3 + 1] = y;
                    newPos[particleIndex * 3 + 2] = z;
                    newSizes[particleIndex] = Math.random() > 0.8 ? 0.05 : 0.03;
                    particleIndex++;
                }
            }

            if (landPoints.geometry) {
                landPoints.geometry.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
                landPoints.geometry.setAttribute('size', new THREE.BufferAttribute(newSizes, 1));
                landPoints.geometry.attributes.position.needsUpdate = true;
                landPoints.geometry.attributes.size.needsUpdate = true;
            }
        };

        // Fallback Noise
        img.onerror = () => {
            const noisePos = new Float32Array(maxParticles * 3);
            const noiseSizes = new Float32Array(maxParticles);
            for (let i = 0; i < maxParticles; i++) {
                const phi = Math.acos(-1 + (2 * i) / maxParticles);
                const theta = Math.sqrt(maxParticles * Math.PI) * phi;
                const r = 2.02;
                let x = r * Math.cos(theta) * Math.sin(phi);
                let y = r * Math.sin(theta) * Math.sin(phi);
                let z = r * Math.cos(phi);
                const noise = Math.sin(x * 5) + Math.cos(y * 5) + Math.sin(z * 5);
                if (noise <= 0.5) {
                    noisePos[i * 3] = x; noisePos[i * 3 + 1] = y; noisePos[i * 3 + 2] = z;
                    noiseSizes[i] = 0.03;
                }
            }
            if (landPoints.geometry) {
                landPoints.geometry.setAttribute('position', new THREE.BufferAttribute(noisePos, 3));
                landPoints.geometry.setAttribute('size', new THREE.BufferAttribute(noiseSizes, 1));
                landPoints.geometry.attributes.position.needsUpdate = true;
                landPoints.geometry.attributes.size.needsUpdate = true;
            }
        };

        // -- C. Atmosphere Glow --
        const atmosGeo = new THREE.SphereGeometry(2.3, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x4ade80,
            transparent: true,
            opacity: 0.07,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        scene.add(atmosphere);
        disposables.push(atmosGeo, atmosMat);

        // -- D. Floating Particles --
        const floatCount = 150;
        const floatGeo = new THREE.BufferGeometry();
        const floatPos = new Float32Array(floatCount * 3);
        for (let i = 0; i < floatCount * 3; i++) {
            const r = 2.5 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            floatPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            floatPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            floatPos[i * 3 + 2] = r * Math.cos(phi);
        }
        floatGeo.setAttribute('position', new THREE.BufferAttribute(floatPos, 3));
        const floatMat = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x4ade80, // Green particles
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
        });
        const floatParticles = new THREE.Points(floatGeo, floatMat);
        scene.add(floatParticles);
        disposables.push(floatGeo, floatMat);

        // -- E. Orbiting Satellites with Trails (Atomic Style) --
        const orbitGroup = new THREE.Group();
        scene.add(orbitGroup);

        const orbits = [];
        const orbitCount = 3;

        for (let i = 0; i < orbitCount; i++) {
            const radius = 2.5;
            const speed = 0.015;
            const baseColor = new THREE.Color(0x4ade80);

            // 1. Trail Geometry (Arc segment)
            // We create an arc that starts negative relative to 0 so it looks like it's behind the satellite
            const trailLength = Math.PI; // Length of the tail
            const trailCurve = new THREE.EllipseCurve(
                0, 0,
                radius, radius,
                -trailLength, 0, // Arc from -Length to 0
                false,
                0
            );
            const trailPoints = trailCurve.getPoints(64);
            const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPoints);
            const colors = [];
            for (let j = 0; j < trailPoints.length; j++) {
                const alpha = Math.pow(j / (trailPoints.length - 1), 2);
                colors.push(baseColor.r * alpha, baseColor.g * alpha, baseColor.b * alpha);
            }
            trailGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            const trailMat = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const trail = new THREE.Line(trailGeo, trailMat);
            disposables.push(trailGeo, trailMat);

            // Satellite
            const satGeo = new THREE.SphereGeometry(0.05, 16, 16);
            const satMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
            const satellite = new THREE.Mesh(satGeo, satMat);
            disposables.push(satGeo, satMat);

            const ringGroup = new THREE.Group();
            ringGroup.rotation.x = Math.PI / 3;
            ringGroup.rotation.y = i * (Math.PI / 1.5);

            ringGroup.add(trail);
            ringGroup.add(satellite);
            orbitGroup.add(ringGroup);

            orbits.push({
                satellite: satellite,
                trail: trail,
                speed: speed,
                angle: Math.random() * Math.PI * 2,
                radius: radius
            });
        }

        // 3. Lighting
        const ambientLight = new THREE.AmbientLight(0x000000, 1);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0x4ade80, 1.5);
        dirLight.position.set(5, 3, 5);
        scene.add(dirLight);

        // 4. Animation
        let animationId;
        let mouseX = 0;
        let mouseY = 0;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const time = Date.now() * 0.0005;

            if (mainGroup) {
                mainGroup.rotation.y += 0.002;
                mainGroup.rotation.x += (mouseY * 0.3 - mainGroup.rotation.x) * 0.05;
                mainGroup.rotation.z += (mouseX * 0.3 - mainGroup.rotation.z) * 0.05;
            }

            if (floatParticles) {
                floatParticles.rotation.y -= 0.0005;
                floatParticles.rotation.x = Math.sin(time * 0.5) * 0.1;
            }

            orbits.forEach(orbit => {
                orbit.angle += orbit.speed;
                orbit.satellite.position.x = Math.cos(orbit.angle) * orbit.radius;
                orbit.satellite.position.y = Math.sin(orbit.angle) * orbit.radius;
                orbit.trail.rotation.z = orbit.angle;
            });

            if (atmosphere) {
                const scale = 1 + Math.sin(time * 3) * 0.01;
                atmosphere.scale.set(scale, scale, scale);
            }

            renderer.render(scene, camera);
        };

        animate();

        // 5. Events
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        const handleMouseMove = (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            // Dispose all tracked resources
            disposables.forEach(obj => {
                if (obj.dispose) obj.dispose();
            });
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" />;
};

const DotGlode = () => {
    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            <GlobeScene />
        </div>
    );
};

export default DotGlode;