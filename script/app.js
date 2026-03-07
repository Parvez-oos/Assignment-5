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


// Search Bar Logic (API Integration)

const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
let searchTimer; 

if (searchForm) {
    searchForm.addEventListener('submit', (e) => e.preventDefault());
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.trim();
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            if (searchText === "") {
                renderIssues(); 
                return;
            }

            toggleLoader(true);
            // Using the Search API endpoint
            fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`)
                .then(res => res.json())
                .then(result => {
                    const searchResults = result.data || result;
                    renderIssues(searchResults); 
                })
                .catch(err => console.error("Search API Error:", err))
                .finally(() => toggleLoader(false));
        }, 300); 
    });
}