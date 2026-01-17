console.log("Explainers JS loaded");

const container = document.getElementById("explainers-feed");
const refreshBtn = document.getElementById("refreshBtn");
const loadingDiv = document.getElementById("loading");
const refreshStatus = document.getElementById("refreshStatus");

console.log("DOM elements found:", {
  container: !!container,
  refreshBtn: !!refreshBtn,
  loadingDiv: !!loadingDiv,
  refreshStatus: !!refreshStatus
});

let page = 1;
let loading = false;

async function loadExplainers(reset = false) {
  if (loading) return;
  loading = true;
  loadingDiv.style.display = "block";

  if (reset) {
    page = 1;
    container.innerHTML = "";
    // Clear cache on reset
    localStorage.removeItem('cached_explainers');
  }

  console.log(`Loading explainers page ${page}, reset: ${reset}`);

  // Simple direct API call
  const url = `https://the-terrific-proxy.onrender.com/api/explainers?page=${page}`;
  console.log(`🔥 Loading explainers from: ${url}`);
      loadingDiv.style.display = "none";
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-muted);">Unable to load fresh explainers. The data source may be outdated.</p>';
      return;
    }
    
    console.log(`Trying URL ${urlIndex + 1}:`, urls[urlIndex]);
    
    fetch(urls[urlIndex])
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
    .then(data => {
        console.log('RAW API RESPONSE:', data);
        console.log('Data type:', typeof data);
        console.log('Data keys:', Object.keys(data));
        
        // Check if this response has fresh data (last 7 days only)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let hasRecentContent = false;
        let recentCount = 0;
        
        // Handle different possible response structures
        let explainers = null;
        
        if (data.explainers && Array.isArray(data.explainers)) {
          explainers = data.explainers;
          console.log('Using data.explainers structure');
        } else if (data.response && data.response.results && Array.isArray(data.response.results)) {
          explainers = data.response.results;
          console.log('Using data.response.results structure');
        } else if (data.results && Array.isArray(data.results)) {
          explainers = data.results;
          console.log('Using data.results structure');
        } else if (Array.isArray(data)) {
          explainers = data;
          console.log('Using direct array structure');
        } else {
          console.log('No valid explainers array found in response');
          console.log('Available properties:', Object.keys(data));
        }
        
        console.log('Explainers array:', explainers);
        console.log('Explainers type:', typeof explainers);
        console.log('Explainers length:', explainers ? explainers.length : 'N/A');
        
        if (!explainers || explainers.length === 0) {
          console.log('No explainers found or empty array, trying next URL');
          urlIndex++;
          tryNextUrl();
          return;
        }
        
        // CRITICAL: Check for content from last 7 days only
        recentCount = explainers.filter(item => {
          const itemDate = new Date(item.published || item.date || item.created);
          const isRecent = itemDate >= sevenDaysAgo;
          console.log(`📅 Item "${item.title?.substring(0, 50)}..." - Date: ${itemDate.toISOString().split('T')[0]} - Recent: ${isRecent}`);
          return isRecent;
        }).length;
        
        hasRecentContent = recentCount > 0;
        
        console.log(`🔍 CRITICAL ANALYSIS: Found ${explainers.length} total, ${recentCount} from last 7 days (${sevenDaysAgo.toISOString().split('T')[0]}+)`);
        
        if (!hasRecentContent && urlIndex < urls.length - 1) {
          console.log('❌ No content from last 7 days found, trying next URL');
          urlIndex++;
          tryNextUrl();
          return;
        }
        
        // Process the explainers
        console.log(`Processing ${explainers.length} explainers`);

        explainers.forEach((item, index) => {
          const card = document.createElement("div");
          card.className = "explainer-card";
          
          if (reset && index === 0) {
            card.classList.add("new-content");
          }

          card.innerHTML = `
            ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ""}
            <div class="explainer-body">
              <h3>${item.title}</h3>
              <p>${item.summary ? item.summary.substring(0, 200) + '...' : 'No summary available'}</p>
              <div class="explainer-meta">
                <span class="source">${item.source}</span>
                <span class="date">${new Date(item.published).toLocaleDateString()}</span>
              </div>
              <button class="read-full-btn" data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-image="${item.image || ''}" data-summary="${encodeURIComponent(item.summary || '')}" data-body="${encodeURIComponent(item.body || '')}" data-source="${encodeURIComponent(item.source)}" data-published="${item.published}" data-url="${encodeURIComponent(item.url || '')}">
                Read Full Analysis →
              </button>
            </div>
          `;

          container.appendChild(card);
        });

        // Cache the data for trending
        localStorage.setItem('cached_explainers', JSON.stringify(explainers));
        console.log('Cached explainers data to localStorage');

        page++;
        loading = false;
        loadingDiv.style.display = "none";
      })
      .catch(error => {
        console.error(`URL ${urlIndex + 1} failed:`, error);
        urlIndex++;
        tryNextUrl();
      });
  }
  
  // Start trying URLs
  tryNextUrl();
}

