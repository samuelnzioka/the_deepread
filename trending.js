// Trending Now Box - Gets content from explainers tab
let currentSlide = 0;
let trendingData = [];
let explainersData = []; // Make this global for access in click handlers
let autoScrollInterval;
let refreshInterval;

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

async function loadTrendingContent() {
  try {
    console.log('Loading trending content from explainers API...');
    
    // Fetch from explainers API
    const explainersResponse = await fetch('https://the-terrific-proxy.onrender.com/api/explainers?page=1');
    
    if (!explainersResponse.ok) {
      throw new Error(`HTTP error! status: ${explainersResponse.status}`);
    }
    
    const freshData = await explainersResponse.json();
    console.log('Fetched fresh explainers data:', freshData);
    
    explainersData = freshData.results || freshData.explainers || [];
    
    if (!Array.isArray(explainersData) || explainersData.length === 0) {
      console.log('No explainers available - showing empty trending');
      trendingData = [];
      renderSlides([]);
      return;
    }
    
    // Use exactly 6 explainers for trending (2 per slide, 3 slides total)
    trendingData = explainersData.slice(0, 6).map(explainer => ({
      id: explainer.id, // CRITICAL: Include ID for full analysis
      slug: explainer.slug || createSlugFromTitle(explainer.title),
      type: 'explainer',
      title: explainer.title || 'No title',
      image: explainer.image && explainer.image !== '/assets/placeholder.jpg' 
        ? explainer.image 
        : `https://source.unsplash.com/200x120/?${encodeURIComponent(explainer.title || 'explainer')}`,
      source: explainer.source || 'Unknown',
      summary: explainer.summary || '',
      body: explainer.body || explainer.background || '',
      date: explainer.date || '',
      url: explainer.url || ''
    }));
    
    console.log('Processed trending data:', trendingData);
    
  } catch (error) {
    console.error('Error loading trending content:', error);
    console.log('No trending content available - showing empty');
    trendingData = [];
  }
  
  // Create slides (2 items per slide, 3 slides total)
  const slides = [];
  if (trendingData.length > 0) {
    for (let i = 0; i < trendingData.length; i += 2) {
      slides.push(trendingData.slice(i, i + 2));
    }
  }
  
  console.log('Created slides:', slides);
  renderSlides(slides);
}

function renderSlides(slides) {
  console.log('Rendering slides:', slides);
  
  const slidesContainer = document.querySelector('#trendingDialog .slides');
  const dotsContainer = document.querySelector('#trendingDialog .slide-dots');
  
  if (!slidesContainer || !dotsContainer) {
    console.error('Trending slides container or dots container not found');
    return;
  }
  
  // Clear existing content
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  if (slides.length === 0) {
    // Show empty state
    const emptySlide = document.createElement('div');
    emptySlide.className = 'slide active';
    emptySlide.innerHTML = `
      <div class="slide-content">
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fas fa-newspaper" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
          <h3>No explainers available</h3>
          <p>Check back later for the latest geopolitical analysis.</p>
        </div>
      </div>
    `;
    slidesContainer.appendChild(emptySlide);
    console.log('Showing empty state - no explainers available');
    return;
  }
  
  // Create slides
  slides.forEach((slide, index) => {
    console.log(`Creating slide ${index + 1} with ${slide.length} items`);
    
    const slideDiv = document.createElement('div');
    slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
    
    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';
    
    slide.forEach((item, itemIndex) => {
      const trendItem = document.createElement('div');
      trendItem.className = 'trend-item';
      trendItem.onclick = () => {
        console.log('Clicked trending item:', item);
        console.log('Item ID:', item.id);
        console.log('Item ID type:', typeof item.id);
        console.log('Available explainersData:', explainersData);
        console.log('ExplainersData IDs:', explainersData.map(e => ({ id: e.id, idType: typeof e.id, title: e.title })));
        
        // Navigate to dedicated explainer page for full analysis
        window.location.href = `explainer.html?id=${encodeURIComponent(item.id)}`;
      };
      
      trendItem.innerHTML = `
        <div class="trend-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy" 
               onerror="this.src='https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'explainer')}'">
        </div>
        <div class="trend-item-content">
          <span class="type-badge">${item.type.toUpperCase()}</span>
          <h4>${item.title}</h4>
          <p>${item.source}</p>
        </div>
      `;
      
      // Add image load error handling
      const img = trendItem.querySelector('img');
      if (img) {
        img.addEventListener('error', function() {
          this.src = `https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'explainer')}`;
        });
      }
      
      slideContent.appendChild(trendItem);
    });
    
    slideDiv.appendChild(slideContent);
    slidesContainer.appendChild(slideDiv);
    
    // Create dot
    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
  });
  
  console.log('Slides rendered successfully');
}

