// ===============================
// GLOBAL UI CONTROLS — The Terrific
// ===============================

// 🌙 Dark Mode Toggle
const darkToggle = document.getElementById("darkToggle");

if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark-mode")
    );
  });

  // Persist mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

// 🧭 Navigation Dialogs (Animated instead of direct links)
document.querySelectorAll("[data-dialog]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.dialog;
    openDialog(target);
  });
});

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog) return;

  dialog.classList.add("active");
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog) return;

  dialog.classList.remove("active");
}

// 🌀 Infinite Scroll Trigger (generic)
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 300
  ) {
    document.dispatchEvent(new Event("loadMoreContent"));
  }
});

// ✨ Small animation helper
function fadeIn(el) {
  el.style.opacity = 0;
  el.style.transition = "opacity 0.6s ease";
  requestAnimationFrame(() => (el.style.opacity = 1));
}

// ===============================
// WARS ANALYSIS DIALOG
// ===============================
let currentAnalysisSlide = 0;
let analysisSlides = [];

async function loadWarsAnalysis() {
  try {
    console.log('Loading wars analysis from /api/wars...');
    const response = await fetch('https://the-terrific-proxy.onrender.com/api/wars?page=1');
    console.log('Wars API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Wars API response:', data);
    
    if (!data.articles || data.articles.length === 0) {
      console.log('No wars articles found');
      return;
    }

    // Take first 4 articles for homepage
    const articles = data.articles.slice(0, 4);
    console.log('Processing wars articles:', articles);
    analysisSlides = articles;

    // Create slides (2 per slide)
    const slidesContainer = document.querySelector('#analysisDialog .slides');
    const dotsContainer = document.querySelector('#analysisDialog .analysis-dots');
    
    if (!slidesContainer || !dotsContainer) {
      console.error('Wars analysis containers not found:', { slidesContainer, dotsContainer });
      return;
    }

    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Create 2 slides with 2 articles each
    for (let i = 0; i < 2; i++) {
      const slide = document.createElement('div');
      slide.className = 'slide';
      if (i === 0) slide.classList.add('active');
      
      const slideContent = document.createElement('div');
      slideContent.className = 'slide-content';
      
      // Add 2 articles to this slide
      const startIdx = i * 2;
      const endIdx = Math.min(startIdx + 2, articles.length);
      
      for (let j = startIdx; j < endIdx; j++) {
        const article = articles[j];
        
        const articleCard = document.createElement('div');
        articleCard.className = 'trend-item';
        articleCard.onclick = () => showWarsArticleModal(article);
        
        articleCard.innerHTML = `
          <div class="trend-item-image">
            ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
          </div>
          <div class="trend-item-content">
            <span class="type-badge">WAR ANALYSIS</span>
            <h4>${article.title}</h4>
            <p>${article.summary?.substring(0, 100) || ''}...</p>
          </div>
        `;
        
        slideContent.appendChild(articleCard);
      }
      
      slide.appendChild(slideContent);
      slidesContainer.appendChild(slide);
      
      // Create dot
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.onclick = () => showAnalysisSlide(i);
      dotsContainer.appendChild(dot);
    }

  } catch (err) {
    console.error('Error loading wars analysis:', err);
  }
}

function showAnalysisSlide(index) {
  const slides = document.querySelectorAll('#analysisDialog .slide');
  const dots = document.querySelectorAll('#analysisDialog .analysis-dots .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentAnalysisSlide].classList.remove('active');
  dots[currentAnalysisSlide].classList.remove('active');
  
  // Show new slide
  currentAnalysisSlide = index;
  slides[currentAnalysisSlide].classList.add('active');
  dots[currentAnalysisSlide].classList.add('active');
}

function changeAnalysisSlide(direction) {
  const slides = document.querySelectorAll('#analysisDialog .slide');
  if (slides.length === 0) return;
  
  let newIndex = currentAnalysisSlide + direction;
  if (newIndex < 0) newIndex = slides.length - 1;
  if (newIndex >= slides.length) newIndex = 0;
  
  showAnalysisSlide(newIndex);
}

// Load wars analysis when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, attempting to load wars analysis...');
  loadWarsAnalysis();
  
  // Initialize search functionality
  initializeSearch();
});

// ===============================
// SEARCH FUNCTIONALITY
// ===============================
function initializeSearch() {
  const searchInput = document.querySelector('.search-box input');
  const searchIcon = document.querySelector('.search-box i');
  
  if (!searchInput) {
    console.log('Search input not found');
    return;
  }
  
  // Add search event listener
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value.trim());
    }
  });
  
  // Add search icon click functionality
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', () => {
      performSearch(searchInput.value.trim());
    });
  }
}

