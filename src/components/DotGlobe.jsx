import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- 3D Globe Component ---
/**
 * GlobeScene - 3D Interactive Dotted Globe with Satellites
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.cameraZ=7.5] - Camera z position
 * @param {number} [props.maxParticles=20000] - Maximum particles on globe surface
 * @param {number} [props.dotColor=0x4ade80] - Color of globe dots
 * @param {number} [props.atmosphereColor=0x4ade80] - Atmosphere glow color
 * @param {number} [props.atmosphereOpacity=0.07] - Atmosphere opacity
 * @param {number} [props.floatCount=150] - Floating particles count
 * @param {number} [props.floatColor=0x4ade80] - Floating particles color
 * @param {number} [props.lightColor=0x4ade80] - Light source color
 * @param {number} [props.autoRotateSpeed=0.002] - Auto rotation speed
 * @param {number} [props.floatRotateSpeed=0.0005] - Floating particles rotation speed
 * @param {number} [props.mouseInfluence=0.3] - Mouse interaction influence
 * @param {string} [props.top] - CSS top positioning
 * @param {string} [props.bottom] - CSS bottom positioning
 * @param {string} [props.left] - CSS left positioning
 * @param {string} [props.right] - CSS right positioning
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {Object} [props.style={}] - Inline styles
 *
 * @example
 * <GlobeScene dotColor={0xff0000} orbitCount={5} />
 */
const GlobeScene = ({
    cameraZ = 7.5,

    // dotted map
    maxParticles = 200000,
    dotColor = 0x4ade80,

    // atmosphere
    atmosphereColor = 0x4ade80,
    atmosphereOpacity = 0.07,

    // floating particles
    floatCount = 150,
    floatColor = 0x4ade80,

    // lights
    lightColor = 0x4ade80,

    // animation tuning
    autoRotateSpeed = 0.002,
    floatRotateSpeed = 0.0005,
    mouseInfluence = 0.3,

    // background stars
    starCount = 30000,

    // CSS positioning
    top,
    bottom,
    left,
    right,
    className = "",
    style = {},
    containerHeight = '100vh'
}) => {

    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Track resources for disposal to prevent WebGL context loss
        const disposables = [];

        // 1. Scene Setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.03);

        const camera = new THREE.PerspectiveCamera(
            45,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = cameraZ;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });

        renderer.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
        );
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

        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(maxParticles * 3);
        const pSizes = new Float32Array(maxParticles);

        for (let i = 0; i < maxParticles; i++) {
            pPos[i * 3] = 0;
            pPos[i * 3 + 1] = 0;
            pPos[i * 3 + 2] = 0;
            pSizes[i] = 0;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

        const pMat = new THREE.PointsMaterial({
            size: 0.035,
            color: dotColor,
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
                    noisePos[i * 3] = x;
                    noisePos[i * 3 + 1] = y;
                    noisePos[i * 3 + 2] = z;
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
            color: atmosphereColor,
            transparent: true,
            opacity: atmosphereOpacity,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });

        const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        scene.add(atmosphere);
        disposables.push(atmosGeo, atmosMat);

        // -- D. Floating Particles --
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
            color: floatColor,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
        });

        const floatParticles = new THREE.Points(floatGeo, floatMat);
        scene.add(floatParticles);
        disposables.push(floatGeo, floatMat);

        // -- F. Background Stars --
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        const starOffsets = new Float32Array(starCount);
        for (let i = 0; i < starCount; i++) {
            const r = 40 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i * 3 + 2] = r * Math.cos(phi);
            starSizes[i] = Math.random() * 1.5 + 0.3;
            starOffsets[i] = Math.random() * 100.0;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        starGeo.setAttribute('offset', new THREE.BufferAttribute(starOffsets, 1));
        const starMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xffffff) }
            },
            vertexShader: `
                attribute float size;
                attribute float offset;
                uniform float time;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                    float blink = sin(time * 2.0 + offset) * 0.5 + 0.5;
                    blink = pow(blink, 3.0);
                    vAlpha = 0.08 + 0.92 * blink;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    if (dist > 0.5) discard;
                    float strength = pow(1.0 - dist * 2.0, 2.0);
                    gl_FragColor = vec4(color, vAlpha * strength);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);
        disposables.push(starGeo, starMat);

        // 3. Lighting
        const ambientLight = new THREE.AmbientLight(0x000000, 1);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(lightColor, 1.5);
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
                mainGroup.rotation.y += autoRotateSpeed;
                mainGroup.rotation.x += (mouseY * mouseInfluence - mainGroup.rotation.x) * 0.05;
                mainGroup.rotation.z += (mouseX * mouseInfluence - mainGroup.rotation.z) * 0.05;
            }

            if (floatParticles) {
                floatParticles.rotation.y -= floatRotateSpeed;
                floatParticles.rotation.x = Math.sin(time * 0.5) * 0.1;
            }

            if (starField) {
                starField.rotation.y += 0.00005;
                starMat.uniforms.time.value = Date.now() * 0.001;
            }

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

            disposables.forEach(obj => {
                if (obj.dispose) obj.dispose();
            });

            renderer.dispose();
        };

    }, [
        cameraZ,
        maxParticles,
        dotColor,
        atmosphereColor,
        atmosphereOpacity,
        floatCount,
        floatColor,
        lightColor,
        autoRotateSpeed,
        floatRotateSpeed,
        mouseInfluence,
        starCount,
        top,
        bottom,
        left,
        right,
        className,
        style
    ]);

    return <div ref={mountRef} className="w-full h-full" />;
};

const DotGlobe = (props) => {
    const {
        top, bottom, left, right,
        className = "", style = {},
        containerHeight = '100vh',
        ...rest
    } = props;

    return (
        <div className={`w-full bg-black relative overflow-hidden ${className}`} style={{ top, bottom, left, right, height: containerHeight, ...style }}>
            <GlobeScene {...rest} />
        </div>
    );
};

export default DotGlobe;
