// Global State

let allIssues = [];
let currentTab = "All";

// Login Logic

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "admin123") {
      document.getElementById("loginPage").classList.add("hidden");
      const dashboard = document.getElementById("dashboardPage");
      dashboard.classList.remove("hidden");
      dashboard.classList.add("flex");
      loadInitialData();
    } else {
      alert("Invalid Credentials! Hint: admin / admin123");
    }
  });
}
