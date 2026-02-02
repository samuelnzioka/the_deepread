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

  // Show what we received
  explainerContainer.innerHTML = `
    <div class="debug-info" style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <h3>DEBUG INFO:</h3>
      <p><strong>ID:</strong> ${id}</p>
      <p><strong>Title:</strong> ${title || 'MISSING'}</p>
      <p><strong>Body length:</strong> ${body ? body.length : 0}</p>
      <p><strong>Has body:</strong> ${!!body}</p>
      <p><strong>Source:</strong> ${source || 'MISSING'}</p>
      <details>
        <summary>Full body content</summary>
        <pre style="white-space: pre-wrap; max-height: 200px; overflow-y: auto;">${body || 'NO BODY CONTENT'}</pre>
      </details>
    </div>
    
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
          themeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
          themeBtn.setAttribute('aria-label', label);
          
          themeBtn.onclick = () => {
            const newDark = !document.body.classList.contains('dark');
            document.body.classList.toggle('dark', newDark);
            localStorage.setItem('theme', newDark ? 'dark' : 'light');
            
            const newIcon = newDark ? 'fa-sun' : 'fa-moon';
            const newLabel = newDark ? 'Switch to light mode' : 'Switch to dark mode';
            themeBtn.innerHTML = `<i class="fas ${newIcon}"></i>`;
            themeBtn.setAttribute('aria-label', newLabel);
          };
        }
      }, 100);
    })
    .catch(err => {
      console.error('Error fetching explainer:', err);
      explainerContainer.innerHTML = `
        <div class="error-message">
          <h2>Error loading explainer</h2>
          <p>Could not load the explainer. Please try again.</p>
        </div>
      `;
    });
}

// Render when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderExplainer();
  
  // Ensure theme is properly applied after rendering
  setTimeout(() => {
    // Direct theme re-initialization
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : prefersDark;
    
    // Apply theme to body
    document.body.classList.toggle('dark', isDark);
    
    // Update theme toggle button
    const themeBtn = document.querySelector('#themeToggleBtn, .theme-toggle-top');
    if (themeBtn) {
      const icon = isDark ? 'fa-sun' : 'fa-moon';
      const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      themeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
      themeBtn.setAttribute('aria-label', label);
      
      // Ensure click handler works
      themeBtn.onclick = () => {
        const newDark = !document.body.classList.contains('dark');
        document.body.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
        
        const newIcon = newDark ? 'fa-sun' : 'fa-moon';
        const newLabel = newDark ? 'Switch to light mode' : 'Switch to dark mode';
        themeBtn.innerHTML = `<i class="fas ${newIcon}"></i>`;
        themeBtn.setAttribute('aria-label', newLabel);
      };
    }
  }, 100);
  
  // Add go back functionality
  const goBackBtn = document.getElementById("goBackBtn");
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
