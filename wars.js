const params = new URLSearchParams(window.location.search);
const warId = params.get('id');

console.log("🔍 Wars page loaded");
console.log("🎯 War ID from URL:", warId);

const container = document.getElementById("wars-feed");
const loadMoreBtn = document.getElementById("loadMoreBtn");

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

// If warId exists, show single war article
if (warId) {
  console.log("📄 Loading single war article with ID:", warId);
  loadSingleWar(warId);
} else {
  // Otherwise, load list of wars
  console.log("📰 Loading wars list");
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
      console.log(`📡 Response status: ${res.status}`);
      
      const data = await res.json();
      console.log('📊 Wars API Response:', data);

      if (!data || !data.articles) {
        console.log('❌ No articles found in response');
        container.innerHTML = '<p>No wars articles found.</p>';
        return;
      }

      const articles = data.articles;
      console.log(`📄 Found ${articles.length} articles`);

      articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'news-card';
        articleCard.innerHTML = `
          <h3><a href="wars.html?id=${encodeURIComponent(article.id)}">${article.title}</a></h3>
          <p>${article.summary?.substring(0, 150) || ''}...</p>
          <div class="article-meta">
            <span class="source">${article.source}</span>
            <span class="date">${new Date(article.date).toLocaleDateString()}</span>
          </div>
        `;
        container.appendChild(articleCard);
      });

      page++;
      hasMore = page < data.pages;
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

  // Initial load
  loadWars();
}

// Load single war article by ID
async function loadSingleWar(warId) {
  try {
    console.log(`🌐 Fetching single war: https://the-terrific-proxy.onrender.com/api/wars/article?id=${warId}`);
    
    const res = await fetch(`https://the-terrific-proxy.onrender.com/api/wars/article?id=${warId}`);
    console.log(`📡 Response status: ${res.status}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const warData = await res.json();
    console.log('📊 Single war data:', warData);

    // Hide load more button for single article view
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }

    // Render full war article
    container.innerHTML = `
      <div class="single-article">
        ${warData.image ? `<img src="${warData.image}" alt="${warData.title}" class="article-image">` : ''}
        <h1>${warData.title}</h1>
        <div class="article-meta">
          <span class="source">${warData.source}</span>
          <span class="date">${new Date(warData.date).toLocaleDateString()}</span>
        </div>
        <div class="article-body">
          ${warData.body || warData.bodyText || warData.summary || 'No content available'}
        </div>
        ${warData.url ? `<a href="${warData.url}" target="_blank" class="original-link">View Original Article →</a>` : ''}
      </div>
    `;

  } catch (err) {
    console.error('❌ Error loading single war:', err);
    container.innerHTML = '<p>Error loading war article. Please try again.</p>';
  }
}

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
loadWars();
