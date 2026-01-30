import { BrowserRouter } from "react-router-dom";
import EarthWithTower from "./components/EarthWithTower";
import DotGlobe from "./components/DotGlobe";
import DotGlobeWithDataLink from "./components/DotGlobeWithDataLink"
import EarthAndSatellite from "./components/EarthAndSatellite";
import EarthAndMoon from "./components/EarthAndMoon";
import EarthMoonSatellite from "./components/EarthMoonSatellite";
import SolarSystem from "./components/SolarSystem";


const App = () => {
  return (
    <BrowserRouter>
      <DotGlobe />
      <DotGlobeWithDataLink />
      <EarthAndSatellite />
      <EarthWithTower />
      <EarthAndMoon />
      <EarthMoonSatellite />
      <SolarSystem />
    </BrowserRouter>
  );
}

export default App;
