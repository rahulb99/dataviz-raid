import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import MainDash from './components/MainDash/MainDash';
import RightSide from './components/RigtSide/RightSide';
import Sidebar from './components/Sidebar';
import Hotspots from './components/Hotspots/Hotspots';
import Home from "./components/Home/Home";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="AppGlass">
          <Sidebar />
          <Routes>
          <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<MainDash />} />
            <Route path="/Hotspots" element={<Hotspots />} />
          </Routes>
          <RightSide />
          
          {/* <Hotspots/> */}
        </div>
      </div>
    </Router>
  );
}

export default App;
