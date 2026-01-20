// Wars & Power Slideshow - Gets content from wars API
console.log('Wars-trending.js loaded successfully!');

let currentWarsSlide = 0;
let warsData = [];
let warsAutoScrollInterval;
let warsRefreshInterval;

async function loadWarsContent() {
  try {
    console.log('Loading wars content from wars API...');
    
    // Always fetch fresh data from wars API
    const warsResponse = await fetch('https://the-terrific-proxy.onrender.com/api/wars?page=1');
    console.log('Wars API response status:', warsResponse.status);
    
    if (!warsResponse.ok) {
      throw new Error(`HTTP error! status: ${warsResponse.status}`);
    }
    
    const freshData = await warsResponse.json();
    console.log('Fetched fresh wars data:', freshData);
    
    let warsApiData = freshData.articles || freshData.results || freshData.wars || [];
    
    if (!Array.isArray(warsApiData) || warsApiData.length === 0) {
      console.log('No wars available - showing empty wars');
      warsData = [];
      renderWarsSlides([]);
      return;
    }
    
    // Use exactly 4 wars for slideshow (2 per slide, 2 slides total)
    warsData = warsApiData.slice(0, 4).map(war => ({
      type: 'war',
      title: war.title || 'No title',
      image: war.image && war.image !== '/assets/placeholder.jpg' 
        ? war.image 
        : `https://source.unsplash.com/200x120/?${encodeURIComponent(war.title || 'war')}`,
      url: `war.html?id=${war.id || 'unknown'}&title=${encodeURIComponent(war.title || '')}&image=${encodeURIComponent(war.image || '')}&summary=${encodeURIComponent(war.summary || '')}&body=${encodeURIComponent(war.body || '')}&source=${encodeURIComponent(war.source || '')}&published=${encodeURIComponent(war.published || '')}&url=${encodeURIComponent(war.url || '')}`,
      source: war.source || 'Unknown'
    }));
    
    console.log('Processed wars data:', warsData);
    
  } catch (error) {
    console.error('Error loading wars content:', error);
    console.log('No wars content available - showing empty');
    warsData = [];
  }
  
  // Create slides (2 items per slide, 2 slides total)
  const slides = [];
  if (warsData.length > 0) {
    for (let i = 0; i < warsData.length; i += 2) {
      slides.push(warsData.slice(i, i + 2));
    }
  }
  
  console.log('Created wars slides:', slides);
  renderWarsSlides(slides);
}

function renderWarsSlides(slides) {
  console.log('Rendering wars slides:', slides);
  
  const slidesContainer = document.querySelector('#warsDialog .slides');
  const dotsContainer = document.querySelector('#warsDialog .wars-dots');
  
  console.log('Found elements:', {
    slidesContainer: !!slidesContainer,
    dotsContainer: !!dotsContainer,
    warsDialog: !!document.querySelector('#warsDialog')
  });
  
  if (!slidesContainer || !dotsContainer) {
    console.error('Wars slides container or dots container not found');
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
          <i class="fas fa-globe-americas" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
          <h3>No wars analysis available</h3>
          <p>Check back later for the latest geopolitical updates.</p>
        </div>
      </div>
    `;
    slidesContainer.appendChild(emptySlide);
    console.log('Showing empty state - no wars available');
    return;
  }
  
  // Create slides
  slides.forEach((slide, index) => {
    console.log(`Creating wars slide ${index + 1} with ${slide.length} items`);
    
    const slideDiv = document.createElement('div');
    slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
    
    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';
    
    slide.forEach(item => {
      const trendItem = document.createElement('div');
      trendItem.className = 'trend-item';
      trendItem.onclick = () => {
        console.log('Clicked wars item:', item);
        // Store war data for homepage display
        localStorage.setItem('currentWar', JSON.stringify(item));
        // Show war on homepage
        showWarOnHomepage(item);
      };
      
      trendItem.innerHTML = `
        <div class="trend-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy" 
               onerror="this.src='https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'war')}'">
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
          this.src = `https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'war')}`;
        });
      }
      
      slideContent.appendChild(trendItem);
    });
    
    slideDiv.appendChild(slideContent);
    slidesContainer.appendChild(slideDiv);
    
    // Create dot
    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToWarsSlide(index);
    dotsContainer.appendChild(dot);
  });
  
  console.log('Wars slides rendered successfully');
}

