// Handle both clean URLs with slugs and old URLs with ID parameters
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Extract slug from URL path for clean URLs
const pathParts = window.location.pathname.split('/');
const slug = pathParts[pathParts.length - 1];

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

console.log("Explainer page loaded with ID:", id);
console.log("Explainer page loaded with slug:", slug);
console.log("Full URL path:", window.location.pathname);

function renderExplainer() {
  const explainerContainer = document.getElementById("explainer");
  
  if (!explainerContainer) {
    console.error("Explainer container not found");
    return;
  }

  // Get all data from URL parameters
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const title = params.get("title");
  const image = params.get("image");
  const summary = params.get("summary");
  const body = params.get("body");
  const source = params.get("source");
  const published = params.get("published");
  const url = params.get("url");

  console.log("🔍 EXPLAINER PAGE DEBUG:");
  console.log("Full URL:", window.location.href);
  console.log("URL params:", Object.fromEntries(params.entries()));
  console.log("ID:", id);
  console.log("Title:", title);
  console.log("Body length:", body ? body.length : 0);
  console.log("Has body:", !!body);

  if (!id) {
    explainerContainer.innerHTML = `
      <div class="error-message">
        <h2>No explainer data found</h2>
        <p>Please go back and select an explainer from the list.</p>
      </div>
    `;
    return;
  }

  // Render explainer content directly from URL parameters
  explainerContainer.innerHTML = `
    <div class="explainer-content">
      ${image ? `<img src="${image}" alt="${title}" class="explainer-image">` : ''}
      <h1 class="explainer-title">${title || 'No title'}</h1>
      
      <div class="explainer-meta">
        <span class="source">${source || 'Unknown'}</span>
        <span class="published">${published ? new Date(published).toLocaleDateString() : 'Unknown date'}</span>
        ${url ? `<a href="${url}" target="_blank" class="original-link">View Original →</a>` : ''}
      </div>
      
      <div class="explainer-summary">
        <h2>Summary</h2>
        <p>${summary || 'No summary available'}</p>
      </div>
      
      <div class="explainer-body">
        <h2>Full Analysis</h2>
        <div class="explainer-content-text">
          ${body || 'No full analysis content available'}
        </div>
      </div>
    </div>
  `;
}

// Render when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderExplainer();
  
  // Add go back functionality
  const goBackBtn = document.getElementById("goBackBtn");
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
});
