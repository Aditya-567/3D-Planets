import { BrowserRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard";


const App = () => {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

export default App;
