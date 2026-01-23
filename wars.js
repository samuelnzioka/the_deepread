console.log("🔍 Wars page loaded");

// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  // 🛠️ STEP 2: SLUG DETECTION AT THE TOP
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const slug = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;
  
  console.log("🔍 Path parts:", pathParts);
  console.log("🔍 Detected slug:", slug);
  
  // 🛠️ STEP 3: SPLIT LOGIC: LIST vs ARTICLE (CRITICAL)
  if (!slug) {
    console.log("📋 No slug detected - loading wars list");
    loadWarsList();
  } else {
    console.log("📄 Slug detected - loading individual article:", slug);
    loadWarArticle(slug);
  }
  
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
          <a class="bubble-btn" href="/wars/${articleSlug}">
            Read Full Analysis
          </a>
        </div>
      `;
      
      container.appendChild(articleCard);
    });
  }

  // 🛠️ STEP 5: IMPLEMENT loadWarArticle(slug) (FULL PAGE)
  function loadWarArticle(slug) {
    console.log("📄 Loading war article for slug:", slug);
    
    // Hide load more button for individual article view
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
    
    fetch(`https://the-terrific-proxy.onrender.com/api/wars/article?slug=${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(article => {
        console.log("📄 War article data received:", article);
        renderFullWarArticle(article);
      })
      .catch(err => {
        console.error('❌ Error loading war article:', err);
        if (container) {
          container.innerHTML = `
            <p>War article not found.</p>
            <a href="/wars">← Back to Wars</a>
          `;
        }
      });
  }

  function renderFullWarArticle(article) {
    if (!container) return;
    
    console.log("📄 Rendering full war article:", article.title);
    
    container.innerHTML = `
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
          ${article.body || article.background || 'No full analysis available'}
        </div>
      </div>
    `;
    
    // Add go back functionality
    const goBackBtn = document.createElement('button');
    goBackBtn.className = 'go-back-btn';
    goBackBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Wars';
    goBackBtn.onclick = () => {
      window.location.href = '/wars';
    };
    container.insertBefore(goBackBtn, container.firstChild);
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