async function performSearch(query) {
  if (!query) {
    console.log('Empty search query');
    return;
  }
  
  console.log(`Searching for: "${query}"`);
  
  try {
    // Search across all available APIs
    const searchResults = await Promise.allSettled([
      searchMemes(query),
      searchExplainers(query),
      searchSports(query),
      searchWars(query),
      searchYouTube(query)
    ]);
    
    // Combine all results
    const allResults = [];
    const sources = ['memes', 'explainers', 'sports', 'wars', 'youtube'];
    
    searchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allResults.push(...result.value.map(item => ({
          ...item,
          source: sources[index]
        })));
      }
    });
    
    // Display search results
    displaySearchResults(allResults, query);
    
  } catch (error) {
    console.error('Search error:', error);
    displaySearchError(query);
  }
}

async function searchMemes(query) {
  try {
    const response = await fetch(`https://the-terrific-proxy.onrender.com/api/memes`);
    const data = await response.json();
    
    if (data.memes) {
      return data.memes.filter(meme => 
        meme.title.toLowerCase().includes(query.toLowerCase()) ||
        meme.subreddit.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('Memes search error:', error);
    return [];
  }
}

async function searchExplainers(query) {
  try {
    const response = await fetch(`https://the-terrific-proxy.onrender.com/api/explainers`);
    const data = await response.json();
    
    if (data.explainers) {
      return data.explainers.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('Explainers search error:', error);
    return [];
  }
}

async function searchSports(query) {
  try {
    const response = await fetch(`https://the-terrific-proxy.onrender.com/api/sports`);
    const data = await response.json();
    
    if (data.sports) {
      return data.sports.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('Sports search error:', error);
    return [];
  }
}

async function searchWars(query) {
  try {
    const response = await fetch(`https://the-terrific-proxy.onrender.com/api/wars`);
    const data = await response.json();
    
    if (data.articles) {
      return data.articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('Wars search error:', error);
    return [];
  }
}

async function searchYouTube(query) {
  try {
    const response = await fetch(`https://the-terrific-proxy.onrender.com/api/youtube?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.videos) {
      return data.videos.slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

function displaySearchResults(results, query) {
  // Create or get search results modal
  let searchModal = document.getElementById('searchResultsModal');
  
  if (!searchModal) {
    searchModal = document.createElement('div');
    searchModal.id = 'searchResultsModal';
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
      <div class="search-modal-content">
        <div class="search-modal-header">
          <h3>Search Results</h3>
          <span class="close-search-modal">&times;</span>
        </div>
        <div class="search-modal-body">
          <div class="search-results-container"></div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);
    
    // Add close functionality
    searchModal.querySelector('.close-search-modal').addEventListener('click', () => {
      searchModal.style.display = 'none';
    });
    
    // Close on outside click
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.style.display = 'none';
      }
    });
  }
  
  const resultsContainer = searchModal.querySelector('.search-results-container');
  const header = searchModal.querySelector('.search-modal-header h3');
  
  header.textContent = `Search Results for "${query}" (${results.length} found)`;
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No results found for "${query}"</p>
        <p>Try searching with different keywords</p>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = results.map(result => createSearchResultItem(result)).join('');
    
    // Add click handlers to result items
    resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        const result = results[index];
        openSearchResult(result);
      });
    });
  }
  
  // Show the modal
  searchModal.style.display = 'block';
}

function createSearchResultItem(result) {
  const sourceIcons = {
    memes: '🎭',
    explainers: '📚',
    sports: '⚽',
    wars: '⚔️',
    youtube: '📺'
  };
  
  const icon = sourceIcons[result.source] || '📄';
  const title = result.title || 'Untitled';
  const summary = (result.summary || result.description || '').substring(0, 100);
  
  return `
    <div class="search-result-item">
      <div class="search-result-icon">${icon}</div>
      <div class="search-result-content">
        <h4>${title}</h4>
        <p>${summary}${summary.length >= 100 ? '...' : ''}</p>
        <span class="search-result-source">${result.source.toUpperCase()}</span>
      </div>
    </div>
  `;
}

function openSearchResult(result) {
  // Close search modal
  document.getElementById('searchResultsModal').style.display = 'none';
  
  // Handle different result types
  switch (result.source) {
    case 'memes':
      // Open meme in modal or navigate to memes page
      if (result.image) {
        showMemeModal(result);
      } else {
        window.location.href = 'memes.html';
      }
      break;
      
    case 'explainers':
      // Navigate to explainer page
      window.location.href = `explainer.html?id=${result.id}&title=${encodeURIComponent(result.title)}&image=${result.image || ''}`;
      break;
      
    case 'sports':
      // Navigate to sports article
      window.location.href = `sport.html?id=${result.id}&title=${encodeURIComponent(result.title)}`;
      break;
      
    case 'wars':
      // Show wars article modal on homepage
      showWarsArticleModal(result);
      break;
      
    case 'youtube':
      // Open YouTube video
      window.open(`https://www.youtube.com/watch?v=${result.videoId}`, '_blank');
      break;
      
    default:
      console.log('Unknown result source:', result.source);
  }
}

function showWarsArticleModal(article) {
  // Store scroll position
  const warsHomeScrollY = window.scrollY;
  
  // Hide all dialogs
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'none';
  });
  
  // Fetch full article content first
  (async () => {
    try {
      const res = await fetch(
        `https://the-terrific-proxy.onrender.com/api/wars/article?id=${encodeURIComponent(article.id)}`
      );
      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response from server: ${text.slice(0, 60)}`);
      }

      const fullArticle = await res.json();

      if (fullArticle?.error) {
        throw new Error(fullArticle.error);
      }

      // Create wars view overlay (same style as explainers)
      const warsView = document.createElement('div');
      warsView.className = 'explainer-view-overlay';
      warsView.innerHTML = `
        <div class="explainer-view-content">
          <button class="return-home-btn bubble-btn" onclick="closeWarsView()">
            <i class="fas fa-arrow-left"></i> Return to Home
          </button>
          <div class="explainer-article">
            ${fullArticle.image ? `<img src="${fullArticle.image}" class="explainer-article-image" alt="${fullArticle.title}">` : ''}
            <h1 class="explainer-article-title">${fullArticle.title}</h1>
            <div class="explainer-article-meta">
              <span class="source">Source: ${fullArticle.source || article.source || 'Unknown'}</span>
            </div>
            <div class="explainer-article-body">
              ${fullArticle.body || fullArticle.bodyText || fullArticle.summary || 'No content available'}
            </div>
            ${fullArticle.url ? `<a href="${fullArticle.url}" class="original-link" target="_blank">View Original Article →</a>` : ''}
          </div>
        </div>
      `;
      
      document.body.appendChild(warsView);
      document.body.style.overflow = 'hidden';
      
      // Store scroll position for return
      window.warsHomeScrollY = warsHomeScrollY;
      
    } catch (err) {
      console.error("Error loading wars article:", err);
      
      // Show error in same overlay style
      const warsView = document.createElement('div');
      warsView.className = 'explainer-view-overlay';
      warsView.innerHTML = `
        <div class="explainer-view-content">
          <button class="return-home-btn bubble-btn" onclick="closeWarsView()">
            <i class="fas fa-arrow-left"></i> Return to Home
          </button>
          <div class="explainer-article">
            <h1 class="explainer-article-title">${article.title}</h1>
            <div class="explainer-article-body">
              <p>Failed to load full article. ${err.message}</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(warsView);
      document.body.style.overflow = 'hidden';
      window.warsHomeScrollY = warsHomeScrollY;
    }
  })();
}

function closeWarsView() {
  const warsView = document.querySelector('.explainer-view-overlay');
  if (warsView) {
    warsView.remove();
    document.body.style.overflow = '';
  }
  
  // Show all dialogs again
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'block';
  });

  window.scrollTo(0, window.warsHomeScrollY || 0);
}

function showMemeModal(meme) {
  // Create meme modal if it doesn't exist
  let memeModal = document.getElementById('memeModal');
  
  if (!memeModal) {
    memeModal = document.createElement('div');
    memeModal.id = 'memeModal';
    memeModal.className = 'meme-modal';
    memeModal.innerHTML = `
      <div class="meme-modal-content">
        <span class="close-meme-modal">&times;</span>
        <img id="modalMemeImage" src="" alt="Meme">
        <div class="meme-modal-info">
          <h3 id="modalMemeTitle"></h3>
          <p id="modalMemeSource"></p>
        </div>
      </div>
    `;
    document.body.appendChild(memeModal);
    
    // Add close functionality
    memeModal.querySelector('.close-meme-modal').addEventListener('click', () => {
      memeModal.style.display = 'none';
    });
    
    // Close on outside click
    memeModal.addEventListener('click', (e) => {
      if (e.target === memeModal) {
        memeModal.style.display = 'none';
      }
    });
  }
  
  // Set meme content
  document.getElementById('modalMemeImage').src = meme.image;
  document.getElementById('modalMemeTitle').textContent = meme.title;
  document.getElementById('modalMemeSource').textContent = meme.subreddit;
  
  // Show modal
  memeModal.style.display = 'block';
}

function displaySearchError(query) {
  console.log(`Search error for query: "${query}"`);
  // You could show a user-friendly error message here
}