// Refresh button functionality - fetch and show new content
if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    if (loading) return;
    
    console.log('🔄 REFRESH: Forcing fresh explainers with critical fixes');
    
    // Show updating status
    if (refreshStatus) {
      refreshStatus.textContent = 'Force updating...';
      refreshStatus.className = 'refresh-status updating';
    }
    
    try {
      loading = true;
      loadingDiv.style.display = "block";
      
      // CRITICAL FIX 1: Force recent articles (last 7 days only)
      const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      
      // CRITICAL FIX 2: Randomize queries to prevent stale content
      const queries = [
        "global economy analysis",
        "geopolitical tensions explained", 
        "war impact global markets",
        "china us trade analysis",
        "middle east conflict explained",
        "ukraine russia economic impact",
        "inflation global markets analysis",
        "energy crisis geopolitics",
        "supply chain disruptions explained",
        "central bank policies analysis",
        "global inflation trends",
        "federal reserve analysis",
        "european union economy",
        "asia pacific markets",
        "commodity prices analysis",
        "cryptocurrency regulation"
      ];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      // Use the same multi-URL approach with critical fixes
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      
      const urls = [
        `https://the-terrific-proxy.onrender.com/api/explainers?page=1&t=${timestamp}&r=${random}&nocache=true&force=true&from-date=${fromDate}&order-by=newest&q=${encodeURIComponent(randomQuery)}`,
        `https://the-terrific-proxy.onrender.com/api/explainers?page=1&t=${timestamp}&r=${random}&nocache=true&force=true&from=${fromDate}&sort=newest&query=${encodeURIComponent(randomQuery)}`,
        `https://the-terrific-proxy.onrender.com/api/explainers?page=1&t=${timestamp}&r=${random}&nocache=true&force=true&date-from=${fromDate}&order=newest&search=${encodeURIComponent(randomQuery)}`,
        `https://the-terrific-proxy.onrender.com/api/explainers?page=1&t=${timestamp}&r=${random}&nocache=true&force=true&recent=true&latest=true`
      ];
      
      console.log(`🔥 REFRESH CRITICAL: Using date filter from: ${fromDate}`);
      console.log(`🎲 REFRESH CRITICAL: Random query: "${randomQuery}"`);
      
      let urlIndex = 0;
      let freshExplainers = null;
      
      async function tryNextRefreshUrl() {
        if (urlIndex >= urls.length) {
          console.log('All refresh URLs failed');
          throw new Error('Unable to fetch fresh explainers');
        }
        
        console.log(`Trying refresh URL ${urlIndex + 1}:`, urls[urlIndex]);
        
        try {
          const response = await fetch(urls[urlIndex]);
          const data = await response.json();
          
          console.log('Fresh data for refresh:', data);
          
          // Handle different response structures
          let explainers = null;
          
          if (data.results && Array.isArray(data.results)) {
            explainers = data.results;
          } else if (data.explainers && Array.isArray(data.explainers)) {
            explainers = data.explainers;
          } else if (data.response && data.response.results && Array.isArray(data.response.results)) {
            explainers = data.response.results;
          } else if (Array.isArray(data)) {
            explainers = data;
          }
          
          if (!explainers || explainers.length === 0) {
            throw new Error('No explainers found');
          }
          
          // CRITICAL: Check for content from last 7 days only
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentCount = explainers.filter(item => {
            const itemDate = new Date(item.published || item.date || item.created);
            const isRecent = itemDate >= sevenDaysAgo;
            console.log(`📅 REFRESH Item "${item.title?.substring(0, 50)}..." - Date: ${itemDate.toISOString().split('T')[0]} - Recent: ${isRecent}`);
            return isRecent;
          }).length;
          
          console.log(`🔍 REFRESH CRITICAL: Found ${explainers.length} total, ${recentCount} from last 7 days`);
          
          if (recentCount === 0 && urlIndex < urls.length - 1) {
            console.log('❌ REFRESH: No content from last 7 days, trying next URL');
            urlIndex++;
            return tryNextRefreshUrl();
          }
          
          freshExplainers = explainers;
          return freshExplainers;
          
        } catch (error) {
          console.error(`Refresh URL ${urlIndex + 1} failed:`, error);
          urlIndex++;
          return tryNextRefreshUrl();
        }
      }
      
      freshExplainers = await tryNextRefreshUrl();
      
      if (freshExplainers && freshExplainers.length > 0) {
        // Clear existing content and show fresh data
        container.innerHTML = '';
        page = 1;
        
        // Render fresh explainers
        freshExplainers.forEach((item, index) => {
          const card = document.createElement("div");
          card.className = "explainer-card";
          
          // Add new-content animation to first few cards
          if (index < 3) {
            card.classList.add("new-content");
          }

          card.innerHTML = `
            ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ""}
            <div class="explainer-body">
              <h3>${item.title}</h3>
              <p>${item.summary ? item.summary.substring(0, 200) + '...' : 'No summary available'}</p>
              <div class="explainer-meta">
                <span class="source">${item.source}</span>
                <span class="date">${new Date(item.published).toLocaleDateString()}</span>
              </div>
              <button class="read-full-btn" data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-image="${item.image || ''}" data-summary="${encodeURIComponent(item.summary || '')}" data-body="${encodeURIComponent(item.body || '')}" data-source="${encodeURIComponent(item.source)}" data-published="${item.published}" data-url="${encodeURIComponent(item.url || '')}">
                Read Full Analysis →
              </button>
            </div>
          `;

          container.appendChild(card);
        });
        
        // Update cache with fresh data
        localStorage.setItem('cached_explainers', JSON.stringify(freshExplainers));
        
        // Remove new-content animation after 3 seconds
        setTimeout(() => {
          document.querySelectorAll('.new-content').forEach(card => {
            card.classList.remove('new-content');
          });
        }, 3000);
        
        console.log(`✅ REFRESH SUCCESS: Loaded ${freshExplainers.length} fresh explainers`);
        
        // Show success status with critical info
        if (refreshStatus) {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentCount = freshExplainers.filter(item => {
            const itemDate = new Date(item.published || item.date || item.created);
            return itemDate >= sevenDaysAgo;
          }).length;
          
          refreshStatus.textContent = `✅ ${freshExplainers.length} items (${recentCount} last 7 days)`;
          refreshStatus.className = 'refresh-status success';
          setTimeout(() => {
            refreshStatus.textContent = '';
            refreshStatus.className = 'refresh-status';
          }, 5000);
        }
        
        // Scroll to top to show new content
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } else {
        throw new Error('No fresh explainers found');
      }
      
    } catch (error) {
      console.error('❌ REFRESH ERROR:', error);
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-muted);">❌ Unable to load fresh explainers. No content from last 7 days found.</p>';
      
      if (refreshStatus) {
        refreshStatus.textContent = '❌ No recent content (7+ days)';
        refreshStatus.className = 'refresh-status error';
        setTimeout(() => {
          refreshStatus.textContent = '';
          refreshStatus.className = 'refresh-status';
        }, 5000);
      }
    } finally {
      loading = false;
      loadingDiv.style.display = "none";
    }
  });
} else {
  console.error('Refresh button not found!');
}

