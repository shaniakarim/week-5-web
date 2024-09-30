
const map = L.map('map').setView([65, 25], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326')
    .then(response => response.json())
    .then(data => {
   
        const geoJsonLayer = L.geoJson(data, {
            style: {
                weight: 2
            },
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(feature.properties.name); 
                layer.on('click', () => {
                    
                    Promise.all([
                        fetch('https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f').then(res => res.json()),
                        fetch('https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e').then(res => res.json())
                    ]).then(([posData, negData]) => {
                        const posMigration = posData[feature.properties.name] || 0;
                        const negMigration = negData[feature.properties.name] || 0;
                        const popupContent = `
                            <strong>${feature.properties.name}</strong><br>
                            Positive Migration: ${posMigration}<br>
                            Negative Migration: ${negMigration}
                        `;
                        layer.bindPopup(popupContent).openPopup();
                    });
                });
            }
        }).addTo(map);

        
        map.fitBounds(geoJsonLayer.getBounds());
    });


function getColor(pos, neg) {
    const hue = Math.min((pos / neg) ** 3 * 60, 120);
    return `hsl(${hue}, 75%, 50%)`;
}
function style(feature) {
    const posMigration = 0; 
    const negMigration = 1; V
    return {
        color: getColor(posMigration, negMigration),
        weight: 2
    };
}