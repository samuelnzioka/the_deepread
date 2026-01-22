const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let title = decodeURIComponent(params.get("title") || "");
let image = params.get("image");
let summary = decodeURIComponent(params.get("summary") || "");
let body = decodeURIComponent(params.get("body") || "");
let source = decodeURIComponent(params.get("source") || "");
let published = params.get("published");
let url = decodeURIComponent(params.get("url") || "");

console.log("Explainer page loaded with params:", { id, title, image, summary, body, source, published, url });

function renderExplainer() {
  const explainerContainer = document.getElementById("explainer");
  
  if (!explainerContainer) {
    console.error("Explainer container not found");
    return;
  }

  if (!title && !id) {
    explainerContainer.innerHTML = `
      <div class="error-message">
        <h2>No explainer data found</h2>
        <p>Please go back and select an explainer from the list.</p>
      </div>
    `;
    return;
  }

  // Render explainer content
  explainerContainer.innerHTML = `
    <div class="explainer-content">
      ${image ? `<img src="${image}" alt="${title}" class="explainer-image">` : ''}
      <h1 class="explainer-title">${title}</h1>
      
      <div class="explainer-meta">
        <span class="source">${source}</span>
        <span class="published">${published ? new Date(published).toLocaleDateString() : 'Unknown date'}</span>
        ${url ? `<a href="${url}" target="_blank" class="original-link">View Original →</a>` : ''}
      </div>
      
      <div class="explainer-summary">
        <h2>Summary</h2>
        <p>${summary || 'No summary available'}</p>
      </div>
      
      <div class="explainer-body">
        <h2>Full Analysis</h2>
        ${body || 'No full analysis available'}
      </div>
    </div>
  `;
}

// Render when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderExplainer();
  
  // Add go back functionality
  const goBackBtn = document.getElementById('goBackBtn');
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      // Use browser back button to preserve scroll position
      window.history.back();
    });
  }
  
  // Also handle browser back button
  window.addEventListener('popstate', (event) => {
    // If user clicks back button, go to explainers
    if (window.location.pathname.includes('explainer.html')) {
      window.location.href = 'explainers.html';
    }
  });
  
  // Push state to enable back button functionality
  if (window.location.pathname.includes('explainer.html')) {
    history.pushState({ page: 'explainer' }, '', window.location.href);
  }
});
