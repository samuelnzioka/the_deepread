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
      console.log('❌ Response structure:', JSON.stringify(data, null, 2));
      if (page === 1) {
        container.innerHTML = "<p>No war analysis articles found.</p>";
      }
      hasMore = false;
      loading = false;
      return;
    }

    if (page === 1) {
      console.log("🧹 Clearing container for first load");
      container.innerHTML = "";
    }

    console.log(`📝 Processing ${data.articles.length} articles`);
    data.articles.forEach((a, index) => {
      console.log(`📰 Article ${index + 1}:`, a);
      
      const card = document.createElement("div");
      card.className = "explainer-card";

      card.innerHTML = `
        ${a.image ? `<img src="${a.image}" alt="${a.title}" />` : ""}
        <div class="explainer-content">
          <h3>${a.title}</h3>
          <p>${a.summary}</p>
          <a class="bubble-btn" href="war.html?id=${encodeURIComponent(a.id)}">
            Read Full Analysis
          </a>
        </div>
      `;

      console.log(`📦 Created card for article ${index + 1}:`, card);
      container.appendChild(card);
      console.log(`✅ Added card ${index + 1} to container`);
    });

    hasMore = data.hasMore;
    page++;
    console.log(`✅ Loaded ${data.articles.length} articles. Has more: ${hasMore}. Next page: ${page}`);
    console.log(`📊 Container now has ${container.children.length} children`);

  } catch (err) {
    console.error("❌ Error loading wars:", err);
    console.error("❌ Error details:", err.message);
    console.error("❌ Error stack:", err.stack);
    if (page === 1) {
      container.innerHTML = `<p>Failed to load war analysis articles: ${err.message}</p>`;
    }
  } finally {
    loading = false;
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
