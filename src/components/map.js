import mapboxgl from 'npm:mapbox-gl';
import { fetchWeatherApi } from 'npm:openmeteo';

async function fetchWeatherData(latitude, longitude) {
    const params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "precipitation", "visibility"],
        "current": ["temperature_2m", "is_day", "precipitation"],
        "timezone": "America/Chicago",
        "past_days": 1,
        "forecast_days": 1,
        "wind_speed_unit": "mph",
        "temperature_unit": "fahrenheit"
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    console.log('Weather API responses:', responses);

    // Helper function to form time ranges
    const range = (start, stop, step) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current();
    const hourly = response.hourly();

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
        current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            temperature2m: current.variables(0).value(),
            isDay: current.variables(1).value(),
            precipitation: current.variables(2).value(),
        },
        hourly: {
            time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            temperature2m: hourly.variables(0).valuesArray(),
            precipitation: hourly.variables(1).valuesArray(),
            visibility: hourly.variables(2).valuesArray(),
        },
    };

    // Optional logging for debugging
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
        console.log(
            weatherData.hourly.time[i].toISOString(),
            weatherData.hourly.temperature2m[i],
            weatherData.hourly.precipitation[i],
            weatherData.hourly.visibility[i]
        );
    }
    
    return weatherData;
}

// Fetch past 24 hours of traffic accident data from the City of Austin
const url = `https://data.austintexas.gov/resource/dx9v-zd7x.json?$where=traffic_report_status_date_time>'${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}'`;
const accidentData = await fetch(url)
    .then(response => response.json())
    .then(data => {
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(d => {
            // Convert UTC to US Central Time
            const utcDate = new Date(d.published_date);
            const options = { timeZone: 'America/Chicago', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const centralTimeString = utcDate.toLocaleString('en-US', options);
            
            return {
                type: 'Feature',
                geometry: {
                type: 'Point',
                coordinates: [d.longitude, d.latitude]
                },
                properties: {
                address: d.address,
                issue_reported: d.issue_reported,
                reported_at: centralTimeString,
                reported_by: d.agency.trim(),
                status: d.traffic_report_status
                }
            };
            })
        };
        return geojson;
    });

mapboxgl.accessToken = 'pk.eyJ1IjoicmFodWxiOTkiLCJhIjoiY203aHV5dW81MHB2NjJrcHk5OGZzYWlyeCJ9.AX6gxWKvncRUNuvFNw8hbw';

// Create and style the map container
const mapContainer = document.createElement('div');
mapContainer.id = 'map';
document.body.appendChild(mapContainer);

// Create weather chart container
const weatherContainer = document.createElement('div');
weatherContainer.id = 'weather-chart';
document.body.appendChild(weatherContainer);

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-97.73, 30.28], // starting position
    zoom: 12 // starting zoom
});

// Add the control to the map.
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// Show a popup with the accident details when a point is clicked
const showPopup = (feature) => {
    return `
        <h3>${feature.properties.issue_reported.trim()}</h3>
        <ul>
            ${Object.entries(feature.properties)
                .filter(([key]) => key !== 'issue_reported')
                .map(([key, value]) => 
                    `<li><span class="label">${key.replace(/_/g, ' ')}:</span> ${value}</li>`)
                .join('')}
        </ul>
    `;
};

