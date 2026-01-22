const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("Explainer page loaded with ID:", id);

function renderExplainer() {
  const explainerContainer = document.getElementById("explainer");
  
  if (!explainerContainer) {
    console.error("Explainer container not found");
    return;
  }

  if (!id) {
    explainerContainer.innerHTML = `
      <div class="error-message">
        <h2>No explainer data found</h2>
        <p>Please go back and select an explainer from the list.</p>
      </div>
    `;
    return;
  }

  // Show loading state
  explainerContainer.innerHTML = `
    <div class="loading-message">
      <h2>Loading explainer...</h2>
      <p>Please wait while we fetch full analysis.</p>
    </div>
  `;
}

// Render when page loads
document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    try {
      // If we have an ID, fetch full explainer first
      if (id) {
        const res = await fetch(
          `https://the-terrific-proxy.onrender.com/api/explainers?page=1`
        );

        if (res.ok) {
          const data = await res.json();
          const explainers = data.explainers || data.results || [];
          console.log('Searching for explainer with ID:', id);
          console.log('Available explainers:', explainers.map(e => ({ id: e.id, title: e.title })));
          
          let explainer = null;
          for (let i = 0; i < explainers.length; i++) {
            if (explainers[i].id === id) {
              explainer = explainers[i];
              break;
            }
          }
          console.log('Found explainer:', explainer);
          
          if (explainer) {
            const title = explainer?.title || 'No title';
            const image = explainer?.image || '';
            const summary = explainer?.summary || '';
            const source = explainer?.source || 'Unknown';
            const published = explainer?.published || '';
            const url = explainer?.url || '';

            let body = '';
            if (explainer?.background || explainer?.happening || explainer?.globalImpact || explainer?.whyItMatters || explainer?.outlook) {
              body = `
                ${explainer?.background ? `<h2>Background</h2><p>${explainer.background}</p>` : ''}
                ${explainer?.happening ? `<h2>What's Happening</h2><p>${explainer.happening}</p>` : ''}
                ${explainer?.globalImpact ? `<h2>Global Impact</h2><p>${explainer.globalImpact}</p>` : ''}
                ${explainer?.whyItMatters ? `<h2>Why It Matters</h2><p>${explainer.whyItMatters}</p>` : ''}
                ${explainer?.outlook ? `<h2>What Comes Next</h2><p>${explainer.outlook}</p>` : ''}
              `;
            } else {
              body = explainer?.body || explainer?.bodyText || explainer?.content || explainer?.summary || '';
              if (body && !String(body).trim().startsWith('<')) {
                body = `<p>${body}</p>`;
              }
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
          } else {
            console.error('Explainer not found with ID:', id);
            explainerContainer.innerHTML = `
              <div class="error-message">
                <h2>Explainer not found</h2>
                <p>The requested explainer could not be found.</p>
              </div>
            `;
          }
        } else {
          console.error('Failed to fetch explainers:', res.status);
          explainerContainer.innerHTML = `
            <div class="error-message">
              <h2>Failed to load explainer</h2>
              <p>Please try again later.</p>
            </div>
          `;
        }
      } else {
        // No ID provided - show error
        renderExplainer();
      }
    } catch (err) {
      console.error('Failed to load explainer by id:', err);
      explainerContainer.innerHTML = `
        <div class="error-message">
          <h2>Error loading explainer</h2>
          <p>Please try again later.</p>
        </div>
      `;
    }
  })();
  
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
