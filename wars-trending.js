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
      id: war.id,
      type: 'war',
      title: war.title || 'No title',
      image: war.image && war.image !== '/assets/placeholder.jpg' 
        ? war.image 
        : `https://source.unsplash.com/200x120/?${encodeURIComponent(war.title || 'war')}`,
      summary: war.summary || '',
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
        // Simple redirect to wars page (advertisement behavior)
        window.location.href = `wars.html?id=${encodeURIComponent(item.id)}`;
      };
      
      trendItem.innerHTML = `
        <div class="trend-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy" 
               onerror="this.src='https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'war')}'">
        </div>
        <div class="trend-item-content">
          <span class="type-badge">WARS & POWER</span>
          <h4>${item.title}</h4>
          <p>${item.summary?.substring(0, 100) || ''}...</p>
          <div class="read-more">Read full analysis →</div>
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

// Initialize wars content when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - loading wars content...');
  loadWarsContent();
});

// Slide navigation functions
function goToWarsSlide(index) {
  const slides = document.querySelectorAll('#warsDialog .slide');
  const dots = document.querySelectorAll('#warsDialog .dot');
  
  if (slides.length === 0 || dots.length === 0) return;
  
  // Remove active class from all slides and dots
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Add active class to selected slide and dot
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  
  currentWarsSlide = index;
}

function changeWarsSlide(direction) {
  const slides = document.querySelectorAll('#warsDialog .slide');
  const dots = document.querySelectorAll('#warsDialog .dot');
  
  if (slides.length === 0) return;
  
  currentWarsSlide += direction;
  
  if (currentWarsSlide >= slides.length) {
    currentWarsSlide = 0;
  } else if (currentWarsSlide < 0) {
    currentWarsSlide = slides.length - 1;
  }
  
  goToWarsSlide(currentWarsSlide);
}
