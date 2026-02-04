// Handle war analysis page
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("War page loaded with ID:", id);

async function fetchAndRenderWar() {
  const warContainer = document.getElementById("analysis");
  
  if (!warContainer) {
    console.error("War container not found");
    return;
  }

  if (!id) {
    warContainer.innerHTML = `
      <div class="error-message">
        <h2>No war analysis data found</h2>
        <p>Please go back and select an article from the wars list.</p>
      </div>
    `;
    return;
  }

  // Show loading state
  warContainer.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading full analysis...
    </div>
  `;

  try {
    // Fetch full war content from API
    console.log("🔍 Fetching war from API with ID:", id);
    const response = await fetch(`https://the-terrific-proxy.onrender.com/api/wars/article?id=${encodeURIComponent(id)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const war = await response.json();
    console.log("📄 Full war data received:", war);

    // Render full war content
    warContainer.innerHTML = `
      <div class="explainer-content">
        <button class="go-back-btn" onclick="history.back()">
          <i class="fas fa-arrow-left"></i> Back to Wars List
        </button>
        
        ${war.image ? `<img src="${war.image}" alt="${war.title}" class="explainer-image">` : ''}
        <h1 class="explainer-title">${war.title || 'No title'}</h1>
        
        <div class="explainer-meta">
          <span class="source">${war.source || 'Unknown'}</span>
          <span class="published">${war.date ? new Date(war.date).toLocaleDateString() : 'Unknown date'}</span>
          ${war.url ? `<a href="${war.url}" target="_blank" class="original-link">View Original →</a>` : ''}
        </div>
        
        <div class="explainer-summary">
          <h2>Summary</h2>
          <p>${war.summary || 'No summary available'}</p>
        </div>
        
        <div class="explainer-body">
          <h2>Full Analysis</h2>
          <div class="explainer-content-text">
            ${war.body || war.bodyText || war.background || 'No full analysis content available'}
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('❌ Error loading war analysis:', error);
    warContainer.innerHTML = `
      <div class="error-message">
        <h2>Failed to Load Analysis</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Unable to load the war analysis content. Please try again later.</p>
        <div style="margin-top: 20px;">
          <button class="bubble-btn" onclick="location.reload()">
            <i class="fas fa-redo"></i> Try Again
          </button>
          <button class="bubble-btn" onclick="history.back()" style="margin-left: 10px;">
            <i class="fas fa-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    `;
  }
}

// Render when page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderWar();
});