// Handle "Read Full Analysis" button clicks
if (container) {
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('read-full-btn')) {
      const button = e.target;
      
      // Save current scroll position
      sessionStorage.setItem('explainersScrollPosition', container.scrollTop);
      
      const params = new URLSearchParams({
        id: button.dataset.id,
        title: button.dataset.title,
        image: button.dataset.image,
        summary: button.dataset.summary,
        body: button.dataset.body,
        source: button.dataset.source,
        published: button.dataset.published,
        url: button.dataset.url
      });
      
      // Navigate to explainer page in same tab
      window.location.href = `explainer.html?${params.toString()}`;
    }
  });
}

// Initial load - wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Restore scroll position if coming back from article
    const savedScrollPosition = sessionStorage.getItem('explainersScrollPosition');
    
    if (savedScrollPosition) {
      loadExplainers().then(() => {
        setTimeout(() => {
          container.scrollTop = parseInt(savedScrollPosition);
          console.log(`📍 Restored explainers scroll position: ${savedScrollPosition}px`);
        }, 100);
      });
      sessionStorage.removeItem('explainersScrollPosition');
    } else {
      loadExplainers();
    }
  });
} else {
  // Restore scroll position if coming back from article
  const savedScrollPosition = sessionStorage.getItem('explainersScrollPosition');
  
  if (savedScrollPosition) {
    loadExplainers().then(() => {
      setTimeout(() => {
        container.scrollTop = parseInt(savedScrollPosition);
        console.log(`📍 Restored explainers scroll position: ${savedScrollPosition}px`);
      }, 100);
    });
    sessionStorage.removeItem('explainersScrollPosition');
  } else {
    loadExplainers();
  }
}

// Auto-refresh every 30 minutes for testing (change to 2 hours later)
setInterval(() => {
  console.log('Auto-refreshing explainers (30-minute interval)');
  loadExplainers(true); // Force refresh
}, 30 * 60 * 1000); // 30 minutes for testing, change to 2 hours later

// Also refresh every 5 minutes if page is visible
setInterval(() => {
  if (!document.hidden) {
    console.log('Visible page refresh check');
    loadExplainers(true);
  }
}, 5 * 60 * 1000); // 5 minutes when page is visible

// Infinite scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadExplainers();
  }
});
