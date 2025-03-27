import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import "./Map.css";

mapboxgl.accessToken = 'pk.eyJ1IjoicmFodWxiOTkiLCJhIjoiY203aHV5dW81MHB2NjJrcHk5OGZzYWlyeCJ9.AX6gxWKvncRUNuvFNw8hbw';

export default function TrafficMap() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [accidentData, setAccidentData] = useState([]);

  useEffect(() => {
    const fetchAccidentData = async () => {
      const url = `https://data.austintexas.gov/resource/dx9v-zd7x.json?$where=traffic_report_status_date_time>'${new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString()}'`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setAccidentData(data);
      } catch (error) {
        console.error("Error fetching accident data:", error);
      }
    };

    fetchAccidentData();

    const initializeMap = () => {
      const newMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-97.73, 30.28],
        zoom: 12,
      });

      newMap.addControl(new mapboxgl.NavigationControl());
      setMap(newMap);
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (map && accidentData.length > 0) {
      const svg = d3.select(map.getCanvasContainer()).append("svg").attr("class", "d3-overlay");

      const projection = d3.geoMercator()
        .scale(250000)
        .center([-97.73, 30.28])
        .translate([map._canvas.width / 2, map._canvas.height / 2]);

      svg.selectAll("circle")
        .data(accidentData)
        .enter()
        .append("circle")
        .attr("cx", d => {
          if (!d.longitude || !d.latitude) return null;
          return projection([parseFloat(d.longitude), parseFloat(d.latitude)])[0];
        })
        .attr("cy", d => {
          if (!d.longitude || !d.latitude) return null;
          return projection([parseFloat(d.longitude), parseFloat(d.latitude)])[1];
        })
        .attr("r", 5)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
          d3.select("#tooltip")
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY + "px")
            .style("display", "block")
            .html(`<b>${d.issue_reported}</b><br>${d.address}<br>Status: ${d.traffic_report_status}`);
        })
        .on("mouseout", () => d3.select("#tooltip").style("display", "none"));
    }
  }, [map, accidentData]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="mapboxgl-map"></div>
      <div id="tooltip"></div>
    </div>
  );
}
