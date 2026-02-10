// Local News Box - Gets content from local tab
let localNewsData = [];

async function loadLocalNewsContent() {
  try {
    console.log('Loading local news content from API...');
    
    // Fetch from local API (Kenya by default for homepage)
    const localResponse = await fetch('https://the-terrific-proxy.onrender.com/api/local-news/kenya');
    
    if (!localResponse.ok) {
      throw new Error(`HTTP error! status: ${localResponse.status}`);
    }
    
    const freshData = await localResponse.json();
    console.log('Fetched fresh local news data:', freshData);
    
    localNewsData = freshData || [];
    
    if (!Array.isArray(localNewsData) || localNewsData.length === 0) {
      console.log('No local news available - showing empty local news');
      renderLocalNewsCards([]);
      return;
    }
    
    // Use exactly 6 local news items for display (2 per slide, 3 slides total)
    const displayData = localNewsData.slice(0, 6).map(article => ({
      id: article.link, // Use link as ID
      url: article.link,
      title: article.title || 'No title',
      image: article.image || `https://source.unsplash.com/200x120/?${encodeURIComponent(article.title || 'local news')}`,
      source: 'Kenya',
      type: 'local'
    }));
    
    renderLocalNewsCards(displayData);
    
  } catch (error) {
    console.error('❌ Error loading local news:', error);
    renderLocalNewsCards([]);
  }
}

function renderLocalNewsCards(articles) {
  const slidesContainer = document.querySelector('#newDialog .slides');
  const dotsContainer = document.querySelector('#newDialog .slide-dots');
  
  if (!slidesContainer || !dotsContainer) {
    console.error('Local news container not found');
    return;
  }
  
  // Clear existing content
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  if (!articles || articles.length === 0) {
    slidesContainer.innerHTML = '<div class="no-content">No local news available</div>';
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
        console.log('Clicked local news item:', item);
        console.log('Item URL:', item.url);
        
        // Navigate to dedicated local article page for full analysis
        window.location.href = `local-article.html?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}&country=kenya`;
      };
      
      trendItem.innerHTML = `
        <div class="trend-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy" 
               onerror="this.src='https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'local news')}'">
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
          this.src = `https://source.unsplash.com/200x120/?${encodeURIComponent(item.title || 'local news')}`;
        });
      }
      
      slideContent.appendChild(trendItem);
    });
    
    slideDiv.appendChild(slideContent);
    slidesContainer.appendChild(slideDiv);
    
    // Create dot
    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToLocalSlide(index);
    dotsContainer.appendChild(dot);
  });
  
  console.log('Local news slides rendered successfully');
}

// Slide navigation functions
let currentLocalSlide = 0;

function goToLocalSlide(index) {
  const slides = document.querySelectorAll('#newDialog .slide');
  const dots = document.querySelectorAll('#newDialog .dot');
  
  if (slides.length === 0) return;
  
  // Hide all slides
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Show current slide
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  
  currentLocalSlide = index;
}

function changeLocalSlide(direction) {
  const slides = document.querySelectorAll('#newDialog .slide');
  if (slides.length === 0) return;
  
  currentLocalSlide += direction;
  
  if (currentLocalSlide < 0) currentLocalSlide = slides.length - 1;
  if (currentLocalSlide >= slides.length) currentLocalSlide = 0;
  
  goToLocalSlide(currentLocalSlide);
}

// Auto-scroll functionality
function startLocalAutoScroll() {
  autoScrollInterval = setInterval(() => {
    changeLocalSlide(1);
  }, 5000);
}

function stopLocalAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadLocalNewsContent();
  
  // Add slide navigation buttons
  setTimeout(() => {
    const prevBtn = document.querySelector('#newDialog .slide-btn.prev');
    const nextBtn = document.querySelector('#newDialog .slide-btn.next');
    
    if (prevBtn) prevBtn.onclick = () => changeLocalSlide(-1);
    if (nextBtn) nextBtn.onclick = () => changeLocalSlide(1);
    
    // Start auto-scroll
    startLocalAutoScroll();
    
    // Pause auto-scroll on hover
    const slidesContainer = document.querySelector('#newDialog .slideshow-container');
    if (slidesContainer) {
      slidesContainer.addEventListener('mouseenter', stopLocalAutoScroll);
      slidesContainer.addEventListener('mouseleave', startLocalAutoScroll);
    }
  }, 1000);
});
