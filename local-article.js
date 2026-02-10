// Handle local article page
const params = new URLSearchParams(window.location.search);
const url = params.get("url");
const title = params.get("title");
const country = params.get("country");

console.log("Local article page loaded with:", { url, title, country });

async function fetchAndRenderLocalArticle() {
  const articleContainer = document.getElementById("local-article");
  
  if (!articleContainer) {
    console.error("Local article container not found");
    return;
  }

  if (!url) {
    articleContainer.innerHTML = `
      <div class="error-message">
        <h2>No article data found</h2>
        <p>Please go back and select an article from the local news list.</p>
      </div>
    `;
    return;
  }

  // Show loading state
  articleContainer.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading article...
    </div>
  `;

  try {
    // Since we don't have a full article API, we'll create a simple article view
    // with the information we have and link to the original source
    articleContainer.innerHTML = `
      <div class="explainer-content">
        <button class="go-back-btn" onclick="history.back()">
          <i class="fas fa-arrow-left"></i> Back to ${country ? getCountryName(country) : 'Local'} News
        </button>
        
        <h1 class="explainer-title">${title || 'Local News Article'}</h1>
        
        <div class="explainer-meta">
          <span class="source">${country ? getCountryName(country) : 'Local News'}</span>
          <span class="published">${new Date().toLocaleDateString()}</span>
        </div>
        
        <div class="explainer-summary">
          <h2>Article Summary</h2>
          <p>This is a local news article from ${country ? getCountryName(country) : 'the region'}.</p>
        </div>
        
        <div class="explainer-body">
          <h2>Read Full Article</h2>
          <div class="explainer-content-text">
            <p>To read the complete article, please visit the original source.</p>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${url}" target="_blank" class="read-full local-read-btn">
                <i class="fas fa-external-link-alt"></i> Read Full Article on Source Website →
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('❌ Error loading local article:', error);
    articleContainer.innerHTML = `
      <div class="error-message">
        <h2>Failed to Load Article</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Unable to load the local article content. Please try again later.</p>
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

function getCountryName(country) {
  const countryNames = {
    'kenya': 'Kenya',
    'south-africa': 'South Africa',
    'nigeria': 'Nigeria',
    'uganda': 'Uganda',
    'tanzania': 'Tanzania',
    'burkina-faso': 'Burkina Faso',
    'ethiopia': 'Ethiopia'
  };
  return countryNames[country] || country;
}

// Render when page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderLocalArticle();
});