function changeSlide(direction) {
  const slides = document.querySelectorAll('#trendingDialog .slide');
  const dots = document.querySelectorAll('#trendingDialog .slide-dots .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  
  // Calculate new slide index
  currentSlide += direction;
  if (currentSlide >= slides.length) currentSlide = 0;
  if (currentSlide < 0) currentSlide = slides.length - 1;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  
  console.log(`Changed to slide ${currentSlide + 1} of ${slides.length}`);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('#trendingDialog .slide');
  const dots = document.querySelectorAll('#trendingDialog .slide-dots .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  
  // Show new slide
  currentSlide = index;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

// Auto-advance slides every 8 seconds
function startAutoScroll() {
  // Clear any existing interval
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
  
  autoScrollInterval = setInterval(() => {
    changeSlide(1);
  }, 8000);
}

// Refresh trending data every 2 hours

// Unified function to show full analysis on homepage (same as explainers tab)
async function showFullAnalysisOnHomepage(item) {
  const homeScrollY = window.scrollY || 0;

  // Hide all dialogs
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'none';
  });

  let fullItem = item;
  try {
    // Fetch full content for explainer
    if (item.type === 'explainer' && item.id) {
      const res = await fetch(
        `https://the-terrific-proxy.onrender.com/api/explainers/${encodeURIComponent(item.id)}`
      );
      if (res.ok) {
        fullItem = await res.json();
      }
    }
  } catch (e) {
    console.error('Error fetching full content:', e);
    fullItem = item;
  }
  
  // Create explainer view overlay (same as explainers tab)
  const itemView = document.createElement('div');
  itemView.className = 'explainer-view-overlay';
  itemView.innerHTML = `
    <div class="explainer-view-content">
      <button class="bubble-btn" onclick="closeFullAnalysisView()">
        <i class="fas fa-arrow-left"></i> Return to Home
      </button>
      <div class="explainer-article">
        ${fullItem.image ? `<img src="${fullItem.image}" class="explainer-article-image" alt="${fullItem.title}">` : ''}
        <h1 class="explainer-article-title">${fullItem.title}</h1>
        <div class="explainer-article-meta">
          <span class="source">Source: ${fullItem.source || item.source || 'Unknown'}</span>
        </div>
        <div class="explainer-article-body">
          ${getArticleContent(fullItem, item)}
        </div>
        ${fullItem.url || item.url ? `<a href="${fullItem.url || item.url}" class="original-link" target="_blank">View Original Article →</a>` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(itemView);
  document.body.style.overflow = 'hidden';
  
  // Store scroll position for return
  window.fullAnalysisHomeScrollY = homeScrollY;
}

// Helper function to get article content (same as explainers tab)
function getArticleContent(fullItem, originalItem) {
  // Explainer content (structured sections)
  return (fullItem.background || fullItem.happening || fullItem.globalImpact || fullItem.whyItMatters || fullItem.outlook) ? `
    ${fullItem.background ? `<h2>Background</h2><p>${fullItem.background}</p>` : ''}
    ${fullItem.happening ? `<h2>What's Happening</h2><p>${fullItem.happening}</p>` : ''}
    ${fullItem.globalImpact ? `<h2>Global Impact</h2><p>${fullItem.globalImpact}</p>` : ''}
    ${fullItem.whyItMatters ? `<h2>Why It Matters</h2><p>${fullItem.whyItMatters}</p>` : ''}
    ${fullItem.outlook ? `<h2>What Comes Next</h2><p>${fullItem.outlook}</p>` : ''}
  ` : `<p>${fullItem.summary || originalItem.summary || 'No summary available'}</p>`;
}

function closeFullAnalysisView() {
  const itemView = document.querySelector('.explainer-view-overlay');
  if (itemView) {
    itemView.remove();
    document.body.style.overflow = '';
  }
  
  // Show all dialogs again
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'block';
  });

  window.scrollTo(0, window.fullAnalysisHomeScrollY || 0);
}

function startRefreshInterval() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  refreshInterval = setInterval(() => {
    console.log('Refreshing trending data (2-hour interval)');
    loadTrendingContent();
  }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadTrendingContent().then(() => {
      startAutoScroll();
      startRefreshInterval();
    });
  });
} else {
  loadTrendingContent().then(() => {
    startAutoScroll();
    startRefreshInterval();
  });
}