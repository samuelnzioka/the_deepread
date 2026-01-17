console.log("Sport article JS loaded");

const articleContainer = document.getElementById("sport-article");
const goBackBtn = document.getElementById("goBackBtn");

console.log("Sport article DOM elements found:", {
  articleContainer: !!articleContainer,
  goBackBtn: !!goBackBtn
});

// Load article from localStorage
function loadSportArticle() {
  const article = JSON.parse(localStorage.getItem("currentSportArticle"));
  
  if (!article) {
    articleContainer.innerHTML = `
      <div class="explainer-content">
        <h2>Article Not Found</h2>
        <p>No article data available.</p>
      </div>
    `;
    return;
  }

  console.log("📖 Loading article:", article);

  // Render full article content
  articleContainer.innerHTML = `
    <div class="explainer-content">
      ${article.image ? `<img src="${article.image}" class="explainer-image" alt="${article.title}">` : ""}
      <h1 class="explainer-title">${article.title}</h1>
      <div class="explainer-meta">
        <span class="source">Source: ${article.source}</span>
        <a href="${article.url}" class="original-link" target="_blank">View Original Article</a>
      </div>
      <div class="explainer-body">
        <p>${article.body}</p>
      </div>
    </div>
  `;
}

// Go back to sports page with scroll position restoration
goBackBtn?.addEventListener("click", () => {
  // Use browser back button to preserve scroll position
  window.history.back();
});

// Load article when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (articleContainer) {
    console.log('🏆 Loading sport article from localStorage...');
    loadSportArticle();
  }
});
