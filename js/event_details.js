$(document).ready(function () {
  // -----------------------------
  // GET QUERY PARAMETERS
  // -----------------------------
  const getQueryParam = name => new URLSearchParams(window.location.search).get(name);
  const subject = getQueryParam("subject");
  const start = getQueryParam("start");
  const end = getQueryParam("end");

  if (!subject || !start || !end) {
    $("#event-details").html("<p>Missing event details.</p>");
    return;
  }

  // -----------------------------
  // FETCH EVENT DATA FROM APIs
  // -----------------------------
  const apiURLs = [
    "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/infants-and-toddlers-events/records?limit=100",
    "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/library-events/records?limit=100"
  ];

  Promise.all(apiURLs.map(url => fetch(url).then(res => res.json())))
    .then(datasets => {
      const allResults = datasets.flatMap(data => data.results);

      const record = allResults.find(r =>
        r.subject === subject &&
        r.start_datetime === start &&
        r.end_datetime === end
      );

      if (record) {
        let bookingButton = `<button class="booking-button open-popup">No Booking Required</button>`;

        if (record.booking) {
          const match = record.booking.match(/href=["']([^"']+)["']/);
          if (match && match[1]) {
            bookingButton = `
              <a href="${match[1]}" target="_blank">
                <button class="booking-button open-popup">Book Now</button>
              </a>`;
          } else {
            bookingButton = `<button class="booking-button open-popup">Booking Info Unavailable</button>`;
          }
        }

        $("#event-details").html(`
          <section class="event-details">
            <div class="event-box">
              <div class="event-image" style="background-image: url('${record.eventimage || "https://source.unsplash.com/featured/?event,library"}');">
                <h2 class="event-heading">${record.subject}</h2>
              </div>
              <p class="event-description">${record.description || "No description for this event."}</p>
              <div class="event-info">
                <p class="filter"><strong>Date:</strong> ${record.formatteddatetime}</p>
                <p class="filter"><strong>Location:</strong> ${record.location}</p>
                <p class="filter"><strong>Age:</strong> ${record.age}</p>
                <p class="filter"><strong>Event Type:</strong> ${record.primaryeventtype || "N/A"}</p>
                <p class="filter"><strong>Cost:</strong> ${record.cost || "N/A"}</p>
              </div>
              ${bookingButton}
            </div>
          </section>
        `);
      } else {
        $("#event-details").html("<p>Event not found.</p>");
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      $("#event-details").html("<p>Error loading event details.</p>");
    });

  // -----------------------------
  // POPUP FUNCTIONALITY
  // -----------------------------
  const overlay = document.getElementById("overlay");
  const closePopup = document.getElementById("closepopup");
  const loginBtn = document.querySelector(".login");
  const signupBtn = document.querySelector(".signup");
  const loginBox = document.querySelector(".login-box");
  const signupBox = document.querySelector(".signup-box");
  const signupTrigger = document.getElementById("signupTrigger");

  if (!overlay) return;

  // -----------------------------
  // OPEN POPUP (Book/Info buttons)
  // -----------------------------
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("open-popup")) {
      e.preventDefault();
      overlay.classList.add("active");
      document.body.style.overflow = "hidden"; // prevent scrolling
      loginBox.classList.add("active");
      loginBtn.classList.add("active");
      signupBox.classList.remove("active");
      signupBtn.classList.remove("active");
    }
  });

  // -----------------------------
  // OPEN POPUP (Separate Sign Up button)
  // -----------------------------
  if (signupTrigger && overlay) {
    signupTrigger.addEventListener("click", () => {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden"; // prevent scrolling
      loginBox.classList.remove("active");
      signupBox.classList.add("active");
      loginBtn.classList.remove("active");
      signupBtn.classList.add("active");
    });
  }

  // -----------------------------
  // CLOSE POPUP
  // -----------------------------
  if (closePopup) {
    closePopup.addEventListener("click", () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "auto"; // re-enable scrolling
    });
  }

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // -----------------------------
  // SWITCH BETWEEN LOGIN & SIGNUP
  // -----------------------------
  if (loginBtn && signupBtn && loginBox && signupBox) {
    loginBtn.addEventListener("click", () => {
      loginBox.classList.add("active");
      signupBox.classList.remove("active");
      loginBtn.classList.add("active");
      signupBtn.classList.remove("active");
    });

    signupBtn.addEventListener("click", () => {
      signupBox.classList.add("active");
      loginBox.classList.remove("active");
      signupBtn.classList.add("active");
      loginBtn.classList.remove("active");
    });
  }
});
