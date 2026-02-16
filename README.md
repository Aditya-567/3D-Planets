# 3d-solar-system-globe

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
  saturnSize={0.9}
  ringInnerRadius={1.2}
  ringWidth={0.9}
  ringParticleCount={500000}
  saturnRotationSpeed={0.002}
  tilt={30}
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

### Quick Reference

#### DotGlobe
```jsx
<DotGlobe 
  cameraZ={7.5}
  maxParticles={20000}
  dotColor={0x4ade80}
  orbitCount={3}
  orbitSpeed={0.015}
  satelliteColor={0x4ade80}
  autoRotateSpeed={0.002}
/>
```

#### EarthAndMoon
```jsx
<EarthAndMoon 
  earthSize={0.6}
  moonSize={0.09}
  moonDistance={1.0}
  moonOrbitSpeed={0.02}
  starCount={8000}
  autoRotate={true}
/>
```

#### Saturn
```jsx
<Saturn 
  saturnSize={0.7}
  ringInnerRadius={1.05}
  ringWidth={0.75}
  ringParticleCount={300000}
  tilt={26.7}
  autoRotate={true}
/>
```

#### Galaxy
```jsx
<Galaxy 
  stars={100000}
  radius={5.4}
  arms={4}
  spinCurvature={1.8}
  innerColor="#ffaa60"
  outerColor="#1b3984"
  rotationSpeed={0.05}
/>
```

---
<img width="1788" height="875" alt="image" src="https://github.com/user-attachments/assets/518aa731-3dd4-4c05-9106-1440645da0bd" />
<img width="679" height="650" alt="image" src="https://github.com/user-attachments/assets/4bd74775-00e3-4941-b413-908efc310192" />
<img width="795" height="613" alt="image" src="https://github.com/user-attachments/assets/644c88a7-aad2-4c29-8679-fd9015748e31" />
<img width="886" height="567" alt="image" src="https://github.com/user-attachments/assets/61db070c-f1c9-49d3-adee-8a056175a9c8" />
<img width="865" height="736" alt="image" src="https://github.com/user-attachments/assets/e831199e-9fd0-4086-a4a8-2a8ec193b9f5" />





