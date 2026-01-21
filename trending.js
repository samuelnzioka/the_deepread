// Trending Slideshow - Gets explainers from the explainers page
let currentSlide = 0;
let trendingData = [];
let autoScrollInterval;
let refreshInterval;

async function loadTrendingContent() {
  try {
    console.log('Loading trending content from explainers API...');
    
    // Always fetch fresh data from the same API as explainers
    const explainersResponse = await fetch('https://the-terrific-proxy.onrender.com/api/explainers?page=1');
    
    if (!explainersResponse.ok) {
      throw new Error(`HTTP error! status: ${explainersResponse.status}`);
    }
    
    const freshData = await explainersResponse.json();
    console.log('Fetched fresh explainers data:', freshData);
    
    let explainersData = freshData.results || freshData.explainers || [];
    
    if (!Array.isArray(explainersData) || explainersData.length === 0) {
      console.log('No explainers available - showing empty trending');
      trendingData = [];
      renderSlides([]);
      return;
    }
    
    // Use exactly 8 explainers for trending (4 per slide, 2 slides total)
    trendingData = explainersData.slice(0, 8).map(explainer => ({
      type: 'explainer',
      title: explainer.title || 'No title',
      image: explainer.image && explainer.image !== '/assets/placeholder.jpg' 
        ? explainer.image 
        : `https://source.unsplash.com/200x120/?${encodeURIComponent(explainer.title || 'explainer')}`,
      url: `explainer.html?id=${explainer.id || 'unknown'}&title=${encodeURIComponent(explainer.title || '')}&image=${encodeURIComponent(explainer.image || '')}&summary=${encodeURIComponent(explainer.summary || '')}&body=${encodeURIComponent(explainer.body || '')}&source=${encodeURIComponent(explainer.source || '')}&published=${encodeURIComponent(explainer.published || '')}&url=${encodeURIComponent(explainer.url || '')}`,
      source: explainer.source || 'Unknown'
    }));
    
    console.log('Processed trending data:', trendingData);
    
  } catch (error) {
    console.error('Error loading trending content:', error);
    console.log('No trending content available - showing empty');
    trendingData = [];
  }
  
  // Create slides (4 items per slide, 2 slides total)
  const slides = [];
  if (trendingData.length > 0) {
    for (let i = 0; i < trendingData.length; i += 4) {
      slides.push(trendingData.slice(i, i + 4));
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
    
    slide.forEach(item => {
      const trendItem = document.createElement('div');
      trendItem.className = 'trend-item';
      trendItem.onclick = () => {
        console.log('Clicked trending item:', item);
        
        // Use appropriate modal based on item type
        if (item.type && item.type.toLowerCase() === 'war analysis') {
          // Use wars modal for war analysis items
          showWarsArticleModal(item);
        } else {
          // Use explainer modal for other items
          localStorage.setItem('currentExplainer', JSON.stringify(item));
          showExplainerOnHomepage(item);
        }
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
let explainerHomeScrollY = 0;

async function showExplainerOnHomepage(explainer) {
  explainerHomeScrollY = window.scrollY || 0;

  // Hide all dialogs
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'none';
  });

  let fullExplainer = explainer;
  try {
    if (explainer && explainer.id) {
      const res = await fetch(`https://the-terrific-proxy.onrender.com/api/explainers/${encodeURIComponent(explainer.id)}`);
      if (res.ok) {
        fullExplainer = await res.json();
      }
    }
  } catch (e) {
    fullExplainer = explainer;
  }
  
  // Create explainer view overlay
  const explainerView = document.createElement('div');
  explainerView.className = 'explainer-view-overlay';
  explainerView.innerHTML = `
    <div class="explainer-view-content">
      <button class="return-home-btn bubble-btn" onclick="closeExplainerView()">
        <i class="fas fa-arrow-left"></i> Return to Home
      </button>
      <div class="explainer-article">
        ${fullExplainer.image ? `<img src="${fullExplainer.image}" class="explainer-article-image" alt="${fullExplainer.title}">` : ''}
        <h1 class="explainer-article-title">${fullExplainer.title}</h1>
        <div class="explainer-article-meta">
          <span class="source">Source: ${fullExplainer.source || explainer.source || 'Unknown'}</span>
        </div>
        <div class="explainer-article-body">
          ${(fullExplainer.background || fullExplainer.happening || fullExplainer.globalImpact || fullExplainer.whyItMatters || fullExplainer.outlook) ? `
            ${fullExplainer.background ? `<h2>Background</h2><p>${fullExplainer.background}</p>` : ''}
            ${fullExplainer.happening ? `<h2>What’s Happening</h2><p>${fullExplainer.happening}</p>` : ''}
            ${fullExplainer.globalImpact ? `<h2>Global Impact</h2><p>${fullExplainer.globalImpact}</p>` : ''}
            ${fullExplainer.whyItMatters ? `<h2>Why It Matters</h2><p>${fullExplainer.whyItMatters}</p>` : ''}
            ${fullExplainer.outlook ? `<h2>What Comes Next</h2><p>${fullExplainer.outlook}</p>` : ''}
          ` : `<p>${fullExplainer.summary || explainer.summary || 'No summary available'}</p>`}
        </div>
        <a href="${explainer.url}" class="original-link" target="_blank">
          View Original Article →
        </a>
      </div>
    </div>
  `;
  
  document.body.appendChild(explainerView);
  document.body.style.overflow = 'hidden';
}

function closeExplainerView() {
  const explainerView = document.querySelector('.explainer-view-overlay');
  if (explainerView) {
    explainerView.remove();
    document.body.style.overflow = '';
  }
  
  // Show all dialogs again
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'block';
  });

  window.scrollTo(0, explainerHomeScrollY || 0);
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