// Add points from accident.json (longitude, latitude) to the map
map.on('load', async () => {
    map.addSource('accidents', {
        type: 'geojson',
        data: accidentData
    });

    map.addLayer({
        id: 'accidents',
        type: 'circle',
        source: 'accidents',
        paint: {
            'circle-radius': 5,
            'circle-color': [
                'case',
                ['==', ['get', 'status'], 'ARCHIVED'],
                'green',
                'red'
            ]
        }
    });

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'stats-overlay';

    // Calculate statistics
    const totalAccidents = accidentData.features.length;
    const activeAccidents = accidentData.features.filter(f => f.properties.status !== 'ARCHIVED').length;
    const archivedAccidents = accidentData.features.filter(f => f.properties.status === 'ARCHIVED').length;

    // Create content for overlay
    overlay.innerHTML = `
        <div>Last 24 Hours</div>
        <hr>
        <div class="stats-row">
            <span>Total Accidents:</span>
            <span><b>${totalAccidents}</b></span>
        </div>
        <div class="stats-row">
            <span>Active (Red):</span>
            <span><b>${activeAccidents}</b></span>
        </div>
        <div class="stats-row">
            <span>Resolved (Green):</span>
            <span><b>${archivedAccidents}</b></span>
        </div>
    `;

    // Add overlay to the map container
    mapContainer.appendChild(overlay);

    map.on('click', 'accidents', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();

        new mapboxgl.Popup({ offset: 10})
            .setLngLat(coordinates)
            .setHTML(showPopup(e.features[0]))
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'accidents', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'accidents', () => {
        map.getCanvas().style.cursor = '';
    });

    // Add weather chart after map loads
    // try {
        // Get Austin's coordinates for weather data
        const austinLat = 30.28;
        const austinLng = -97.73;
        
        // Fetch weather data for Austin
        const weatherData = await fetchWeatherData(austinLat, austinLng);
        // Create weather chart
        createWeatherChart(weatherData);
    // } catch (error) {
    //     console.error('Error loading weather data:', error);
    // }
});

// Function to create weather chart with D3
function createWeatherChart(weatherData) {
    // Create weather overlay container
    const weatherOverlay = document.createElement('div');
    weatherOverlay.id = 'weather-overlay';
    
    // Create header
    const header = document.createElement('h3');
    header.textContent = 'Weather Conditions';
    weatherOverlay.appendChild(header);
    
    // Create current conditions section
    const currentSection = document.createElement('div');
    currentSection.className = 'current-weather';
    
    // Format current temperature and precipitation
    const currTemp = Math.round(weatherData.current.temperature2m);
    const currPrecip = weatherData.current.precipitation;
    
    currentSection.innerHTML = `
        <div class="current-temp">
            <span class="temp-value">${currTemp}°F</span>
            <span class="precip-value">Precipitation: ${currPrecip}″</span>
        </div>
        <div class="current-time">
            Current conditions as of ${weatherData.current.time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}
        </div>
    `;
    weatherOverlay.appendChild(currentSection);
    
    // Create hourly forecast section
    const chartSection = document.createElement('div');
    chartSection.className = 'hourly-chart';
    
    // Create canvas element for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'temperature-chart';
    chartSection.appendChild(canvas);
    weatherOverlay.appendChild(chartSection);
    
    // Add the weather overlay to the page
    mapContainer.appendChild(weatherOverlay);
    
    // Create the chart using Chart.js (you'll need to add this script to your HTML)
    if (window.Chart) {
        const ctx = canvas.getContext('2d');
        
        // Get next 12 hours of data
        const times = weatherData.hourly.time.slice(0, 12);
        const temps = weatherData.hourly.temperature2m.slice(0, 12);
        const precips = weatherData.hourly.precipitation.slice(0, 12);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: times.map(t => t.toLocaleTimeString('en-US', {hour: 'numeric', hour12: true})),
                datasets: [
                    {
                        label: 'Temperature (°F)',
                        data: temps,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        yAxisID: 'y',
                        tension: 0.4
                    },
                    {
                        label: 'Precipitation (in)',
                        data: precips,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Precipitation (in)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    } else {
        // Fallback if Chart.js isn't available
        const fallback = document.createElement('div');
        fallback.className = 'weather-fallback';
        fallback.innerHTML = `
            <p>Weather forecast for next 12 hours:</p>
            <ul>
                ${weatherData.hourly.time.slice(0, 6).map((time, i) => `
                    <li>${time.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})}: 
                        ${Math.round(weatherData.hourly.temperature2m[i])}°F, 
                        Precipitation: ${weatherData.hourly.precipitation[i]}″</li>
                `).join('')}
            </ul>
        `;
        chartSection.appendChild(fallback);
    }
}

export default map;