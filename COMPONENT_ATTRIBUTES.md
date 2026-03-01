# Component Attributes Reference

This document provides a comprehensive list of all customizable attributes for each 3D model component in the project.

---

## 1. DotGlobe

**Description:** 3D Interactive Dotted Globe with Satellites

### Attributes:

#### Camera
- `cameraZ` (number, default: 7.5) - Camera z position

#### Dotted Map
- `maxParticles` (number, default: 20000) - Maximum particles on globe surface
- `dotColor` (hex, default: 0x4ade80) - Color of globe dots

#### Atmosphere
- `atmosphereColor` (hex, default: 0x4ade80) - Atmosphere glow color
- `atmosphereOpacity` (number, default: 0.07) - Atmosphere opacity

#### Floating Particles
- `floatCount` (number, default: 150) - Floating particles count
- `floatColor` (hex, default: 0x4ade80) - Floating particles color

#### Satellites
- `orbitCount` (number, default: 3) - Number of satellite orbits
- `orbitRadius` (number, default: 2.5) - Satellite orbit radius
- `orbitSpeed` (number, default: 0.015) - Satellite orbital speed
- `satelliteColor` (hex, default: 0x4ade80) - Satellite color

#### Lights
- `lightColor` (hex, default: 0x4ade80) - Light source color

#### Animation
- `autoRotateSpeed` (number, default: 0.002) - Auto rotation speed
- `floatRotateSpeed` (number, default: 0.0005) - Floating particles rotation speed
- `mouseInfluence` (number, default: 0.3) - Mouse interaction influence

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 2. DotGlobeWithDataLink

**Description:** 3D Globe with Data Link Visualization

### Attributes:

#### Globe
- `maxParticles` (number, default: 40000) - Maximum particles on globe surface
- `particleColor` (hex, default: 0x4ade80) - Color of globe particles
- `cameraZ` (number, default: 7.5) - Camera z position

#### Data Links
- `maxLines` (number, default: 100) - Maximum data link lines
- `pointsPerLine` (number, default: 60) - Points per line segment
- `beamSpeed` (number, default: 0.8) - Speed of data beams

#### Background
- `backgroundStarCount` (number, default: 3000) - Background star count

#### Animation
- `autoRotateSpeed` (number, default: 0.0015) - Auto rotation speed

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 3. EarthAndMoon

**Description:** Earth with Moon system

### Attributes:

#### Earth
- `earthSize` (number, default: 0.6) - Earth size
- `earthRotationSpeed` (number, default: 0.001) - Earth rotation speed
- `cloudOpacity` (number, default: 0.4) - Cloud layer opacity
- `atmosphereOpacity` (number, default: 0.15) - Atmosphere opacity

#### Moon
- `moonSize` (number, default: 0.09) - Moon size
- `moonDistance` (number, default: 1.0) - Distance from Earth
- `moonOrbitSpeed` (number, default: 0.02) - Moon orbital speed

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 4. EarthAndSatellite

**Description:** Earth with orbiting satellites and data beams

### Attributes:

#### Earth
- `earthSize` (number, default: 0.6) - Earth size
- `earthRotationSpeed` (number, default: 0.001) - Earth rotation speed
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Satellites
- `satelliteCount` (number, default: 30) - Number of satellites
- `satelliteSpeed` (number, default: 0.0015) - Base satellite speed
- `satelliteSpeedVariation` (number, default: 0.004) - Speed variation between satellites
- `satelliteOrbitRadius` (number, default: 0.72) - Base orbit radius
- `satelliteOrbitVariation` (number, default: 0.12) - Orbit radius variation

#### Beams
- `beamFrequency` (number, default: 0.03) - Frequency of beam appearance
- `beamColor` (hex, default: 0x10b981) - Beam color
- `beamFadeSpeed` (number, default: 0.02) - Beam fade speed

#### Environment
- `starCount` (number, default: 3000) - Background star count

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 5. EarthMoonSatellite

**Description:** Comprehensive Earth system with Moon and satellites

