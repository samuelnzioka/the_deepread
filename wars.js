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
          <a class="bubble-btn" href="war.html?id=${encodeURIComponent(article.id)}">
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
loadWars();
