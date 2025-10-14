// Store markers by category
const allMarkers = {
  events: [],
  markets: [],
  parks: [],
  toilet: []
};

// Custom icons
const iconEvents = L.icon({
  iconUrl: '/src/events.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconMarkets = L.icon({
  iconUrl: '/src/markets-colored.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconParks = L.icon({
  iconUrl: '/src/parks-colored.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconToilet = L.icon({
  iconUrl: '/src/toilet-colored.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Geocode function using Nominatim
function geocodeAddress(address) {
  return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then(res => res.json())
    .then(results => {
      if (results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon)
        };
      } else {
        return null;
      }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([-27.5, 153.0], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  //  Infants & Toddlers Events with Geocoding
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/infants-and-toddlers-events/records?limit=100")
    .then(res => res.json())
    .then(data => {
      data.results.forEach(record => {
        const venue = record.venue || record.subject;
        const address = record.venueaddress;
        const suburb = (address || "").toLowerCase();

        if (address) {
          geocodeAddress(address).then(coords => {
            if (coords) {
              const marker = L.marker([coords.lat, coords.lon], { icon: iconEvents })
                .bindPopup(`<strong>${venue}</strong><br>${address}`);
              marker.suburb = suburb;

              marker.on('click', () => {
                document.getElementById('eventTitle').textContent = venue;
                document.getElementById('eventCategory').textContent = record.event_template || "Infants & Toddlers";
                document.getElementById('eventAge').textContent = record.age || "All ages";
                document.getElementById('eventDate').textContent = record.formatteddatetime || "TBA";
                document.getElementById('eventDescription').textContent = record.description || "No description available";
                document.getElementById('eventDetailsPanel').classList.remove('hidden');
              });

              allMarkers.events.push(marker);
            } else {
              console.warn("Geocoding failed for:", address);
            }
          });
        }
      });
    })
    .catch(err => console.error("Error loading infants & toddlers events:", err));

  // Markets
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/markets-events/records?limit=100")
    .then(res => res.json())
    .then(data => {
      data.results.forEach(record => {
        const lat = record.latitude;
        const lon = record.longitude;
        const name = record.subject;
        const suburb = (record.suburb || "").toLowerCase();

        if (lat && lon) {
          const marker = L.marker([lat, lon], { icon: iconMarkets })
            .bindPopup(`<strong>${name}</strong><br>${record.suburb || ""}`);
          marker.suburb = suburb;
          allMarkers.markets.push(marker);
        }
      });
    });

  // Parks
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/park-locations/records?limit=100")
    .then(res => res.json())
    .then(data => {
      data.results.forEach(record => {
        const lat = record.latitude;
        const lon = record.longitude;
        const name = record.park_name;
        const suburb = (record.suburb || "").toLowerCase();

        if (lat && lon) {
          const marker = L.marker([lat, lon], { icon: iconParks })
            .bindPopup(`<strong>${name}</strong><br>${record.suburb || ""}`);
          marker.suburb = suburb;
          allMarkers.parks.push(marker);
        }
      });
    });

  // Toilets
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/public-toilets-in-brisbane/records?limit=100")
    .then(res => res.json())
    .then(data => {
      data.results.forEach(record => {
        const lat = record.latitude;
        const lon = record.longitude;
        const name = record.name || "Toilet";
        const suburb = (record.suburb || "").toLowerCase();

        if (lat && lon) {
          const marker = L.marker([lat, lon], { icon: iconToilet })
            .bindPopup(`<strong>${name}</strong><br>${record.suburb || ""}`);
          marker.suburb = suburb;
          allMarkers.toilet.push(marker);
        }
      });
    });

  // Filtering Logic
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.type;
      const suburbInput = document.getElementById('suburbInput').value.trim().toLowerCase();

      document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      Object.values(allMarkers).flat().forEach(marker => {
        map.removeLayer(marker);
      });

      allMarkers[category].forEach(marker => {
        if (suburbInput === "" || marker.suburb.includes(suburbInput)) {
          marker.addTo(map);
        }
      });

      document.getElementById('eventDetailsPanel').classList.add('hidden');
    });
  });

  // Hide panel when clicking on map
  map.on('click', () => {
    document.getElementById('eventDetailsPanel').classList.add('hidden');
  });
});