### Attributes:

#### Earth
- `earthSize` (number, default: 0.6) - Earth size
- `earthRotationSpeed` (number, default: 0.01) - Earth rotation speed
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Moon
- `moonSize` (number, default: 0.09) - Moon size
- `moonDistance` (number, default: 0.9) - Distance from Earth
- `moonOrbitSpeed` (number, default: 0.02) - Moon orbital speed

#### Satellites
- `satelliteCount` (number, default: 60) - Number of satellites
- `satelliteSpeed` (number, default: 0.0015) - Base satellite speed
- `satelliteSpeedVariation` (number, default: 0.004) - Speed variation
- `satelliteOrbitRadius` (number, default: 0.72) - Base orbit radius
- `satelliteOrbitVariation` (number, default: 0.12) - Orbit radius variation

#### Environment
- `starCount` (number, default: 8000) - Background star count

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 6. EarthWithTower

**Description:** Earth with communication towers and signal visualization

### Attributes:

#### Earth
- `earthSize` (number, default: 0.6) - Earth size
- `earthRotationSpeed` (number, default: 0.001) - Earth rotation speed
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Towers & Signals
- `showTowers` (boolean, default: true) - Show communication towers
- `showSignals` (boolean, default: true) - Show signal beams
- `signalSpeed` (number, default: 0.012) - Signal propagation speed
- `signalTrailLength` (number, default: 30) - Length of signal trail
- `beamColors` (array, default: [0x00ffcc, 0xff9900]) - Signal beam colors

#### Environment
- `starCount` (number, default: 3000) - Background star count

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 7. Jupiter

**Description:** Jupiter with faint ring system

### Attributes:

#### Jupiter
- `jupiterSize` (number, default: 0.8) - Jupiter size
- `jupiterRotationSpeed` (number, default: 0.002) - Jupiter rotation speed

#### Rings
- `ringInnerRadius` (number, default: 1.6) - Inner radius of rings
- `ringOuterRadius` (number, default: 1.8) - Outer radius of rings
- `ringParticleCount` (number, default: 40000) - Number of ring particles
- `ringRotationSpeed` (number, default: 0.005) - Ring rotation speed

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 8. Mars

**Description:** Mars with its two moons (Phobos and Deimos)

### Attributes:

#### Mars
- `marsSize` (number, default: 0.6) - Mars size
- `marsRotationSpeed` (number, default: 0.001) - Mars rotation speed

#### Phobos (Inner Moon)
- `phobosSize` (number, default: 0.05) - Phobos size
- `phobosDistance` (number, default: 0.8) - Distance from Mars
- `phobosOrbitSpeed` (number, default: 0.03) - Phobos orbital speed

#### Deimos (Outer Moon)
- `deimosSize` (number, default: 0.04) - Deimos size
- `deimosDistance` (number, default: 1.2) - Distance from Mars
- `deimosOrbitSpeed` (number, default: 0.015) - Deimos orbital speed

#### Visual Effects
- `orbitOpacity` (number, default: 0.06) - Orbit line visibility
- `tailOpacity` (number, default: 0.8) - Moon trail visibility

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 9. Mercury

**Description:** Mercury (simplest planet, no moons or rings)

### Attributes:

#### Mercury
- `mercurySize` (number, default: 0.6) - Mercury size
- `mercuryRotationSpeed` (number, default: 0.001) - Mercury rotation speed

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 10. Venus

**Description:** Venus with thick atmosphere

### Attributes:

#### Venus
- `venusSize` (number, default: 0.6) - Venus size
- `venusRotationSpeed` (number, default: 0.001) - Venus rotation speed
- `atmosphereOpacity` (number, default: 0.15) - Atmosphere layer opacity

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 11. Saturn

**Description:** Saturn with prominent ring system

### Attributes:

#### Saturn
- `saturnSize` (number, default: 0.7) - Saturn size
- `saturnRotationSpeed` (number, default: 0.0015) - Saturn rotation speed
- `tilt` (number, default: 26.7) - Axial tilt in degrees

