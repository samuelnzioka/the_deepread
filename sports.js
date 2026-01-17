/* =========================
   SPORTS FRONTEND LOGIC
========================= */

const sportsContainer = document.getElementById("sports-feed");
const sportsTabs = document.querySelectorAll(".sports-tab");

let currentSport = "soccer";
let currentPage = 1;
let loading = false;

/* =========================
   LOAD SPORTS NEWS
========================= */
async function loadSports(reset = false) {
  if (loading) return;
  loading = true;

  if (reset) {
    currentPage = 1;
    sportsContainer.innerHTML = "";
  }

  try {
    console.log(`🏅 Loading ${currentSport} page ${currentPage}`);

    const res = await fetch(
      `https://the-terrific-proxy.onrender.com/api/sports?sport=${encodeURIComponent(currentSport)}&page=${currentPage}`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("📦 Sports API response:", data);

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.sports || data.sports.length === 0) {
      if (currentPage === 1) {
        sportsContainer.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--text-muted);">
            No ${currentSport} news available
          </div>
        `;
      }
      loading = false;
      return; // Return instead of returning undefined
    }

    const frag = document.createDocumentFragment();

    data.sports.forEach(article => {
      const card = document.createElement("div");
      card.className = "explainer-card";

      const title = article.title || "Sports News";
      const summary = article.summary || "Read more about this sports story…";
      const image =
        article.image ||
        `https://picsum.photos/400/250?random=${Math.random()}`;
      const published = article.published
        ? new Date(article.published).toLocaleDateString()
        : "";
      const source = article.source || "News";

      card.innerHTML = `
        <img src="${image}" alt="${title}" class="explainer-image">
        <div class="explainer-body">
          <h3>${title}</h3>
          <p class="explainer-summary">${summary}</p>
          <div class="explainer-meta">
            <span class="published">${published}</span>
            <span class="source">${source}</span>
          </div>
          <button class="btn read-sports" data-url="${encodeURIComponent(
            article.url
          )}">
            Read Full Story
          </button>
        </div>
      `;

      frag.appendChild(card);
    });

    sportsContainer.appendChild(frag);
    currentPage++;

    console.log(`✅ Loaded ${data.sports.length} articles`);

  } catch (err) {
    console.error("❌ Sports load error:", err);
    if (currentPage === 1) {
      sportsContainer.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);">
          Error loading sports news
        </div>
      `;
    }
  } finally {
    loading = false;
  }
}

/* =========================
   TAB SWITCHING
========================= */
sportsTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    sportsTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    currentSport = tab.dataset.sport;
    console.log("🔄 Switched to:", currentSport);

    loadSports(true);
  });
});

/* =========================
   READ FULL STORY
========================= */
document.addEventListener("click", e => {
  const btn = e.target.closest(".read-sports");
  if (!btn) return;

  // Get article data from button's parent card
  const card = btn.closest(".explainer-card");
  const article = {
    title: card.querySelector("h3")?.textContent || "Sports News",
    image: card.querySelector(".explainer-image")?.src || null,
    body: card.querySelector(".explainer-summary")?.textContent || "No summary available",
    source: card.querySelector(".source")?.textContent || "NewsAPI",
    url: btn.dataset.url
  };

  // Save current scroll position
  sessionStorage.setItem('sportsScrollPosition', sportsContainer.scrollTop);
  sessionStorage.setItem('sportsActiveTab', currentSport);

  // Store article data and navigate
  localStorage.setItem("currentSportArticle", JSON.stringify(article));
  window.location.href = `sport.html?sport=${currentSport}`;
});

/* =========================
   INFINITE SCROLL
========================= */
sportsContainer.addEventListener("scroll", () => {
  if (
    sportsContainer.scrollTop + sportsContainer.clientHeight >=
    sportsContainer.scrollHeight - 200
  ) {
    loadSports();
  }
});

/* =========================
   INITIAL LOAD
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (sportsContainer) {
    console.log("🏆 Initializing sports section…");
    
    // Restore scroll position and active tab if coming back from article
    const savedScrollPosition = sessionStorage.getItem('sportsScrollPosition');
    const savedActiveTab = sessionStorage.getItem('sportsActiveTab');
    
    if (savedScrollPosition && savedActiveTab) {
      // Set the active tab
      sportsTabs.forEach(tab => {
        tab.classList.remove("active");
        if (tab.dataset.sport === savedActiveTab) {
          tab.classList.add("active");
          currentSport = savedActiveTab;
        }
      });
      
      // Load content first, then restore scroll position
      loadSports(true).then(() => {
        setTimeout(() => {
          sportsContainer.scrollTop = parseInt(savedScrollPosition);
          console.log(`📍 Restored scroll position: ${savedScrollPosition}px`);
        }, 100);
      });
      
      // Clear session storage after restoration
      sessionStorage.removeItem('sportsScrollPosition');
      sessionStorage.removeItem('sportsActiveTab');
    } else {
      // Normal initial load
      loadSports(true);
    }
  }
});
