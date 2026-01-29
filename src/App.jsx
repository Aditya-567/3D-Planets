import { BrowserRouter } from "react-router-dom";
import EarthandMoon from "./components/EarthandMoon";
import EarthMoonSatalite from "./components/EarthMoonSatalite";


const App = () => {
  return (
    <BrowserRouter>
      <EarthandMoon />
      <EarthMoonSatalite />
    </BrowserRouter>
  );
}

export default App;