#### Rings
- `ringInnerRadius` (number, default: 1.05) - Inner radius of rings
- `ringWidth` (number, default: 0.75) - Width of ring system
- `ringParticleCount` (number, default: 300000) - Number of ring particles
- `ringRotationSpeed` (number, default: 0.011) - Ring rotation speed
- `particleRotationSpeed` (number, default: 0.006) - Particle ring speed
- `ringRotation` (number, default: 0) - Initial ring rotation in degrees

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 12. Uranus

**Description:** Uranus with thin ring system

### Attributes:

#### Uranus
- `uranusSize` (number, default: 0.65) - Uranus size
- `uranusRotationSpeed` (number, default: 0.0012) - Uranus rotation speed

#### Rings
- `ringInnerRadius` (number, default: 0.85) - Inner radius of rings
- `ringWidth` (number, default: 0.25) - Width of ring system
- `ringParticleCount` (number, default: 30000) - Number of ring particles (faint)
- `ringRotationSpeed` (number, default: 0.0008) - Ring rotation speed
- `particleRotationSpeed` (number, default: 0.008) - Particle rotation speed

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 13. Neptune

**Description:** Neptune with very faint ring system

### Attributes:

#### Neptune
- `neptuneSize` (number, default: 0.65) - Neptune size
- `neptuneRotationSpeed` (number, default: 0.0013) - Neptune rotation speed
- `atmosphereOpacity` (number, default: 0.15) - Atmosphere opacity

#### Rings
- `ringInnerRadius` (number, default: 1.2) - Inner radius of rings
- `ringOuterRadius` (number, default: 1.35) - Outer radius of rings
- `ringParticleCount` (number, default: 25000) - Number of ring particles
- `ringRotationSpeed` (number, default: 0.005) - Ring rotation speed

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 14. Pluto

**Description:** Pluto (dwarf planet)

### Attributes:

#### Pluto
- `plutoSize` (number, default: 0.7) - Pluto size
- `plutoRotationSpeed` (number, default: 0.0008) - Pluto rotation speed

#### Environment
- `starCount` (number, default: 8000) - Background star count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 15. SolarSystem

**Description:** Complete Solar System with all planets, asteroids, and Kuiper belt

### Attributes:

#### Sun
- `sunSize` (number, default: 5.0) - Sun size

#### System
- `planetSpeedMultiplier` (number, default: 1.0) - Multiplier for all planet orbital speeds
- `initialDistance` (number, default: 280) - Initial camera distance

#### Visual Elements
- `showOrbits` (boolean, default: true) - Show orbital paths
- `showTrails` (boolean, default: true) - Show planet trails

#### Environment
- `starCount` (number, default: 9000) - Background star count
- `asteroidCount` (number, default: 1900) - Asteroid belt count
- `kuiperCount` (number, default: 9000) - Kuiper belt count
- `autoRotate` (boolean, default: true) - Enable auto-rotation

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the model

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 16. SolarSystemWithFeatures

**Description:** Enhanced Solar System with detailed planetary data and UI controls

### Attributes:

This component includes all the features from `SolarSystem` plus:

#### Additional Features
- Interactive UI with celestial body information
- Planet selection and detailed views
- Temperature, radius, and moon count data
- Orbital inclination and eccentricity visualization
- Label toggle functionality
- View modes: System view and individual body view

#### Included Celestial Bodies
**Planets:** Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune

**Dwarf Planets:** Pluto, Ceres, Haumea, Makemake, Eris

**Special Features:**
- Earth with Moon
- Saturn with prominent rings
- Uranus with tilted rings
- Asteroid belt
- Kuiper belt objects

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the solar system

---

## 17. Galaxy

**Description:** Spiral galaxy visualization with customizable parameters

### Attributes:

