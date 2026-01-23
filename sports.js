/* =========================
   SPORTS FRONTEND LOGIC
========================= */

const sportsContainer = document.getElementById("sports-feed");
const sportsTabs = document.querySelectorAll(".sports-tab");

// Handle both clean URLs with slugs and old URLs with ID parameters
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Extract slug from URL path for clean URLs
const pathParts = window.location.pathname.split('/');
const slug = pathParts[pathParts.length - 1];

// Helper function to create slug from title
function createSlugFromTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

console.log("Sports page loaded with ID:", id);
console.log("Sports page loaded with slug:", slug);
console.log("Full URL path:", window.location.pathname);

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
   INDIVIDUAL SPORTS ARTICLE
========================= */
function renderSportsArticle() {
  console.log("Rendering individual sports article for ID:", id, "Slug:", slug);
  
  if (!id && !slug) {
    sportsContainer.innerHTML = `
      <div class="error-message">
        <h2>No sports article data found</h2>
        <p>Please go back and select a sports article from the list.</p>
      </div>
    `;
    return;
  }

  // Show loading state
  sportsContainer.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading sports article...</p>
    </div>
  `;

  // Fetch sports data using ID or slug
  fetch('https://the-terrific-proxy.onrender.com/api/sports?sport=soccer&page=1')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Sports API response:", data);
      
      // Find the sports article in the results array
      const sports = data.articles || data.results || [];
      let article;
      
      if (id) {
        // Find by ID (old URL format)
        article = sports.find(s => s.id === id);
        console.log("Looking for sports article by ID:", id);
      } else if (slug) {
        // Find by slug (new clean URL format)
        article = sports.find(s => {
          const sportsSlug = s.slug || createSlugFromTitle(s.title);
          return sportsSlug === slug;
        });
        console.log("Looking for sports article by slug:", slug);
      }
      
      if (!article) {
        throw new Error(`Sports article not found (ID: ${id}, Slug: ${slug})`);
      }
      
      console.log("Found sports article:", article);
      
      // Add go back functionality
      const goBackBtn = document.createElement('button');
      goBackBtn.className = 'go-back-btn';
      goBackBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Go Back to Sports';
      goBackBtn.onclick = () => {
        window.location.href = 'sports.html';
      };
      
      // Render sports article content
      sportsContainer.innerHTML = `
        <div class="explainer-content">
          ${article.image ? `<img src="${article.image}" alt="${article.title}" class="explainer-image">` : ''}
          <h1 class="explainer-title">${article.title}</h1>
          
          <div class="explainer-meta">
            <span class="source">${article.source || 'Unknown'}</span>
            <span class="published">${article.date ? new Date(article.date).toLocaleDateString() : 'Unknown date'}</span>
            ${article.url ? `<a href="${article.url}" target="_blank" class="original-link">View Original →</a>` : ''}
          </div>
          
          <div class="explainer-summary">
            <h2>Summary</h2>
            <p>${article.summary || 'No summary available'}</p>
          </div>
          
          <div class="explainer-body">
            <h2>Full Analysis</h2>
            ${article.body || article.content || 'No full analysis available'}
          </div>
        </div>
      `;
      
      sportsContainer.insertBefore(goBackBtn, sportsContainer.firstChild);
      
    })
    .catch(err => {
      console.error('Error fetching sports article:', err);
      sportsContainer.innerHTML = `
        <div class="error-message">
          <h2>Error loading sports article</h2>
          <p>Could not load the sports article. Please try again.</p>
        </div>
      `;
    });
}

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
    
    // Check if we have URL parameters for individual article
    if (id || slug) {
      renderSportsArticle();
      return;
    }
    
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
