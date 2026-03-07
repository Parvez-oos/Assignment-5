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
  searchForm.addEventListener("submit", (e) => e.preventDefault());
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.trim();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      if (searchText === "") {
        renderIssues();
        return;
      }

      toggleLoader(true);
      // Using the Search API endpoint
      fetch(
        `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`,
      )
        .then((res) => res.json())
        .then((result) => {
          const searchResults = result.data || result;
          renderIssues(searchResults);
        })
        .catch((err) => console.error("Search API Error:", err))
        .finally(() => toggleLoader(false));
    }, 300);
  });
}

// Data Fetching Logic (Initial Load)

function loadInitialData() {
  toggleLoader(true);
  fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then((res) => res.json())
    .then((result) => {
      allIssues = result.data || result;
      renderIssues();
    })
    .finally(() => toggleLoader(false));
}

// Loader Toggle Function (Handles Tailwind Flex Centering)

function toggleLoader(show) {
  const loader = document.getElementById("loadingSpinner");
  if (!loader) return;
  if (show) {
    loader.classList.remove("hidden");
    loader.classList.add("flex");
  } else {
    loader.classList.add("hidden");
    loader.classList.remove("flex");
  }
}

// Tab Navigation Logic(Now With Spinner Visibility)

function setTab(tabName) {
  currentTab = tabName;

  // Show spinner and clear current list for the "loading" effect

  toggleLoader(true);
  document.getElementById("issuesGrid").innerHTML = "";

  // Artificial delay so the user can actually see the spinner

  setTimeout(() => {
    ["All", "Open", "Closed"].forEach((t) => {
      const btn = document.getElementById(`tab-${t}`);
      if (btn) {
        btn.className =
          t === tabName
            ? "px-8 py-2 rounded-lg text-sm font-bold bg-[#4f00ff] text-white shadow-md transition-all"
            : "px-8 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all";
      }
    });

    if (searchInput) searchInput.value = "";
    renderIssues();
    toggleLoader(false);
  }, 400);
}

// Rendering Logic (Now With Tab Filtering)

function renderIssues(dataOverride = null) {
  const grid = document.getElementById("issuesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered =
    dataOverride ||
    allIssues.filter((issue) => {
      if (currentTab === "All") return true;
      return issue.status.toLowerCase() === currentTab.toLowerCase();
    });

  document.getElementById("issueCount").innerText = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fa-solid fa-folder-open text-4xl text-slate-200 mb-4 block"></i>
                <p class="text-slate-400 font-medium italic">No issues found in this category.</p>
            </div>`;
    return;
  }

  filtered.forEach((issue) => {
    const isOpen = issue.status.toLowerCase() === "open";
    const p = issue.priority.toLowerCase();
    let pClass = "bg-slate-100 text-slate-500";
    if (p === "high") pClass = "bg-red-50 text-[#ff4d4d]";
    if (p === "medium") pClass = "bg-amber-50 text-[#f59e0b]";

    const labelHtml = (issue.labels || [])
      .map((label) => {
        let lClass = "bg-slate-50 text-slate-500 border-slate-100";
        let icon = "fa-tag";
        const l = label.toLowerCase();
        if (l === "bug") {
          lClass = "bg-[#fff1f1] text-[#ff5a5a] border-[#ffe4e4]";
          icon = "fa-bug";
        } else if (l === "enhancement") {
          lClass = "bg-[#e6fcf5] text-[#0ca678] border-[#c3fae8]";
          icon = "fa-wand-magic-sparkles";
        } else if (l === "help wanted") {
          lClass = "bg-[#fff9db] text-[#f08c00] border-[#fff3bf]";
          icon = "fa-life-ring";
        } else if (l === "documentation") {
          lClass = "bg-[#eff6ff] text-[#0ea5e9] border-[#dbeafe]";
          icon = "fa-book";
        }

        return `<span class="text-[10px] border px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 ${lClass}"><i class="fa-solid ${icon} text-[8px]"></i> ${label}</span>`;
      })
      .join("");

    const card = document.createElement("div");
    card.className = `bg-white border border-slate-200 border-t-4 ${isOpen ? "border-t-emerald-500" : "border-t-[#4f00ff]"} rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all flex flex-col h-full`;
    card.onclick = () => openModal(issue.id);

    card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="${isOpen ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-600"} w-8 h-8 rounded-full flex items-center justify-center"><i class="${isOpen ? "fa-solid fa-circle-dot" : "fa-solid fa-check-circle"} text-sm"></i></div>
                <span class="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${pClass}">${p}</span>
            </div>
            <h3 class="font-bold text-[15px] mb-2 text-slate-800 leading-snug line-clamp-2">${issue.title}</h3>
            <p class="text-slate-500 text-xs mb-5 line-clamp-2 leading-relaxed flex-grow">${issue.description}</p>
            <div class="flex flex-wrap gap-2 mb-5">${labelHtml}</div>
            <div class="pt-4 border-t border-slate-50 text-[11px] text-slate-400 flex flex-col items-stretch font-medium">
                <span class="mb-2">#${issue.id} by <span class="text-slate-700 font-bold">${issue.author}</span></span>
                <span>${new Date(issue.createdAt).toLocaleDateString("en-GB")}</span>
            </div>`;
    grid.appendChild(card);
  });
}

