// Handle URL parameters for individual war articles
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let title = decodeURIComponent(params.get("title") || "");
let image = params.get("image");
let summary = decodeURIComponent(params.get("summary") || "");
let body = decodeURIComponent(params.get("body") || "");
let source = decodeURIComponent(params.get("source") || "");
let published = params.get("published");
let url = decodeURIComponent(params.get("url") || "");

console.log("Wars page loaded with params:", { id, title, image, summary, body, source, published, url });

// Function to render individual war article
function renderWarArticle() {
  const container = document.getElementById("wars-feed");
  
  if (!container) {
    console.error("Wars container not found");
    return;
  }

  if (!title && !id) {
    // No individual article requested, load list view
    loadWarsList();
    return;
  }

  // Hide load more button for individual article view
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.style.display = 'none';
  }

  // Render individual war article
  container.innerHTML = `
    <div class="explainer-content">
      ${image ? `<img src="${image}" alt="${title}" class="explainer-image">` : ''}
      <h1 class="explainer-title">${title}</h1>
      
      <div class="explainer-meta">
        <span class="source">${source}</span>
        <span class="published">${published ? new Date(published).toLocaleDateString() : 'Unknown date'}</span>
        ${url ? `<a href="${url}" target="_blank" class="original-link">View Original →</a>` : ''}
      </div>
      
      <div class="explainer-summary">
        <h2>Summary</h2>
        <p>${summary || 'No summary available'}</p>
      </div>
      
      <div class="explainer-body">
        <h2>Full Analysis</h2>
        ${body || 'No full analysis available'}
      </div>
    </div>
  `;
  
  // Add go back functionality
  const goBackBtn = document.getElementById("goBackBtn");
  if (goBackBtn) {
    goBackBtn.style.display = 'block';
    goBackBtn.addEventListener('click', () => {
      window.location.href = 'wars.html';
    });
  }
}

// Function to load wars list
function loadWarsList() {
  const container = document.getElementById("wars-feed");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  console.log("🔍 Wars page loaded");
  console.log("🎯 Container element:", container);
  console.log("🎯 Load More button:", loadMoreBtn);

  if (!container) {
    console.error("❌ #wars-feed container not found");
  } else {
    console.log("✅ Container found, current content:", container.innerHTML);
  }

  if (!loadMoreBtn) {
    console.error("❌ #loadMoreBtn button not found");
  } else {
    console.log("✅ Load More button found");
  }

  let page = 1;
  let loading = false;
  let hasMore = true;

async function loadWars() {
  if (loading || !hasMore) return;
  loading = true;

  console.log(`📰 Loading wars page ${page}`);
  console.log(`🌐 Fetching URL: https://the-terrific-proxy.onrender.com/api/wars?page=${page}`);

  try {
    const res = await fetch(`https://the-terrific-proxy.onrender.com/api/wars?page=${page}`);
    console.log(`📡 Response status: ${res.status}`);
    
    const data = await res.json();
    console.log('📊 Wars API Response:', data);

    if (!data || !data.articles) {
      console.log('❌ No articles found in response');
      container.innerHTML = '<p>No wars articles found.</p>';
      return;
    }

    const articles = data.articles;
    console.log(`📄 Found ${articles.length} articles`);

    if (page === 1) {
      console.log("🧹 Clearing container for first load");
      container.innerHTML = "";
    }
    
    articles.forEach(article => {
      const articleCard = document.createElement('div');
      articleCard.className = 'explainer-card';
      
      articleCard.innerHTML = `
        ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
        <div class="explainer-content">
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
          <a class="bubble-btn" href="war.html?id=${encodeURIComponent(article.id)}">
            Read Full Analysis
          </a>
        </div>
      `;
      
      container.appendChild(articleCard);
    });

    page++;
    hasMore = true; // Always true for endless scrolling
    loading = false;

    if (loadMoreBtn) {
      loadMoreBtn.textContent = hasMore ? '📰 Load More Articles' : '📚 No More Articles';
      loadMoreBtn.disabled = !hasMore;
    }

  } catch (err) {
    console.error('❌ Error loading wars:', err);
    container.innerHTML = '<p>Error loading wars articles. Please try again.</p>';
    loading = false;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we have URL parameters for individual article
  if (id || title) {
    renderWarArticle();
    
    // Ensure theme is properly applied after rendering
    setTimeout(() => {
      // Direct theme re-initialization
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const stored = localStorage.getItem('theme');
      const isDark = stored ? stored === 'dark' : prefersDark;
      
      // Apply theme to body
      document.body.classList.toggle('dark', isDark);
      
      // Update theme toggle button
      const themeBtn = document.querySelector('#themeToggleBtn, .theme-toggle-top');
      if (themeBtn) {
        const icon = isDark ? 'fa-sun' : 'fa-moon';
        const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        themeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
        themeBtn.setAttribute('aria-label', label);
        
        // Ensure click handler works
        themeBtn.onclick = () => {
          const newDark = !document.body.classList.contains('dark');
          document.body.classList.toggle('dark', newDark);
          localStorage.setItem('theme', newDark ? 'dark' : 'light');
          
          const newIcon = newDark ? 'fa-sun' : 'fa-moon';
          const newLabel = newDark ? 'Switch to light mode' : 'Switch to dark mode';
          themeBtn.innerHTML = `<i class="fas ${newIcon}"></i>`;
          themeBtn.setAttribute('aria-label', newLabel);
        };
      }
    }, 100);
  } else {
    loadWarsList();
  }
});
