# 3d-solar-system-globe

<div align="center">

**[🚀 Live Preview & Playground](https://3dsolarsystem.space/) &nbsp;|&nbsp; [🎨 UI Examples](https://3dsolarsystem.space/#ui-examples) &nbsp;|&nbsp; [📖 Documentation](https://3dsolarsystem.space/#guide) &nbsp;|&nbsp; [📦 NPM](https://www.npmjs.com/package/3d-solar-system-globe) &nbsp;|&nbsp; [⭐ GitHub](https://github.com/Aditya-567/3D-Cosmos-ui)**

[![NPM Version](https://img.shields.io/npm/v/3d-solar-system-globe?style=flat-square&color=CB3837&logo=npm)](https://www.npmjs.com/package/3d-solar-system-globe)
[![GitHub Stars](https://img.shields.io/github/stars/Aditya-567/3D-Cosmos-ui?style=flat-square&color=yellow&logo=github)](https://github.com/Aditya-567/3D-Cosmos-ui)
[![License](https://img.shields.io/github/license/Aditya-567/3D-Cosmos-ui?style=flat-square)](https://github.com/Aditya-567/3D-Cosmos-ui/blob/main/LICENSE)

> Explore all components interactively, browse UI examples (Galaxy, Saturn, Earth landing pages), and follow the full installation guide at **[www.3dsolarsystem.space](https://3dsolarsystem.space/)**.

</div>

---

<table>
  <tr>
    <td width="240">
      <img
        src="https://cloud.githubusercontent.com/assets/532272/21507867/3376e9fe-cc4a-11e6-9350-7ec4f680da36.gif"
        width="200"
      />
    </td>
    <td>
      <h3>
        A collection of reusable <b>React + Three.js</b> components to render an
        interactive <b>3D globe and solar system</b> in web applications.
      </h3>
      <p>
        This package provides ready-to-use components such as Earth with
        satellites, moon systems, data-linked globes and full solar system views.
      </p>
    </td>
  </tr>
</table>

</div>

Just Kidding 😝

## ✨ Features

- 🌍 3D globe rendering  
- 🛰️ Earth with satellite and tower visualizations  
- 🌙 Earth–Moon system  
- ☀️ Full solar system scene  
- ⚡ Built with React and Three.js  
- 📦 Easy to plug into any React project  

---

## 🌐 Live Preview, Playground & Docs

Visit **[3dsolarsystem.space](https://3dsolarsystem.space/)** for:

| Section | Link | Description |
|---|---|---|
| 🚀 Playground | [3dsolarsystem.space](https://3dsolarsystem.space/) | Interact with every 3D component live in the browser — tweak parameters and see results instantly |
| 🎨 UI Examples | [UI Examples](https://3dsolarsystem.space/#ui-examples) | Pre-built landing page examples: Galaxy, Saturn, and Earth |
| 📖 Documentation | [Guide](https://3dsolarsystem.space/#guide) | Step-by-step install & usage guide with code snippets |
| 🗂️ All Manifests | [Manifests](https://3dsolarsystem.space/#manifests) | Browse all available components: Data Mesh Globe, Earth Tower Link, Mars, Jupiter, Solar System, and more |
| 📦 NPM Package | [3d-solar-system-globe](https://www.npmjs.com/package/3d-solar-system-globe) | Install via npm — view versions, weekly downloads, and bundle info |
| ⭐ GitHub Repo | [Aditya-567/3D-Cosmos-ui](https://github.com/Aditya-567/3D-Cosmos-ui) | Source code, issues, contributions, and full project history |

---

## 🎖 Installation

```bash
npm install 3d-solar-system-globe
```


## 🚀 Usage

Import any component you need from the package and render it inside your React app.
```jsx
import {
  DotGlobe,
  DotGlobeWithDataLink,
  EarthWithTower,
  EarthAndSatellite,
  EarthAndMoon,
  EarthMoonSatellite,
  SolarSystem
} from "3d-solar-system-globe";

function App() {
  return (
    <div>
      <SolarSystem />
    </div>
  );
}

export default App;
```

### Basic Example
```jsx
<EarthAndMoon 
  earthSize={0.8}
  moonSize={0.12}
  starCount={10000}
/>
```

### Advanced Customization
```jsx
<Saturn 
   saturnSize = {0.7}
    ringInnerRadius = {1.05}
    ringWidth = {0.75}
    ringParticleCount = {300000}
    saturnRotationSpeed = {0.0015}
    ringRotationSpeed = {0.011}
    particleRotationSpeed = {0.006} // New attribute for particle ring speed
    tilt = {26.7} // Axial tilt in degrees
    ringRotation = {0} // Initial ring rotation in degrees
    starCount = {8000}
    autoRotate = {true}
    bgEnabled = {true}
    starAngle = {0}
    cameraAngle = {18}
    cameraDistance = {3.2}
    cameraFov = {45}
    bgImageOpacity = {0.6}
    containerHeight = '100vh'
/>
```

---

## 📚 Available Components

### 🌍 Earth-Based Components
- **DotGlobe** - Interactive dotted globe with satellites
- **DotGlobeWithDataLink** - Globe with data link visualization
- **EarthWithTower** - Earth with communication towers and signals
- **EarthAndSatellite** - Earth with orbiting satellites
- **EarthAndMoon** - Earth-Moon system
- **EarthMoonSatellite** - Complete Earth system with Moon and satellites

### 🪐 Planet Components
- **Mercury** - Smallest planet, closest to the Sun
- **Venus** - Hottest planet with thick atmosphere
- **Mars** - Red planet with Phobos and Deimos moons
- **Jupiter** - Gas giant with faint rings
- **Saturn** - Gas giant with prominent ring system
- **Uranus** - Ice giant with thin rings
- **Neptune** - Ice giant with very faint rings
- **Pluto** - Dwarf planet

### 🌌 System Components
- **SolarSystem** - Complete solar system with all planets
- **SolarSystemWithFeatures** - Enhanced solar system with UI controls
- **Galaxy** - Spiral galaxy visualization

### 🎨 UI Components
- **LogoWithRotatingText** - Animated logo with rotating text

---

## ⚙️ Component Attributes

Each component is highly customizable. For a complete list of all available attributes for each component, see **[COMPONENT_ATTRIBUTES.md](COMPONENT_ATTRIBUTES.md)**.

### Component Attributes Reference

#### DotGlobe
```jsx
<DotGlobe
  // Globe
  cameraZ={7.5}
  maxParticles={200000}
  dotColor={0x4ade80}
  // Atmosphere
  atmosphereColor={0x4ade80}
  atmosphereOpacity={0.07}
  // Floating particles
  floatCount={150}
  floatColor={0x4ade80}
  // Lighting
  lightColor={0x4ade80}
  // Animation
  autoRotateSpeed={0.002}
  floatRotateSpeed={0.0005}
  mouseInfluence={0.3}
  // Background
  starCount={30000}
  // Layout
  containerHeight="100vh"
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### DotGlobeWithDataLink
```jsx
<DotGlobeWithDataLink
  maxParticles={40000}
  maxLines={100}
  pointsPerLine={60}
  particleColor={0x4ade80}
  beamSpeed={0.8}
  autoRotateSpeed={0.0015}
  backgroundStarCount={20000}
  cameraZ={7.5}
  showBeams={true}
  // Layout
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### EarthAndMoon
```jsx
<EarthAndMoon
  earthSize={0.6}
  moonSize={0.09}
  moonDistance={1.0}
  moonOrbitSpeed={0.02}
  earthRotationSpeed={0.001}
  cloudOpacity={0.4}
  atmosphereOpacity={0.15}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### EarthAndSatellite
```jsx
<EarthAndSatellite
  earthSize={0.6}
  satelliteCount={30}
  satelliteSpeed={0.0015}
  satelliteSpeedVariation={0.004}
  satelliteOrbitRadius={0.72}
  satelliteOrbitVariation={0.12}
  beamFrequency={0.03}
  beamColor={0x10b981}
  beamFadeSpeed={0.02}
  starCount={3000}
  earthRotationSpeed={0.001}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### EarthMoonSatellite
```jsx
<EarthMoonSatellite
  earthSize={0.6}
  moonSize={0.09}
  moonDistance={0.9}
  moonOrbitSpeed={0.02}
  satelliteCount={60}
  satelliteSpeed={0.0015}
  satelliteSpeedVariation={0.004}
  satelliteOrbitRadius={0.72}
  satelliteOrbitVariation={0.12}
  starCount={8000}
  earthRotationSpeed={0.01}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### EarthWithTower
```jsx
<EarthWithTower
  earthSize={0.6}
  starCount={3000}
  signalSpeed={0.012}
  signalTrailLength={30}
  beamColors={[0x00ffcc, 0xff9900]}
  earthRotationSpeed={0.001}
  showTowers={true}
  showSignals={true}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Mercury
```jsx
<Mercury
  mercurySize={0.6}
  mercuryRotationSpeed={0.001}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Venus
```jsx
<Venus
  venusSize={0.6}
  venusRotationSpeed={0.001}
  atmosphereOpacity={0.15}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Mars
```jsx
<Mars
  marsSize={0.6}
  phobosSize={0.05}
  deimosSize={0.04}
  phobosDistance={0.8}
  deimosDistance={1.2}
  phobosOrbitSpeed={0.03}
  deimosOrbitSpeed={0.015}
  marsRotationSpeed={0.001}
  orbitOpacity={0.06}
  tailOpacity={0.8}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  bgImageOpacity={0.4}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Jupiter
```jsx
<Jupiter
  jupiterSize={0.8}
  jupiterRotationSpeed={0.002}
  ringInnerRadius={1.6}
  ringOuterRadius={1.8}
  ringParticleCount={40000}
  ringRotationSpeed={0.005}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={3.2}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Saturn
```jsx
<Saturn
  saturnSize={0.7}
  ringInnerRadius={1.05}
  ringWidth={0.75}
  ringParticleCount={300000}
  saturnRotationSpeed={0.0015}
  ringRotationSpeed={0.011}
  particleRotationSpeed={0.006}
  tilt={26.7}
  ringRotation={0}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={18}
  cameraDistance={3.2}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Uranus
```jsx
<Uranus
  uranusSize={0.65}
  ringInnerRadius={0.85}
  ringWidth={0.25}
  ringParticleCount={30000}
  uranusRotationSpeed={0.0012}
  ringRotationSpeed={0.0008}
  particleRotationSpeed={0.008}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={3.2}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Neptune
```jsx
<Neptune
  neptuneSize={0.65}
  neptuneRotationSpeed={0.0013}
  ringInnerRadius={1.2}
  ringOuterRadius={1.35}
  ringParticleCount={25000}
  ringRotationSpeed={0.005}
  atmosphereOpacity={0.15}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={2.8}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### Pluto
```jsx
<Pluto
  plutoSize={0.7}
  plutoRotationSpeed={0.0008}
  starCount={8000}
  autoRotate={true}
  bgEnabled={true}
  starAngle={0}
  cameraAngle={0}
  cameraDistance={4.5}
  cameraFov={45}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### SolarSystem
```jsx
<SolarSystem
  sunSize={5.0}
  planetSpeedMultiplier={1.0}
  starCount={9000}
  asteroidCount={1900}
  kuiperCount={9000}
  showOrbits={true}
  showTrails={true}
  initialDistance={280}
  autoRotate={true}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### SolarSystemWithFeatures
```jsx
<SolarSystemWithFeatures
  containerHeight="100vh"
  mouseInteractive={true}
/>
```

#### Galaxy
```jsx
<Galaxy
  stars={100000}
  radius={5.4}
  arms={4}
  coreSize={1.6}
  spinCurvature={1.8}
  randomness={0.36}
  innerColor="#ffaa60"
  outerColor="#1b3984"
  starSize={0.05}
  rotationSpeed={0.05}
  tilting={{ x: 0.9, y: 0 }}
  cameraAngle={38}
  cameraDistance={8}
  cameraFov={75}
  starAngle={0}
  enableOptions={true}
  enableStarsBg={true}
  movingStarsBg={true}
  enableImageBg={true}
  bgImageOpacity={0.6}
  textureBaseUrl="https://cdn.jsdelivr.net/gh/Aditya-567/3D-Planets@main/public"
  containerHeight="100vh"
  mouseInteractive={true}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
  className=""
  style={{}}
/>
```

#### LogoWithRotatingText
```jsx
<LogoWithRotatingText
  theme="dark"
  size={96}
  top={undefined}
  bottom={undefined}
  left={undefined}
  right={undefined}
/>
```

---
<img width="1788" height="875" alt="image" src="https://github.com/user-attachments/assets/518aa731-3dd4-4c05-9106-1440645da0bd" />
<img width="679" height="650" alt="image" src="https://github.com/user-attachments/assets/4bd74775-00e3-4941-b413-908efc310192" />
<img width="795" height="613" alt="image" src="https://github.com/user-attachments/assets/644c88a7-aad2-4c29-8679-fd9015748e31" />
<img width="886" height="567" alt="image" src="https://github.com/user-attachments/assets/61db070c-f1c9-49d3-adee-8a056175a9c8" />
<img width="865" height="736" alt="image" src="https://github.com/user-attachments/assets/e831199e-9fd0-4086-a4a8-2a8ec193b9f5" />





