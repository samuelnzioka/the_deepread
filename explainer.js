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
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading explainer...</p>
    </div>
  `;

  // Fetch full explainer data using ID - fetch from list and find by ID
  fetch('https://the-terrific-proxy.onrender.com/api/explainers?page=1')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Explainer API response:", data);
      
      // Find the explainer in the results array
      const explainers = data.results || data.explainers || [];
      const explainer = explainers.find(e => e.id === id);
      
      if (!explainer) {
        throw new Error(`Explainer with ID ${id} not found`);
      }
      
      console.log("Found explainer:", explainer);
      
      // Render explainer content
      explainerContainer.innerHTML = `
        <div class="explainer-content">
          ${explainer.image ? `<img src="${explainer.image}" alt="${explainer.title}" class="explainer-image">` : ''}
          <h1 class="explainer-title">${explainer.title}</h1>
          
          <div class="explainer-meta">
            <span class="source">${explainer.source || 'Unknown'}</span>
            <span class="published">${explainer.date ? new Date(explainer.date).toLocaleDateString() : 'Unknown date'}</span>
            ${explainer.url ? `<a href="${explainer.url}" target="_blank" class="original-link">View Original →</a>` : ''}
          </div>
          
          <div class="explainer-summary">
            <h2>Summary</h2>
            <p>${explainer.summary || 'No summary available'}</p>
          </div>
          
          <div class="explainer-body">
            <h2>Full Analysis</h2>
            ${explainer.body || explainer.background || 'No full analysis available'}
          </div>
        </div>
      `;
      
      // Apply theme after content loads
      setTimeout(() => {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const stored = localStorage.getItem('theme');
        const isDark = stored ? stored === 'dark' : prefersDark;
        document.body.classList.toggle('dark', isDark);
        
        // Update theme toggle button
        const themeBtn = document.querySelector('#themeToggleBtn, .theme-toggle-top');
        if (themeBtn) {
          const icon = isDark ? 'fa-sun' : 'fa-moon';
          const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
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