// Modal Logic (Now With Dynamic Content)

function openModal(id) {
    fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
        .then(r => r.json())
        .then(res => {
            const d = res.data || res;
            const modal = document.getElementById('issueModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            document.getElementById('modalTitle').innerText = d.title;
            document.getElementById('modalAuthor').innerText = d.author;
            document.getElementById('modalDesc').innerText = d.description;
            document.getElementById('modalAssignee').innerText = d.assignee || d.author;
            document.getElementById('modalDate').innerText = new Date(d.createdAt).toLocaleDateString('en-GB');

            const statusEl = document.getElementById('modalStatus');
            const isOpen = d.status.toLowerCase() === 'open';
            statusEl.innerText = isOpen ? 'Opened' : 'Closed';
            statusEl.className = `px-3 py-1 rounded-full text-white font-bold text-[11px] ${isOpen ? 'bg-emerald-500' : 'bg-[#4f00ff]'}`;
            
            const p = d.priority.toLowerCase();
            const prioEl = document.getElementById('modalPriority');
            prioEl.innerText = p.toUpperCase();
            prioEl.className = `px-3 py-1.5 rounded-md font-extrabold text-[10px] text-white ${p === 'high' ? 'bg-[#ff4d4d]' : p === 'medium' ? 'bg-[#f59e0b]' : 'bg-slate-400'}`;

            document.getElementById('modalLabels').innerHTML = (d.labels || []).map(l => {
                const low = l.toLowerCase();
                let color = 'bg-slate-50 text-slate-500 border-slate-100';
                let icon = 'fa-tag';
                if (low === 'bug') {color = 'bg-[#fff1f1] text-[#ff5a5a] border-[#ffe4e4]'; icon = 'fa-bug';}
                if (low === 'help wanted') {color = 'bg-[#fff9db] text-[#f08c00] border-[#fff3bf]'; icon = 'fa-life-ring'; }
                if (low === 'enhancement') {color = 'bg-[#e6fcf5] text-[#0ca678] border-[#c3fae8]'; icon = 'fa-wand-magic-sparkles'; }
                if (low === 'documentation') {color = 'bg-[#eff6ff] text-[#0ea5e9] border-[#dbeafe]'; icon = 'fa-book';}
                return `<span class="text-[10px] border px-2.5 py-1 rounded-full font-bold uppercase ${color}"><i class="fa ${icon} mr-1"></i>${l}</span>`;
            }).join(' ');
        });
}

function closeModal() {
    const modal = document.getElementById('issueModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}