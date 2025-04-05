import React from "react";
import Map from "../../Map/Map";
import Cards from "../Cards/Cards";

import "./Hotspots.css";
const Hotspots = () => {
  return (
    <><div className="Hotspots">
       <h1>Geo Visualization</h1>
       {/* Plot incident coordinates with colored markers by type (Crash, Stalled, etc.)
          Show heatmap or clustering for hotspot analysis
          Add tooltips with address, issue_reported, and timestamp */}
       
      {/* <Cards /> */}
      <Map />
    </div>
    </>
  );
};

export default Hotspots;



// import React from "react";
// import Cards from "../Cards/Cards";

// import "./MainDash.css";
// const MainDash = () => {
//   return (
//     <div className="MainDash">
//       <h1>Roadway Analytics & Incident Dashboard</h1>
//       <Cards />
//     </div>
//   );
// };

// export default MainDash;