#### Galaxy Structure
- `stars` (number, default: 100000) - Number of stars in galaxy
- `radius` (number, default: 5.4) - Galaxy radius
- `arms` (number, default: 4) - Number of spiral arms
- `coreSize` (number, default: 1.6) - Size of galactic core
- `spinCurvature` (number, default: 1.8) - Spiral arm curvature
- `randomness` (number, default: 0.36) - Star position randomness

#### Colors
- `innerColor` (string/hex, default: '#ffaa60') - Core/inner color
- `outerColor` (string/hex, default: '#1b3984') - Outer arm color

#### Star Appearance
- `starSize` (number, default: 0.05) - Size of individual stars
- `rotationSpeed` (number, default: 0.05) - Galaxy rotation speed

#### Camera & Orientation
- `tilting` (object, default: { x: 0.9, y: 0 }) - Galaxy tilt angles

#### UI Options
- `enableOptions` (boolean, default: true) - Show control panel
- `enableStarsBg` (boolean, default: true) - Show background stars (points)
- `movingStarsBg` (boolean, default: true) - Animate background stars
- `enableImageBg` (boolean, default: true) - Use image background

#### Interaction
- `mouseInteractive` (boolean, default: true) - Enable or disable mouse/touch drag to rotate the galaxy

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning
- `className` (string, default: "") - Additional CSS classes
- `style` (object, default: {}) - Inline styles

---

## 18. LogoWithRotatingText

**Description:** Animated logo with rotating text overlay

### Attributes:

#### Display
- `theme` (string, default: "dark") - Theme: "dark" or "light"
- `size` (number, default: 96) - Size in pixels (width and height)

#### Logo Images
Uses 6 logo variants that rotate automatically:
- logo.svg
- logo1.svg
- logo2.svg
- logo3.svg
- logo4.svg
- logo5.svg

#### Text
- Displays "COSMOS" text rotating around the logo
- Auto-rotates every 3 seconds with flip animation

#### CSS Positioning
- `top` (string) - CSS top positioning
- `bottom` (string) - CSS bottom positioning
- `left` (string) - CSS left positioning
- `right` (string) - CSS right positioning

---

## Common Interaction Attribute

Most 3D model components support mouse/touch interaction control:
- `mouseInteractive` (boolean, default: `true`) - Enable or disable mouse/touch drag to rotate the model. Set to `false` to make the model display-only.

**Supports `mouseInteractive`:** DotGlobeWithDataLink, EarthAndMoon, EarthAndSatellite, EarthMoonSatellite, EarthWithTower, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, SolarSystem, SolarSystemWithFeatures, Galaxy

---

## Common Positioning Attributes

All components support CSS positioning through:
- `top`, `bottom`, `left`, `right` - Absolute positioning values
- `className` - Additional CSS classes
- `style` - Inline style object

---

## Usage Examples

### Basic Usage
```jsx
import { EarthAndMoon } from '3d-solar-system-globe';

<EarthAndMoon 
  earthSize={0.8}
  moonSize={0.12}
  starCount={10000}
/>
```

### Advanced Customization
```jsx
import { Saturn } from '3d-solar-system-globe';

<Saturn 
  saturnSize={0.9}
  ringInnerRadius={1.2}
  ringWidth={0.9}
  ringParticleCount={500000}
  saturnRotationSpeed={0.002}
  tilt={30}
  starCount={12000}
/>
```

### With Positioning
```jsx
import { DotGlobe } from '3d-solar-system-globe';

<DotGlobe 
  dotColor={0xff0000}
  orbitCount={5}
  top="50px"
  left="100px"
  className="my-custom-class"
/>
```

---

## Notes

1. **Color Format:** Colors are specified as hexadecimal numbers (e.g., 0x4ade80) or strings (e.g., '#ffaa60')
2. **Size Units:** Most size values are relative to the scene scale, not pixels
3. **Speed Values:** Smaller values result in slower motion
4. **Performance:** Higher particle counts may impact performance on lower-end devices
5. **Textures:** Components use texture files from the public directory (e.g., '8k_stars.webp', 'earth_daymap.jpg')

---

*Generated on March 1, 2026*
