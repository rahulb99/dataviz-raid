import mapboxgl from 'npm:mapbox-gl';

// I know this is not the best practice, but I'm just trying to get the map to work
// I'll change this later
mapboxgl.accessToken = 'pk.eyJ1IjoicmFodWxiOTkiLCJhIjoiY203aHV5dW81MHB2NjJrcHk5OGZzYWlyeCJ9.AX6gxWKvncRUNuvFNw8hbw';

// Create and style the map container
const mapContainer = document.createElement('div');
mapContainer.id = 'map';
mapContainer.style.height = '100vh';
mapContainer.style.width = '100vw';
mapContainer.style.position = 'absolute';
mapContainer.style.top = '0';
mapContainer.style.left = '0';
document.body.appendChild(mapContainer);

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-97.73, 30.28], // starting position
    zoom: 12 // starting zoom
});

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

const url = `https://data.austintexas.gov/resource/dx9v-zd7x.json?$where=traffic_report_status_date_time>'${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}'`;
const accidentData = await fetch(url)
    .then(response => response.json())
    .then(data => {
        const geojson = {
            type: 'FeatureCollection',
            features: data.map(d => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [d.longitude, d.latitude]
                },
                properties: {
                    // traffic_report_id: d.traffic_report_id,
                    address: d.address,
                    issue_reported: d.issue_reported,
                    reported_at: d.published_date,
                    reported_by: d.agency.trim(),
                    status: d.traffic_report_status
                }
            }))
        };
        return geojson;
    });

const showPopup = (feature) => {
    return `<div class="map-overlay-inner" style="padding: 10px; background: #fff; border-radius: 3px;">
        <code>${feature.properties.issue_reported}</code><hr>
        ${Object.entries(feature.properties)
            .filter(([key]) => key !== 'issue_reported')
            .map(([key, value]) => `<li><b>${key}</b>: ${value}</li>`)
            .join('')}
    </div>`;
};

// Add points from accident.json (longitude, latitude) to the map
map.on('load', () => {
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
});

export default map;