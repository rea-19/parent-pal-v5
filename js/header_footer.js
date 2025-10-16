// ===============================
// LOAD HEADER AND FOOTER
// ===============================
fetch("/html/include/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    // ===============================
    // POPUP FUNCTIONALITY
    // ===============================
    const popupOverlay = document.getElementById('popupOverlay');
    const profileLink = document.getElementById('profileLink');
    const closeBtn = document.querySelector('.close');

    // Open popup when "Profile" link is clicked
    if (profileLink) {
      profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        popupOverlay.style.display = 'flex';
      });
    }

    // Close popup when "x" is clicked
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
      });
    }

    // Close popup when clicking outside the popup
    window.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.style.display = 'none';
      }
    });

    // ===============================
    // LOGIN / SIGNUP SLIDER
    // ===============================
    const loginText = document.querySelector(".title-text .login");
    const loginForm = document.querySelector("form.login");
    const loginBtn = document.querySelector("label.login");
    const signupBtn = document.querySelector("label.signup");
    const signupLink = document.querySelector("form .signup-link a");

    // Show signup form
    signupBtn.onclick = () => {
      loginForm.style.marginLeft = "-50%";
      loginText.style.marginLeft = "-50%";
    };

    // Show login form
    loginBtn.onclick = () => {
      loginForm.style.marginLeft = "0%";
      loginText.style.marginLeft = "0%";
    };

    // When clicking "Signup now" link in login form
    signupLink.onclick = () => {
      signupBtn.click();
      return false; // prevent default
    };

  });

// ===============================
// LOAD FOOTER
// ===============================
fetch("/html/include/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });
