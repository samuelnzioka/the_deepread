console.log("🔍 Wars page loaded");

// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  // 🛠️ SIMPLIFIED LOGIC: Always load wars list
  console.log("📋 Loading wars list");
  
  const container = document.getElementById("wars-feed");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  console.log("🎯 Container element:", container);
  console.log("🎯 Load More button:", loadMoreBtn);

  // Pagination variables
  let currentPage = 1;
  let isLoading = false;
  let hasMoreContent = true;

  // 🛠️ IMPLEMENT loadWarsList() (CARDS) with pagination
  function loadWarsList(append = false) {
    if (isLoading || !hasMoreContent) return Promise.resolve();
    
    console.log("📋 Loading wars list - Page:", currentPage);
    isLoading = true;
    
    // Show loading indicator
    if (loadMoreBtn) {
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      loadMoreBtn.disabled = true;
    }
    
    return fetch(`https://the-terrific-proxy.onrender.com/api/wars?page=${currentPage}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📄 Wars data received:", data);
        const articles = data.articles || [];
        
        if (articles.length === 0) {
          hasMoreContent = false;
          if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
          }
          if (!append) {
            container.innerHTML = '<p>No wars articles available at the moment.</p>';
          }
          return;
        }
        
        renderWarCards(articles, append);
        currentPage++;
        
        // Reset load more button
        if (loadMoreBtn) {
          loadMoreBtn.innerHTML = 'Load More Wars';
          loadMoreBtn.disabled = false;
          loadMoreBtn.style.display = 'block';
        }
      })
      .catch(err => {
        console.error('❌ Error loading wars list:', err);
        if (container && !append) {
          container.innerHTML = "<p>Error loading wars.</p>";
        }
        if (loadMoreBtn) {
          loadMoreBtn.innerHTML = 'Load More Wars';
          loadMoreBtn.disabled = false;
        }
      })
      .finally(() => {
        isLoading = false;
      });
  }

  function renderWarCards(articles, append = false) {
    if (!container) return;
    
    console.log(`📰 Rendering ${articles.length} war cards (append: ${append})`);
    
    // Clear existing content only if not appending
    if (!append) {
      container.innerHTML = '';
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
        
        // Save current scroll position before loading full analysis
        sessionStorage.setItem('warsScrollPosition', window.pageYOffset || document.documentElement.scrollTop);
        sessionStorage.setItem('warsCurrentPage', currentPage);
        
        // Load full analysis in the same page (original behavior)
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
        <button class="go-back-btn" onclick="goBackToWarsList()">
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

  // Function to go back to wars list and restore scroll position
  window.goBackToWarsList = function() {
    const savedScrollPosition = sessionStorage.getItem('warsScrollPosition');
    const savedCurrentPage = sessionStorage.getItem('warsCurrentPage');
    
    if (savedScrollPosition && savedCurrentPage) {
      console.log('Restoring wars scroll position:', savedScrollPosition, 'and page:', savedCurrentPage);
      
      // Load content up to the saved page first
      const targetPage = parseInt(savedCurrentPage);
      currentPage = 1; // Reset to first page
      
      // Clear the container first
      container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading wars list...</div>';
      
      // Show load more button again
      if (loadMoreBtn) {
        loadMoreBtn.style.display = 'block';
      }
      
      // Load pages until we reach the target page
      function loadPagesUpToTarget() {
        if (currentPage <= targetPage) {
          loadWarsList(true).then(() => {
            currentPage++;
            if (currentPage <= targetPage) {
              setTimeout(loadPagesUpToTarget, 100);
            } else {
              // All pages loaded, now restore scroll position
              setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
                console.log('Wars scroll position restored to:', savedScrollPosition);
                
                // Clear the saved position
                sessionStorage.removeItem('warsScrollPosition');
                sessionStorage.removeItem('warsCurrentPage');
              }, 500);
            }
          });
        }
      }
      
      loadPagesUpToTarget();
    } else {
      // Fallback: just reload the page
      location.reload();
    }
  };

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
      loadWarsList(true); // Append new content
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
      console.log("🔄 Infinite scroll triggered - loading more wars");
      loadWarsList(true); // Append new content
    }
  }

  // Add scroll event listener with debounce
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleInfiniteScroll, 100);
  });

  // 🛠️ INITIAL LOAD
  loadWarsList(); // Load first page
});
