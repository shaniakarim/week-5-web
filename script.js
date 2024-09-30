// Check if the document is loaded
if (document.readyState !== "loading") {
    console.log("Document is ready!");
    getData();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      console.log("Document is loading!");
      getData();
    });
  }
  
  // Fetch the main map data
  async function getData() {
    let url = await fetch("https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326");
    let data = await url.json();
    loadMap(data);
  }
  
  // Fetch migration data
  async function getMigrationData() {
    let posMigration = await fetch("https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f");
    let negMigration = await fetch("https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e");
  
    let posData = await posMigration.json();
    let negData = await negMigration.json();
  
    return {
      posIndex: posData.dataset.dimension.Tuloalue.category.index,
      posValues: posData.dataset.value,
      negIndex: Object.values(negData.dataset.dimension)[0].category.index,
      negValues: negData.dataset.value,
    };
  }
  
  // Simple color calculation
  function getColor(pos, neg) {
    let ratio = pos / neg;
    let hue = Math.min(ratio ** 3 * 60, 120);
    return `hsl(${hue}, 75%, 50%)`;
  }
  
  // Initialize and display map
  async function loadMap(geoData) {
    let map = L.map("map").setView([65.0121, 25.4651], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  
    let migrationData = await getMigrationData();
  
    L.geoJSON(geoData, {
      onEachFeature: function (feature, layer) {
        let kuntaCode = feature.properties.kunta;
        let posMigration = migrationData.posValues[migrationData.posIndex["KU" + kuntaCode]] || 0;
        let negMigration = migrationData.negValues[migrationData.negIndex["KU" + kuntaCode]] || 0;
  
        let color = getColor(posMigration, negMigration);
        layer.setStyle({ color: color, fillColor: color });
  
        layer.bindTooltip(feature.properties.nimi);
        layer.on("click", function () {
          layer.bindPopup(
            `<b>${feature.properties.nimi}</b><br>Positive: ${posMigration}<br>Negative: ${negMigration}`
          ).openPopup();
        });
      },
    }).addTo(map);
  }
  