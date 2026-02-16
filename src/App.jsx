import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';

// Import all 3D components
import DotGlobe from './components/DotGlobe';
import DotGlobeWithDataLink from './components/DotGlobeWithDataLink';
import EarthAndMoon from './components/EarthAndMoon';
import EarthAndSatellite from './components/EarthAndSatellite';
import EarthMoonSatellite from './components/EarthMoonSatellite';
import EarthWithTower from './components/EarthWithTower';
import Galaxy from './components/Galaxy';
import Jupiter from './components/Jupiter';
import Mars from './components/Mars';
import Mercury from './components/Mercury';
import Neptune from './components/Neptune';
import Pluto from './components/Pluto';
import Saturn from './components/Saturn';
import SolarSystem from './components/SolarSystem';
import SolarSystemWithFeatures from './components/SolarSystemWithFeatures';
import Uranus from './components/Uranus';
import Venus from './components/Venus';

// Menu items
const menuItems = [
  { path: '/galaxy', label: 'Galaxy Generator' },
  { path: '/dot-globe', label: 'Neural Dot Globe' },
  { path: '/data-link', label: 'Data Mesh Globe' },
  { path: '/satellite', label: 'Orbital Satellite' },
  { path: '/tower', label: 'Earth Tower Link' },
  { path: '/moon', label: 'Lunar Mechanics' },
  { path: '/earth-moon-satellite', label: 'Earth Moon Satellite' },
  { path: '/mercury', label: 'Mercury' },
  { path: '/venus', label: 'Venus' },
  { path: '/mars', label: 'Mars' },
  { path: '/jupiter', label: 'Jupiter' },
  { path: '/saturn', label: 'Saturn' },
  { path: '/uranus', label: 'Uranus' },
  { path: '/neptune', label: 'Neptune' },
  { path: '/pluto', label: 'Pluto' },
  { path: '/solar-system', label: 'Solar System' },
  { path: '/solar-features', label: 'Grand Solar System' },
];

// Main Dashboard with Menu
function MainDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-10 font-bold text-gray-800 mb-2 text-center">3D Space Explorer</h1>
       

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-orange-500"
            >
              <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-500 transition-colors">
                {item.label}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Model Wrapper Component
function ModelWrapper({ component: Component, label }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-10 flex gap-4 items-center">
        <button
          onClick={() => navigate('/')}
          className="bg-black/20 px-4 py-2 rounded-lg shadow-md font-medium"
        >
          ← Back to Menu
        </button>
       
      </div>
      <Component />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
        <Routes>
          {/* Home route */}
          <Route path="/" element={<MainDashboard />} />

          {/* Model routes */}
          <Route path="/galaxy" element={<ModelWrapper component={Galaxy} label="Galaxy Generator" />} />
          <Route path="/dot-globe" element={<ModelWrapper component={DotGlobe} label="Neural Dot Globe" />} />
          <Route path="/data-link" element={<ModelWrapper component={DotGlobeWithDataLink} label="Data Mesh Globe" />} />
          <Route path="/satellite" element={<ModelWrapper component={EarthAndSatellite} label="Orbital Satellite" />} />
          <Route path="/tower" element={<ModelWrapper component={EarthWithTower} label="Earth Tower Link" />} />
          <Route path="/moon" element={<ModelWrapper component={EarthAndMoon} label="Lunar Mechanics" />} />
          <Route path="/earth-moon-satellite" element={<ModelWrapper component={EarthMoonSatellite} label="Earth Moon Satellite" />} />
          <Route path="/mercury" element={<ModelWrapper component={Mercury} label="Mercury" />} />
          <Route path="/venus" element={<ModelWrapper component={Venus} label="Venus" />} />
          <Route path="/mars" element={<ModelWrapper component={Mars} label="Mars" />} />
          <Route path="/jupiter" element={<ModelWrapper component={Jupiter} label="Jupiter" />} />
          <Route path="/saturn" element={<ModelWrapper component={Saturn} label="Saturn" />} />
          <Route path="/uranus" element={<ModelWrapper component={Uranus} label="Uranus" />} />
          <Route path="/neptune" element={<ModelWrapper component={Neptune} label="Neptune" />} />
          <Route path="/pluto" element={<ModelWrapper component={Pluto} label="Pluto" />} />
          <Route path="/solar-system" element={<ModelWrapper component={SolarSystem} label="Solar System" />} />
          <Route path="/solar-features" element={<ModelWrapper component={SolarSystemWithFeatures} label="Grand Solar System" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
