const container = document.getElementById("wars-feed");
const loadMoreBtn = document.getElementById("loadMoreBtn");

console.log("🔍 Wars page loaded");
console.log("🎯 Container element:", container);
console.log("🎯 Load More button:", loadMoreBtn);

if (!container) {
  console.error("❌ #wars-feed container not found");
} else {
  console.log("✅ Container found, current content:", container.innerHTML);
}

if (!loadMoreBtn) {
  console.error("❌ #loadMoreBtn button not found");
} else {
  console.log("✅ Load More button found");
}

// Handle URL parameters for individual war articles
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("Wars page loaded with ID:", id);

// Function to render individual war article
function renderWarArticle() {
  console.log("Rendering individual war article for ID:", id);
  
  // Hide load more button for individual article view
  if (loadMoreBtn) {
    loadMoreBtn.style.display = 'none';
  }

  // Fetch full article data
  fetch(`https://the-terrific-proxy.onrender.com/api/wars/article?id=${encodeURIComponent(id)}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(article => {
      console.log("Full war article data:", article);
      
      container.innerHTML = `
        <div class="explainer-content">
          ${article.image ? `<img src="${article.image}" alt="${article.title}" class="explainer-image">` : ''}
          <h1 class="explainer-title">${article.title}</h1>
          
          <div class="explainer-meta">
            <span class="source">${article.source || 'Unknown'}</span>
            <span class="published">${article.date ? new Date(article.date).toLocaleDateString() : 'Unknown date'}</span>
            ${article.url ? `<a href="${article.url}" target="_blank" class="original-link">View Original →</a>` : ''}
          </div>
          
          <div class="explainer-summary">
            <h2>Summary</h2>
            <p>${article.summary || 'No summary available'}</p>
          </div>
          
          <div class="explainer-body">
            <h2>Full Analysis</h2>
            ${article.body || article.background || 'No full analysis available'}
          </div>
        </div>
      `;
      
      // Add go back functionality
      const goBackBtn = document.createElement('button');
      goBackBtn.className = 'go-back-btn';
      goBackBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Go Back to Wars & Power';
      goBackBtn.onclick = () => {
        window.location.href = 'wars.html';
      };
      container.insertBefore(goBackBtn, container.firstChild);
      
    })
    .catch(err => {
      console.error('Error fetching war article:', err);
      container.innerHTML = '<p>Error loading war article. Please try again.</p>';
    });
}

let page = 1;
let loading = false;
let hasMore = true;

async function loadWars() {
  if (loading || !hasMore) return;
  loading = true;

  console.log(`📰 Loading wars page ${page}`);
  console.log(`🌐 Fetching URL: https://the-terrific-proxy.onrender.com/api/wars?page=${page}`);

  try {
    const res = await fetch(`https://the-terrific-proxy.onrender.com/api/wars?page=${page}`);
    console.log("📡 Response status:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("📄 Wars data received:", data);

    if (!data || !data.articles || data.articles.length === 0) {
      console.log("📭 No more wars articles available");
      hasMore = false;
      if (page === 1) {
        container.innerHTML = '<p>No wars articles found.</p>';
      }
      return;
    }

    const articles = data.articles;
    console.log(`📄 Found ${articles.length} articles`);

    if (page === 1) {
      console.log("🧹 Clearing container for first load");
      container.innerHTML = "";
    }
    
    articles.forEach(article => {
      const articleCard = document.createElement('div');
      articleCard.className = 'explainer-card';
      
      articleCard.innerHTML = `
        ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
        <div class="explainer-content">
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
          <a class="bubble-btn" href="wars.html?id=${encodeURIComponent(article.id)}">
            Read Full Analysis
          </a>
        </div>
      `;
      
      container.appendChild(articleCard);
    });

    page++;
    hasMore = true; // Always true for endless scrolling
    loading = false;

    if (loadMoreBtn) {
      loadMoreBtn.textContent = hasMore ? '📰 Load More Articles' : '📚 No More Articles';
      loadMoreBtn.disabled = !hasMore;
    }

  } catch (err) {
    console.error('❌ Error loading wars:', err);
    container.innerHTML = '<p>Error loading wars articles. Please try again.</p>';
    loading = false;
  }
}

// Load more button click handler
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', loadWars);
}

// Infinite scroll
window.addEventListener('scroll', () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 300
  ) {
    console.log('📜 Scroll trigger - loading more wars');
    loadWars();
  }
});

// Initial load
loadWars();

if (loadMoreBtn) {
  console.log("🎯 Adding click listener to load more button");
  loadMoreBtn.addEventListener("click", loadWars);
} else {
  console.log("❌ Cannot add listener - loadMoreBtn not found");
}

window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 300
  ) {
    console.log("📜 Scroll trigger - loading more wars");
    loadWars();
  }
});

console.log("🚀 Starting initial wars load");

// Check if we have URL parameters for individual article
if (id) {
  renderWarArticle();
} else {
  loadWars();
}
