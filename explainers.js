console.log("🔍 Explainers page loaded");

// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  // 🛠️ SIMPLIFIED LOGIC: Always load explainers list
  console.log("📋 Loading explainers list");
  
  const container = document.getElementById("explainers-feed");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  console.log("🎯 Container element:", container);
  console.log("🎯 Load More button:", loadMoreBtn);

  // Pagination variables
  let currentPage = 1;
  let isLoading = false;
  let hasMoreContent = true;

  // 🛠️ IMPLEMENT loadExplainersList() (CARDS) with pagination
  function loadExplainersList(append = false) {
    if (isLoading || !hasMoreContent) return;
    
    console.log("📋 Loading explainers list - Page:", currentPage);
    isLoading = true;
    
    // Show loading indicator
    if (loadMoreBtn) {
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      loadMoreBtn.disabled = true;
    }
    
    fetch(`https://the-terrific-proxy.onrender.com/api/explainers?page=${currentPage}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📄 Explainers data received:", data);
        const explainers = data.explainers || data.results || data.articles || [];
        
        if (explainers.length === 0) {
          hasMoreContent = false;
          if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
          }
          if (!append) {
            container.innerHTML = '<p>No explainers articles available at the moment.</p>';
          }
          return;
        }
        
        renderExplainerCards(explainers, append);
        currentPage++;
        
        // Reset load more button
        if (loadMoreBtn) {
          loadMoreBtn.innerHTML = 'Load More Explainers';
          loadMoreBtn.disabled = false;
          loadMoreBtn.style.display = 'block';
        }
      })
      .catch(err => {
        console.error('❌ Error loading explainers list:', err);
        if (container && !append) {
          container.innerHTML = "<p>Error loading explainers.</p>";
        }
        if (loadMoreBtn) {
          loadMoreBtn.innerHTML = 'Load More Explainers';
          loadMoreBtn.disabled = false;
        }
      })
      .finally(() => {
        isLoading = false;
      });
  }

  function renderExplainerCards(explainers, append = false) {
    if (!container) return;
    
    console.log(`📰 Rendering ${explainers.length} explainer cards (append: ${append})`);
    
    // Clear existing content only if not appending
    if (!append) {
      container.innerHTML = '';
    }
    
    explainers.forEach(explainer => {
      const explainerCard = document.createElement('div');
      explainerCard.className = 'explainer-card';
      
      // Create slug from title if not available
      const explainerSlug = explainer.slug || createSlugFromTitle(explainer.title);
      
      explainerCard.innerHTML = `
        ${explainer.image ? `<img src="${explainer.image}" alt="${explainer.title}" />` : ''}
        <div class="explainer-content">
          <h3>${explainer.title}</h3>
          <p>${explainer.summary}</p>
          <button class="bubble-btn read-full" data-slug="${explainerSlug}" data-id="${explainer.id}">
            Read full analysis →
          </button>
        </div>
      `;
      
      // Add click handler for the button
      const readFullBtn = explainerCard.querySelector('.read-full');
      readFullBtn.addEventListener('click', function() {
        const slug = this.getAttribute('data-slug');
        const id = this.getAttribute('data-id');
        loadFullAnalysis(slug, id);
      });
      
      container.appendChild(explainerCard);
    });
  }

  // 🛠️ LOAD FULL ANALYSIS FUNCTION (LIKE WARS)
  function loadFullAnalysis(slug, id) {
    console.log("📄 Loading full analysis for slug:", slug, "ID:", id);
    
    // Hide load more button for individual article view
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading full analysis...</div>';
    
    // Fetch full explainer using ID (more reliable than slug)
    fetch(`https://the-terrific-proxy.onrender.com/api/explainers/article?id=${encodeURIComponent(id)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(explainer => {
        console.log("📄 Full explainer data received:", explainer);
        renderFullAnalysis(explainer);
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

  function renderFullAnalysis(explainer) {
    if (!container) return;
    
    console.log("📄 Rendering full analysis:", explainer.title);
    
    container.innerHTML = `
      <div class="explainer-content">
        <button class="go-back-btn" onclick="location.reload()">
          <i class="fas fa-arrow-left"></i> Back to Explainers List
        </button>
        
        ${explainer.image ? `<img src="${explainer.image}" alt="${explainer.title}" class="explainer-image">` : ''}
        <h1 class="explainer-title">${explainer.title}</h1>
        
        <div class="explainer-meta">
          <span class="source">${explainer.source || 'Unknown'}</span>
          <span class="published">${explainer.published ? new Date(explainer.published).toLocaleDateString() : 'Unknown date'}</span>
          ${explainer.url ? `<a href="${explainer.url}" target="_blank" class="original-link">View Original →</a>` : ''}
        </div>
        
        <div class="explainer-summary">
          <h2>Summary</h2>
          <p>${explainer.summary || 'No summary available'}</p>
        </div>
        
        <div class="explainer-body">
          <h2>Full Analysis</h2>
          ${explainer.body || explainer.content || 'No full analysis available'}
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

  // 🛠️ LOAD MORE BUTTON FUNCTIONALITY
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      loadExplainersList(true); // Append new content
    });
  }

  // 🛠️ INFINITE SCROLL FUNCTIONALITY
  function handleInfiniteScroll() {
    if (isLoading || !hasMoreContent) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Load more when user is within 500px of bottom
    if (scrollTop + windowHeight >= documentHeight - 500) {
      console.log("🔄 Infinite scroll triggered - loading more explainers");
      loadExplainersList(true); // Append new content
    }
  }

  // Add scroll event listener with debounce
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleInfiniteScroll, 100);
  });

  // 🛠️ INITIAL LOAD
  loadExplainersList(); // Load first page
});
