import { BrowserRouter } from "react-router-dom";
import EarthwithTower from "./components/earthwithTower";
import DotGlode from "./components/dotGlode";
import DotGlobewithDataLink from "./components/DotGlobewithDataLink"
import EarthandStelite from "./components/EarthandStelite";
import EarthandMoon from "./components/EarthandMoon";
import EarthMoonSatalite from "./components/EarthMoonSatalite";


const App = () => {
  return (
    <BrowserRouter>
      <DotGlode />
      <DotGlobewithDataLink />
      <EarthandStelite/>
      <EarthwithTower />
      <EarthandMoon />
      <EarthMoonSatalite />
    </BrowserRouter>
  );
}

export default App;
