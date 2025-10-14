// Store markers by category
const allMarkers = {
  events: [],
  markets: [],
  parks: [],
  toilet: []
};

// Custom icons
const iconEvents = L.icon({
  iconUrl: '/src/events.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconMarkets = L.icon({
  iconUrl: '/src/markets.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconParks = L.icon({
  iconUrl: '/src/parks.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconToilet = L.icon({
  iconUrl: '/src/toilets.png',
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

function focusOnSuburb(suburbName) {
  if (!suburbName) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suburbName + ", Brisbane, Australia")}`)
    .then(res => res.json())
    .then(results => {
      if (results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        map.setView([lat, lon], 14); // Zoom in on suburb
      } else {
        console.warn("Suburb not found:", suburbName);
      }
    });
}

// Unified event processor
function processCombinedEvents(events) {
  const geocodePromises = events.map(record => {
    const venue = record.venue || record.subject || "Untitled Event";
    const address = record.venueaddress || record.location || "";
    const suburb = (address || "").toLowerCase();
    const category = record.event_template || record.event_type || "General";
    const age = record.age || record.agerange || "All ages";
    const date = record.formatteddatetime || record.date || "TBA";
    const description = record.description || "No description available";
    const cost = record.cost || "$$$";

    if (!address) return Promise.resolve(); // Skip if no address

    return geocodeAddress(address).then(coords => {
      if (!coords) return;

      const popupHTML = `
        <div class="popup-card">
          <div class="popup-header">
            <span class="popup-title">${venue}</span>
            <span class="popup-price">${cost}</span>
          </div>
          <div class="popup-meta">
            <div><strong>Category:</strong> ${category}</div>
            <div><strong>Age:</strong> ${age}</div>
            <div><strong>Date:</strong> ${date}</div>
          </div>
          <div class="popup-location">${address}</div>
          <div class="popup-description">${description}</div>
          <button class="popup-button">More Details</button>
        </div>
      `;

      const marker = L.marker([coords.lat, coords.lon], { icon: iconEvents })
        .bindPopup(popupHTML);
      marker.suburb = suburb;

      allMarkers.events.push(marker);
      console.log("Event marker added:", venue, "| Suburb:", suburb);
    });
  });

  return Promise.all(geocodePromises);
}

document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([-27.5, 153.0], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  function focusOnSuburb(suburbName) {
    if (!suburbName) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suburbName + ", Brisbane, Australia")}`)
      .then(res => res.json())
      .then(results => {
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          map.setView([lat, lon], 14); // Zoom in on suburb
        } else {
          console.warn("Suburb not found:", suburbName);
        }
      });
  }

  // Combined Events: Infants & Toddlers + Library Events
  Promise.all([
    fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/infants-and-toddlers-events/records?limit=100").then(res => res.json()),
    fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/library-events/records?limit=100").then(res => res.json())
  ])
  .then(([toddlersData, libraryData]) => {
    const combinedEvents = [...toddlersData.results, ...libraryData.results];
    return processCombinedEvents(combinedEvents);
  })
  .then(() => {
    console.log("All event markers loaded.");
  })
  .catch(err => console.error("Error loading event datasets:", err));

  // Markets
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/markets-events/records?limit=100")
  .then(res => res.json())
  .then(data => {
    const marketRecords = data.results;

    marketRecords.forEach(record => {
      const name = record.subject || "Unnamed Market";
      const address = record.location || record.venueaddress || "";
      const suburb = (address || "").toLowerCase();
      const date = record.formatteddatetime || record.date || "TBA";
      const description = record.description || "No description available";
      const cost = record.cost || "$$$";

      if (!address) return;

      geocodeAddress(address).then(coords => {
        if (!coords) return;

        const popupHTML = `
          <div class="popup-card">
            <div class="popup-header">
              <span class="popup-title">${name}</span>
              <span class="popup-price">${cost}</span>
            </div>
            <div class="popup-meta">
              <div><strong>Date:</strong> ${date}</div>
            </div>
            <div class="popup-location">${address}</div>
            <div class="popup-description">${description}</div>
            <button class="popup-button">More Details</button>
          </div>
        `;

        const marker = L.marker([coords.lat, coords.lon], { icon: iconMarkets })
          .bindPopup(popupHTML);
        marker.suburb = suburb;

        allMarkers.markets.push(marker);
      });
    });
  });

  // Parks
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/park-locations/records?limit=100")
  .then(res => res.json())
  .then(data => {
    const parkRecords = data.results;

    parkRecords.forEach(record => {
      const name = record.park_name || "Unnamed Park";
      const suburbRaw = record.suburb || "";
      const suburb = suburbRaw.trim().toLowerCase();

      const lat = record.latitude;
      const lon = record.longitude;

      if (!lat || !lon) return;

      const popupHTML = `
        <div class="popup-card">
          <strong>${name}</strong><br>
          ${suburbRaw}
        </div>
      `;

      const marker = L.marker([lat, lon], { icon: iconParks })
        .bindPopup(popupHTML);
      marker.suburb = suburb;

      allMarkers.parks.push(marker);
    });
  });

  // Toilets
  fetch("https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/public-toilets-in-brisbane/records?limit=100")
  .then(res => res.json())
  .then(data => {
    const toiletRecords = data.results;

    toiletRecords.forEach(record => {
      const lat = record.latitude;
      const lon = record.longitude;

      if (!lat || !lon) return;

      const name = record.name || "Unnamed Facility";
      const facilityType = record.facilitytype || "Unknown Type";
      const address = record.address || "No address provided";
      const suburbRaw = record.suburb || "";
      const suburb = suburbRaw.trim().toLowerCase();
      const babyChange = record.babychange === "Yes" ? "✅ Baby Change Available" : "❌ No Baby Change";
      const babyCareRoom = record.babycareroom === "Yes" ? "✅ Baby Care Room Available" : "❌ No Baby Care Room";
      const openingHours = record.openinghours || "Opening hours not listed";

      const popupHTML = `
        <div class="popup-card">
          <div class="popup-header">
            <span class="popup-title">${name}</span>
          </div>
          <div class="popup-meta">
            <div><strong>Facility Type:</strong> ${facilityType}</div>
            <div><strong>Address:</strong> ${address}</div>
            <div><strong>Suburb:</strong> ${suburbRaw}</div>
            <div><strong>${babyChange}</strong></div>
            <div><strong>${babyCareRoom}</strong></div>
            <div><strong>Opening Hours:</strong> ${openingHours}</div>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lon], { icon: iconToilet })
        .bindPopup(popupHTML);
      marker.suburb = suburb;

      allMarkers.toilet.push(marker);
    });
  });

  // Filtering Logic
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.type;
      const suburbInput = document.getElementById('suburbInput').value.trim().toLowerCase();

      if (suburbInput !== "") {
        focusOnSuburb(suburbInput);
      } else {
        map.setView([-27.5, 153.0], 10); // Default Brisbane view
      }
      
      document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      Object.values(allMarkers).flat().forEach(marker => {
        map.removeLayer(marker);
      });

      allMarkers[category].forEach(marker => {
        const markerSuburb = marker.suburb || "";
        console.log("Checking marker:", marker.suburb, "| Against input:", suburbInput);


        if (suburbInput === "" || marker.suburb.includes(suburbInput) ||
          markerSuburb.includes(suburbInput.replace(/\s+/g, "-")) ||
          markerSuburb.includes(suburbInput.replace(/\s+/g, ""))
        ) {
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
