import React from "react";
import Cards from "../Cards/Cards";
import Map from "../../Map/Map";
import RightSide from '../RigtSide/RightSide';


import "./MainDash.css";
const MainDash = () => {
  return (
    <div className="MainDash">
      <h1>Roadway Analytics & Incident Dashboard</h1>
      {/* <Cards /> */}
      <Map />
      {/* <RightSide /> */}
    </div>
  );
};

export default MainDash;
