import React from "react";
import TravelMode from "../TravelMode/TravelMode";
import Demographic from "../Demographic/Demographic";

import "./Hotspots.css";

const Hotspots = () => {
  return (
    <><div className="Hotspots">
       <h1>Geo Visualization</h1>
      <div className="geo-container">
        <TravelMode />
        <Demographic />
      </div>
    </div>
    </>
  );
};

export default Hotspots;