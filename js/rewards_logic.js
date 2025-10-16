// --- ELEMENT REFERENCES ---
const progress = document.querySelector(".progress-done");
const input = document.getElementById("inputValue");
const maxInput = document.getElementById("inputMax");

// --- INITIAL VALUES ---
let userPoints = 0;
let goal = 50;

// --- UPDATE PROGRESS BAR DISPLAY ---
function updateProgressBar() {
  if (!goal || goal <= 0) return;
  if (userPoints < 0) userPoints = 0;

  const percentage = Math.min((userPoints / goal) * 100, 100);
  progress.style.width = `${percentage}%`;
  progress.innerText = `${userPoints}/${goal}`;
}

// --- ADD POINTS FUNCTION ---
function addPoints(amount) {
  userPoints += amount;
  console.log(`You gained ${amount} points! Total: ${userPoints}`);
  checkGoal();
  updateProgressBar();
}

// --- SET GOAL FUNCTION ---
function setGoal(newGoal) {
  goal = newGoal;
  console.log(`New goal set: ${goal} points`);
  updateProgressBar();
}

// --- CHECK IF GOAL REACHED ---
function checkGoal() {
  if (userPoints >= goal) {
    console.log("🎉 Goal reached!");
  }
}

// --- RESET POINTS FUNCTION ---
function resetPoints() {
  userPoints = 0;
  console.log("Points reset.");
  updateProgressBar();
}

// --- INPUT LISTENERS (OPTIONAL) ---
if (input) {
  input.addEventListener("keyup", function () {
    userPoints = parseInt(input.value, 10) || 0;
    updateProgressBar();
  });
}

if (maxInput) {
  maxInput.addEventListener("keyup", function () {
    goal = parseInt(maxInput.value, 10) || 0;
    updateProgressBar();
  });
}

// --- INITIALIZE ---
updateProgressBar();