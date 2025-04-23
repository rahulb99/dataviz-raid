---
title: Real-Time Traffic Incidents
---

# Real-Time Traffic Incidents

<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.css" type="text/css">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>


```js
import {map} from "./components/map.js";
map
```

<style>
#map {
  height: 100vh;
  position: absolute;
  top: 0;
  width: 99%;
}

#stats-overlay {
  position: absolute;
  top: 150px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 5px;
  z-index: 1;
  font-family: Arial, sans-serif;
  max-width: 350px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

#stats-overlay hr {
  border-color: rgba(255,255,255,0.3);
  margin: 8px 0;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.mapboxgl-popup {
  border-radius: 8px;
  color: black;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  max-width: 300px;
}

.mapboxgl-popup-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color:rgb(10, 10, 10);
  font-size: 16px;
}

.mapboxgl-popup-content ul {
  list-style-type: none;
  padding-left: 0;
  margin: 8px 0;
}

.mapboxgl-popup-content li {
  margin-bottom: 6px;
}

.mapboxgl-popup-content li span.label {
  color: #aaa;
  text-transform: capitalize;
}

#weather-overlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 5px;
  z-index: 10;
  font-family: Arial, sans-serif;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

#weather-overlay h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #f8f8f8;
  font-size: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  padding-bottom: 8px;
}

.current-weather {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.current-temp {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.temp-value {
  font-size: 24px;
  font-weight: bold;
}

.precip-value {
  font-size: 14px;
  color: #8ecdf9;
}

.current-time {
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
}

.hourly-chart {
  height: 200px;
  margin-top: 10px;
}

#temperature-chart {
  width: 100%;
  height: 100%;
}

.weather-fallback {
  font-size: 12px;
}

.weather-fallback ul {
  padding-left: 15px;
  margin-top: 5px;
}

.weather-fallback li {
  margin-bottom: 3px;
}


</style>