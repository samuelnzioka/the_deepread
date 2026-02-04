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
        // Navigate to dedicated explainer page
        window.location.href = `explainer.html?id=${encodeURIComponent(id)}`;
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
    
    console.log("🔍 Starting fetch for explainer ID:", id);
    console.log("🔍 Full fetch URL:", `https://the-terrific-proxy.onrender.com/api/explainers/article?id=${encodeURIComponent(id)}`);
    
    // Try multiple possible endpoints to ensure we get the data
    const possibleEndpoints = [
      `https://the-terrific-proxy.onrender.com/api/explainers/article?id=${encodeURIComponent(id)}`,
      `https://the-terrific-proxy.onrender.com/api/explainers?id=${encodeURIComponent(id)}`,
      `https://the-terrific-proxy.onrender.com/api/explainers/${encodeURIComponent(id)}`
    ];
    
    let endpointIndex = 0;
    
    function tryNextEndpoint() {
      if (endpointIndex >= possibleEndpoints.length) {
        console.error('❌ All endpoints failed for ID:', id);
        container.innerHTML = `
          <div class="error-message">
            <h2>Unable to Load Analysis</h2>
            <p>Could not fetch the explainer content. The article may not be available.</p>
            <div style="margin-top: 20px;">
              <button class="bubble-btn" onclick="location.reload()">
                <i class="fas fa-redo"></i> Try Again
              </button>
              <button class="bubble-btn" onclick="history.back()" style="margin-left: 10px;">
                <i class="fas fa-arrow-left"></i> Go Back
              </button>
            </div>
          </div>
        `;
        return;
      }
      
      const currentEndpoint = possibleEndpoints[endpointIndex];
      console.log(`🔍 Trying endpoint ${endpointIndex + 1}/${possibleEndpoints.length}:`, currentEndpoint);
      
      fetch(currentEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then(response => {
        console.log(`📡 Response status for endpoint ${endpointIndex + 1}:`, response.status);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.text().then(text => {
          console.log(`📡 Raw response text length:`, text.length);
          console.log(`📡 Raw response preview:`, text.substring(0, 200));
          
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            throw new Error('Invalid JSON response from server');
          }
        });
      })
      .then(data => {
        console.log(`📄 Full data received from endpoint ${endpointIndex + 1}:`, data);
        console.log(`📄 Data type:`, typeof data);
        console.log(`📄 Data keys:`, Object.keys(data));
        
        // Validate the received data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received');
        }
        
        // Check for explainer data in different possible structures
        let explainer = null;
        
        if (data.id && data.title) {
          explainer = data; // Direct explainer object
        } else if (data.explainer && data.explainer.id && data.explainer.title) {
          explainer = data.explainer; // Nested explainer object
        } else if (data.data && data.data.id && data.data.title) {
          explainer = data.data; // Data field
        } else if (data.article && data.article.id && data.article.title) {
          explainer = data.article; // Article field
        } else {
          console.error('❌ No valid explainer structure found in:', data);
          throw new Error('Explainer data not found in response');
        }
        
        console.log('✅ Valid explainer data found:', {
          id: explainer.id,
          title: explainer.title,
          hasBody: !!explainer.body,
          bodyLength: explainer.body ? explainer.body.length : 0,
          hasContent: !!explainer.content,
          contentLength: explainer.content ? explainer.content.length : 0
        });
        
        // Ensure we have content to display
        if (!explainer.body && !explainer.content) {
          console.warn('⚠️ No body/content found, checking other fields...');
          explainer.body = explainer.text || explainer.description || explainer.full_content || '';
        }
        
        renderFullAnalysis(explainer);
      })
      .catch(error => {
        console.error(`❌ Endpoint ${endpointIndex + 1} failed:`, error);
        console.error(`❌ Error details:`, error.message);
        
        endpointIndex++;
        
        if (endpointIndex < possibleEndpoints.length) {
          console.log(`🔄 Trying next endpoint...`);
          tryNextEndpoint();
        } else {
          console.error('❌ All endpoints exhausted');
          container.innerHTML = `
            <div class="error-message">
              <h2>Failed to Load Analysis</h2>
              <p><strong>Error:</strong> ${error.message}</p>
              <p>Unable to load the explainer content. Please try again later.</p>
              <div style="margin-top: 20px;">
                <button class="bubble-btn" onclick="location.reload()">
                  <i class="fas fa-redo"></i> Try Again
                </button>
                <button class="bubble-btn" onclick="history.back()" style="margin-left: 10px;">
                  <i class="fas fa-arrow-left"></i> Go Back
                </button>
              </div>
            </div>
          `;
        }
      });
    }
    
    // Start trying endpoints
    tryNextEndpoint();
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
          <div class="explainer-content-text">
            ${(() => {
              // Try multiple possible content fields
              const content = explainer.body || explainer.content || explainer.text || explainer.description || explainer.full_content || '';
              
              console.log('🔍 Content analysis:', {
                hasBody: !!explainer.body,
                bodyLength: explainer.body ? explainer.body.length : 0,
                hasContent: !!explainer.content,
                contentLength: explainer.content ? explainer.content.length : 0,
                hasText: !!explainer.text,
                textLength: explainer.text ? explainer.text.length : 0,
                finalContent: content.substring(0, 100) + '...'
              });
              
              if (!content || content.trim().length === 0) {
                return '<p><em>No full analysis content available for this explainer.</em></p>';
              }
              
              // Check if content looks like HTML and render accordingly
              if (content.includes('<p>') || content.includes('<div>') || content.includes('<h1>') || content.includes('<h2>')) {
                return content; // Render as HTML
              } else {
                // Convert plain text to HTML with proper formatting
                return content.split('\n\n').map(paragraph => 
                  paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                ).join('');
              }
            })()}
          </div>
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
