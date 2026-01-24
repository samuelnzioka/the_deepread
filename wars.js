console.log("🔍 Wars page loaded");

// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  // 🛠️ SIMPLIFIED LOGIC: Always load wars list
  console.log("📋 Loading wars list");
  loadWarsList();
  
  const container = document.getElementById("wars-feed");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  console.log("🎯 Container element:", container);
  console.log("🎯 Load More button:", loadMoreBtn);

  // 🛠️ STEP 4: IMPLEMENT loadWarsList() (CARDS)
  function loadWarsList() {
    console.log("📋 Loading wars list...");
    
    fetch("https://the-terrific-proxy.onrender.com/api/wars?page=1")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📄 Wars data received:", data);
        renderWarCards(data.articles || []);
      })
      .catch(err => {
        console.error('❌ Error loading wars list:', err);
        if (container) {
          container.innerHTML = "<p>Error loading wars.</p>";
        }
      });
  }

  function renderWarCards(articles) {
    if (!container) return;
    
    console.log(`📰 Rendering ${articles.length} war cards`);
    
    // Clear existing content
    container.innerHTML = '';
    
    if (articles.length === 0) {
      container.innerHTML = '<p>No wars articles available at the moment.</p>';
      return;
    }
    
    articles.forEach(article => {
      const articleCard = document.createElement('div');
      articleCard.className = 'explainer-card';
      
      // Create slug from title if not available
      const articleSlug = article.slug || createSlugFromTitle(article.title);
      
      articleCard.innerHTML = `
        ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
        <div class="explainer-content">
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
          <button class="bubble-btn read-full" data-slug="${articleSlug}" data-id="${article.id}">
            Read full analysis →
          </button>
        </div>
      `;
      
      // Add click handler for the button
      const readFullBtn = articleCard.querySelector('.read-full');
      readFullBtn.addEventListener('click', function() {
        const slug = this.getAttribute('data-slug');
        const id = this.getAttribute('data-id');
        loadFullAnalysis(slug, id);
      });
      
      container.appendChild(articleCard);
    });
  }

  // 🛠️ LOAD FULL ANALYSIS FUNCTION
  function loadFullAnalysis(slug, id) {
    console.log("📄 Loading full analysis for slug:", slug, "ID:", id);
    
    // Hide load more button for individual article view
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading full analysis...</div>';
    
    // Fetch full article using ID (more reliable than slug)
    fetch(`https://the-terrific-proxy.onrender.com/api/wars/article?id=${encodeURIComponent(id)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(article => {
        console.log("📄 Full article data received:", article);
        renderFullAnalysis(article);
      })
      .catch(err => {
        console.error('❌ Error loading full analysis:', err);
        container.innerHTML = `
          <div class="error-message">
            <h2>Failed to Load Analysis</h2>
            <p>Unable to load the full analysis. Please try again later.</p>
            <button class="bubble-btn" onclick="location.reload()">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>
        `;
      });
  }

  function renderFullAnalysis(article) {
    if (!container) return;
    
    console.log("📄 Rendering full analysis:", article.title);
    
    container.innerHTML = `
      <div class="explainer-content">
        <button class="go-back-btn" onclick="location.reload()">
          <i class="fas fa-arrow-left"></i> Back to Wars List
        </button>
        
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
          ${article.body || article.background || article.bodyText || 'No full analysis available'}
        </div>
      </div>
    `;
  }

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
});
