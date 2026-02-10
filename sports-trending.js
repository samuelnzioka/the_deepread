// Sports Slideshow - Gets content from sports tab (like trending gets from explainers)
let currentSportsSlide = 0;
let sportsData = []; // Make this global for access in click handlers
let sportsAutoScrollInterval;
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

async function loadSportsContent() {
  try {
    console.log('Loading sports content from sports API...');
    
    // Fetch from sports API (like trending gets from explainers)
    const sportsResponse = await fetch('https://the-terrific-proxy.onrender.com/api/sports?sport=soccer&page=1');
    
    if (!sportsResponse.ok) {
      throw new Error(`HTTP error! status: ${sportsResponse.status}`);
    }
    
    const freshData = await sportsResponse.json();
    console.log('Fetched fresh sports data:', freshData);
    
    sportsData = freshData.results || freshData.sports || [];
    
    if (!Array.isArray(sportsData) || sportsData.length === 0) {
      console.log('No sports available - showing empty trending');
      renderSportsSlides([]);
      return;
    }
    
    // Use exactly 6 sports items for trending (2 per slide, 3 slides total)
    const displayData = sportsData.slice(0, 6).map(article => ({
      id: article.link, // CRITICAL: Include ID for full analysis
      url: article.link,
      slug: createSlugFromTitle(article.title),
      type: 'sports',
      title: article.title || 'No title',
      image: article.image && article.image !== '/assets/placeholder.jpg' 
        ? article.image 
        : `https://source.unsplash.com/200x120/?${encodeURIComponent(article.title || 'sports')}`,
      source: 'Sports'
    }));
    
    renderSportsSlides(displayData);
    
  } catch (error) {
    console.error('❌ Error loading sports:', error);
    renderSportsSlides([]);
  }
}

function renderSportsSlides(articles) {
  const slidesContainer = document.querySelector('#sportsDialog .slides');
  const dotsContainer = document.querySelector('#sportsDialog .slide-dots');
  
  if (!slidesContainer || !dotsContainer) {
    console.error('Sports container not found');
    return;
  }
  
  // Clear existing content
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  if (!articles || articles.length === 0) {
    slidesContainer.innerHTML = '<div class="no-content">No sports available</div>';
    return;
  }
  
  // Create slides (2 articles per slide)
  const slides = [];
  for (let i = 0; i < articles.length; i += 2) {
    slides.push(articles.slice(i, i + 2));
  }
  
  slides.forEach((slide, index) => {
    const slideDiv = document.createElement('div');
    slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
    
    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';
    
    slide.forEach((item, itemIndex) => {
      const trendItem = document.createElement('div');
      trendItem.className = 'trend-item';
      trendItem.onclick = () => {
        console.log('Clicked sports item:', item);
        console.log('Item ID:', item.id);
        
        // Navigate to sports page for full analysis (like trending goes to explainer.html)
        window.location.href = `sports.html?sport=soccer`;
      };
      
      trendItem.innerHTML = `
        <div class="trend-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy" 
               onerror="this.src='https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'sports')}'">
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
          this.src = `https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'sports')}`;
        });
      }
      
      slideContent.appendChild(trendItem);
    });
    
    slideDiv.appendChild(slideContent);
    slidesContainer.appendChild(slideDiv);
    
    // Create dot
    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSportsSlide(index);
    dotsContainer.appendChild(dot);
  });
  
  console.log('Sports slides rendered successfully');
}

// Go to specific slide
function goToSportsSlide(index) {
  const slides = document.querySelectorAll('#sportsDialog .slide');
  const dots = document.querySelectorAll('#sportsDialog .dot');
  
  if (slides.length === 0) return;
  
  // Hide all slides
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Show current slide
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  
  currentSportsSlide = index;
}

// Change slide (next/previous)
function changeSportsSlide(direction) {
  const slides = document.querySelectorAll('#sportsDialog .slide');
  const dots = document.querySelectorAll('#sportsDialog .dot');
  
  if (slides.length === 0) return;
  
  // Hide current slide
  slides[currentSportsSlide].classList.remove('active');
  dots[currentSportsSlide].classList.remove('active');
  
  currentSportsSlide += direction;
  
  if (currentSportsSlide < 0) currentSportsSlide = slides.length - 1;
  if (currentSportsSlide >= slides.length) currentSportsSlide = 0;
  
  goToSportsSlide(currentSportsSlide);
}

// Auto-scroll functionality
function startAutoScroll() {
  sportsAutoScrollInterval = setInterval(() => {
    changeSportsSlide(1);
  }, 5000);
}

function stopAutoScroll() {
  if (sportsAutoScrollInterval) {
    clearInterval(sportsAutoScrollInterval);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing sports trending...');
  
  const sportsDialog = document.getElementById('sportsDialog');
  if (sportsDialog) {
    console.log('✅ Sports dialog found, loading content...');
    loadSportsContent();
    
    // Add slide navigation buttons
    setTimeout(() => {
      const prevBtn = document.querySelector('#sportsDialog .slide-btn.prev');
      const nextBtn = document.querySelector('#sportsDialog .slide-btn.next');
      
      if (prevBtn) prevBtn.onclick = () => changeSportsSlide(-1);
      if (nextBtn) nextBtn.onclick = () => changeSportsSlide(1);
      
      // Start auto-scroll
      startAutoScroll();
      
      // Pause auto-scroll on hover
      const slidesContainer = document.querySelector('#sportsDialog .slideshow-container');
      if (slidesContainer) {
        slidesContainer.addEventListener('mouseenter', stopAutoScroll);
        slidesContainer.addEventListener('mouseleave', startAutoScroll);
      }
    }, 1000);
  } else {
    console.error('❌ Sports dialog not found in DOM');
  }
});