function showWarOnHomepage(war) {
  // Preserve scroll position so we can return to the same spot
  window.warHomeScrollY = window.scrollY || 0;

  // Hide all dialogs
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'none';
  });
  
  // Create war view overlay
  const warView = document.createElement('div');
  warView.className = 'war-view-overlay';
  warView.innerHTML = `
    <div class="war-view-content">
      <button class="return-home-btn bubble-btn" onclick="closeWarView()">
        <i class="fas fa-arrow-left"></i> Return to Home
      </button>
      <div class="war-article">
        ${war.image ? `<img src="${war.image}" class="war-article-image" alt="${war.title}">` : ''}
        <h1 class="war-article-title">${war.title}</h1>
        <div class="war-article-meta">
          <span class="source">Source: ${war.source}</span>
        </div>
        <div class="war-article-body">
          <p>${war.summary || 'No summary available'}</p>
        </div>
        <a href="${war.url}" class="original-link" target="_blank">
          View Original Article →
        </a>
      </div>
    </div>
  `;
  
  document.body.appendChild(warView);
  document.body.style.overflow = 'hidden';
}

function closeWarView() {
  const warView = document.querySelector('.war-view-overlay');
  if (warView) {
    warView.remove();
    document.body.style.overflow = '';
  }
  
  // Show all dialogs again
  document.querySelectorAll('.dialog').forEach(dialog => {
    dialog.style.display = 'block';
  });

  window.scrollTo(0, window.warHomeScrollY || 0);
}

function changeWarsSlide(direction) {
  const slides = document.querySelectorAll('#warsDialog .slide');
  const dots = document.querySelectorAll('#warsDialog .wars-dots .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentWarsSlide].classList.remove('active');
  dots[currentWarsSlide].classList.remove('active');
  
  // Calculate new slide index
  currentWarsSlide = (currentWarsSlide + direction + slides.length) % slides.length;
  
  // Show new slide
  slides[currentWarsSlide].classList.add('active');
  dots[currentWarsSlide].classList.add('active');
  
  console.log(`Changed to wars slide ${currentWarsSlide + 1}`);
}

function goToWarsSlide(index) {
  const slides = document.querySelectorAll('#warsDialog .slide');
  const dots = document.querySelectorAll('#warsDialog .wars-dots .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentWarsSlide].classList.remove('active');
  dots[currentWarsSlide].classList.remove('active');
  
  // Show selected slide
  currentWarsSlide = index;
  slides[currentWarsSlide].classList.add('active');
  dots[currentWarsSlide].classList.add('active');
  
  console.log(`Went to wars slide ${index + 1}`);
}

function startWarsAutoScroll() {
  // Clear any existing interval
  if (warsAutoScrollInterval) {
    clearInterval(warsAutoScrollInterval);
  }
  
  warsAutoScrollInterval = setInterval(() => {
    changeWarsSlide(1);
  }, 8000);
}

function startWarsRefreshInterval() {
  // Clear any existing interval
  if (warsRefreshInterval) {
    clearInterval(warsRefreshInterval);
  }
  
  warsRefreshInterval = setInterval(() => {
    console.log('Refreshing wars data (2-hour interval)');
    loadWarsContent();
  }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadWarsContent().then(() => {
      startWarsAutoScroll();
      startWarsRefreshInterval();
    });
  });
} else {
  loadWarsContent().then(() => {
    startWarsAutoScroll();
    startWarsRefreshInterval();
  });
}
