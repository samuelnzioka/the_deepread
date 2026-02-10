// Sports Slideshow - Gets sports from sports API
let currentSportsSlide = 0;
let sportsData = [];
let sportsAutoScrollInterval;

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

// Load sports content from API
async function loadSportsContent() {
  try {
    console.log('🏅 Loading sports content from sports API...');
    
    // Fetch sports data from our API with retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let sportsData = null;
    
    while (retryCount < maxRetries && !sportsData) {
      try {
        console.log(`Attempt ${retryCount + 1} to fetch sports data...`);
        
        const sportsResponse = await fetch('https://the-terrific-proxy.onrender.com/api/sports?sport=soccer&page=1', {
          timeout: 10000 // 10 second timeout
        });
        
        if (!sportsResponse.ok) {
          if (sportsResponse.status === 504) {
            console.log('⏰ Gateway timeout, retrying...');
            throw new Error('Gateway timeout - retrying...');
          } else {
            throw new Error(`HTTP error! status: ${sportsResponse.status}`);
          }
        }
        
        const freshData = await sportsResponse.json();
        console.log('📋 Fetched fresh sports data:', freshData);
        
        sportsData = freshData.results || freshData.sports || [];
        break; // Success, exit retry loop
        
      } catch (error) {
        console.error(`❌ Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!sportsData) {
      console.error('❌ All retries failed, showing empty sports');
      renderSportsSlides([]);
      return;
    }
    
    sportsData = freshData.sports || [];
    console.log('🎯 Sports data loaded:', sportsData.length, 'items');
    
    if (!Array.isArray(sportsData) || sportsData.length === 0) {
      console.log('❌ No sports available - showing empty state');
      renderSportsSlides([]);
      return;
    }
    
    // Use exactly 6 sports for trending (2 slides with 3 items each)
    const processedSportsData = sportsData.slice(0, 6).map(sport => ({
      id: sport.id,
      slug: sport.slug || createSlugFromTitle(sport.title),
      type: 'sport',
      title: sport.title || 'No title',
      image: sport.image || sport.thumbnail || `https://picsum.photos/200/120?random=${Math.random()}`,
      url: sport.url || `sport.html?id=${sport.id || 'unknown'}`,
      source: sport.source || 'The Guardian'
    }));
    
    console.log('✅ Processed sports data:', processedSportsData);
    
    // Create slides (3 items per slide, 2 slides total)
    const slides = [];
    for (let i = 0; i < processedSportsData.length; i += 3) {
      slides.push(processedSportsData.slice(i, i + 3));
    }
    
    console.log('🎞️ Created slides:', slides);
    renderSportsSlides(slides);
    
  } catch (error) {
    console.error('❌ Error loading sports content:', error);
    renderSportsSlides([]);
  }
}

// Render sports slides
function renderSportsSlides(slides) {
  console.log('🎨 Rendering sports slides:', slides);
  
  const slidesContainer = document.querySelector('#sportsDialog .slides');
  const dotsContainer = document.querySelector('#sportsDialog .slide-dots');
  
  if (!slidesContainer || !dotsContainer) {
    console.error('❌ Sports containers not found');
    return;
  }
  
  // Clear existing content
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  if (!slides || slides.length === 0) {
    console.log('📭 Showing empty state');
    slidesContainer.innerHTML = `
      <div class="slide active">
        <div class="slide-content">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fas fa-football-ball" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
            <h3>No sports news available</h3>
            <p>Check back later for the latest sports analysis.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Create slides
  slides.forEach((slide, index) => {
    console.log(`🎞️ Creating slide ${index + 1} with ${slide.length} items`);
    
    const slideDiv = document.createElement('div');
    slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
    
    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';
    
    slide.forEach(item => {
      const sportItem = document.createElement('div');
      sportItem.className = 'trend-item';
      sportItem.onclick = () => {
        console.log('🏅 Clicked sports item:', item.title);
        // Use existing system
        window.location.href = `sports.html?id=${encodeURIComponent(item.id)}`;
      };
      
      sportItem.innerHTML = `
        <div class="trend-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
        </div>
        <div class="trend-item-content">
          <span class="type-badge">${item.type.toUpperCase()}</span>
          <h4>${item.title}</h4>
          <p>${item.source}</p>
        </div>
      `;
      
      // Handle image errors
      const img = sportItem.querySelector('img');
      img.addEventListener('error', function() {
        this.src = `https://picsum.photos/200/120?random=${Math.random()}`;
      });
      
      slideContent.appendChild(sportItem);
    });
    
    slideDiv.appendChild(slideContent);
    slidesContainer.appendChild(slideDiv);
    
    // Create dot
    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSportsSlide(index);
    dotsContainer.appendChild(dot);
  });
  
  console.log('✅ Sports slides rendered successfully');
}

// Go to specific slide
function goToSportsSlide(index) {
  const slides = document.querySelectorAll('#sportsDialog .slide');
  const dots = document.querySelectorAll('#sportsDialog .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentSportsSlide].classList.remove('active');
  dots[currentSportsSlide].classList.remove('active');
  
  currentSportsSlide = index;
  slides[currentSportsSlide].classList.add('active');
  dots[currentSportsSlide].classList.add('active');
}

// Change slide (next/previous)
function changeSportsSlide(direction) {
  const slides = document.querySelectorAll('#sportsDialog .slide');
  const dots = document.querySelectorAll('#sportsDialog .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentSportsSlide].classList.remove('active');
  dots[currentSportsSlide].classList.remove('active');
  
  // Calculate next slide
  currentSportsSlide = (currentSportsSlide + direction + slides.length) % slides.length;
  
  // Show next slide
  slides[currentSportsSlide].classList.add('active');
  dots[currentSportsSlide].classList.add('active');
}

// Auto-scroll functions
function startAutoScroll() {
  stopAutoScroll();
  sportsAutoScrollInterval = setInterval(() => {
    changeSportsSlide(1);
  }, 4000);
}

function stopAutoScroll() {
  if (sportsAutoScrollInterval) {
    clearInterval(sportsAutoScrollInterval);
    sportsAutoScrollInterval = null;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing sports trending...');
  
  const sportsDialog = document.getElementById('sportsDialog');
  if (sportsDialog) {
    console.log('✅ Sports dialog found, loading content...');
    loadSportsContent();
    startAutoScroll();
    
    // Pause auto-scroll on hover
    sportsDialog.addEventListener('mouseenter', stopAutoScroll);
    sportsDialog.addEventListener('mouseleave', startAutoScroll);
  } else {
    console.error('❌ Sports dialog not found in DOM');
  }
});
