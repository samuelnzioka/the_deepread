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

async function fetchAndRenderExplainer() {
  const explainerContainer = document.getElementById("explainer");
  
  if (!explainerContainer) {
    console.error("Explainer container not found");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  console.log("🔍 EXPLAINER PAGE DEBUG:");
  console.log("Full URL:", window.location.href);
  console.log("URL params:", Object.fromEntries(params.entries()));
  console.log("ID:", id);

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
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading full analysis...
    </div>
  `;

  try {
    // Try multiple possible endpoints to ensure we get the data (same as explainers.js)
    const possibleEndpoints = [
      `https://the-terrific-proxy.onrender.com/api/explainers/article?id=${encodeURIComponent(id)}`,
      `https://the-terrific-proxy.onrender.com/api/explainers?id=${encodeURIComponent(id)}`,
      `https://the-terrific-proxy.onrender.com/api/explainers/${encodeURIComponent(id)}`
    ];
    
    let endpointIndex = 0;
    let explainer = null;
    
    async function tryNextEndpoint() {
      if (endpointIndex >= possibleEndpoints.length) {
        throw new Error('All endpoints failed');
      }
      
      const currentEndpoint = possibleEndpoints[endpointIndex];
      console.log(`🔍 Trying endpoint ${endpointIndex + 1}/${possibleEndpoints.length}:`, currentEndpoint);
      
      const response = await fetch(currentEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }
      
      console.log(`📄 Full data received from endpoint ${endpointIndex + 1}:`, data);
      
      // Check for explainer data in different possible structures
      if (data.id && data.title) {
        explainer = data; // Direct explainer object
      } else if (data.explainer && data.explainer.id && data.explainer.title) {
        explainer = data.explainer; // Nested explainer object
      } else if (data.data && data.data.id && data.data.title) {
        explainer = data.data; // Data field
      } else if (data.article && data.article.id && data.article.title) {
        explainer = data.article; // Article field
      } else {
        throw new Error('Explainer data not found in response');
      }
      
      console.log('✅ Valid explainer data found:', {
        id: explainer.id,
        title: explainer.title,
        hasBody: !!explainer.body,
        bodyLength: explainer.body ? explainer.body.length : 0,
        hasContent: !!explainer.content,
        contentLength: explainer.content ? explainer.content.length : 0
      });
      
      // Ensure we have content to display
      if (!explainer.body && !explainer.content) {
        console.warn('⚠️ No body/content found, checking other fields...');
        explainer.body = explainer.text || explainer.description || explainer.full_content || '';
      }
      
      return explainer;
    }
    
    // Try endpoints sequentially
    for (endpointIndex = 0; endpointIndex < possibleEndpoints.length; endpointIndex++) {
      try {
        explainer = await tryNextEndpoint();
        break; // Success! Exit the loop
      } catch (error) {
        console.error(`❌ Endpoint ${endpointIndex + 1} failed:`, error);
        if (endpointIndex === possibleEndpoints.length - 1) {
          throw error; // All endpoints failed
        }
      }
    }
    
    if (!explainer) {
      throw new Error('No valid explainer data found');
    }

    // Render full explainer content
    explainerContainer.innerHTML = `
      <div class="explainer-content">
        ${explainer.image ? `<img src="${explainer.image}" alt="${explainer.title}" class="explainer-image">` : ''}
        <h1 class="explainer-title">${explainer.title || 'No title'}</h1>
        
        <div class="explainer-meta">
          <span class="source">${explainer.source || 'Unknown'}</span>
          <span class="published">${explainer.published ? new Date(explainer.published).toLocaleDateString() : 'Unknown date'}</span>
          ${explainer.url ? `<a href="${explainer.url}" target="_blank" class="original-link">View Original →</a>` : ''}
        </div>
        
        <div class="explainer-summary">
          <h2>Summary</h2>
          <p>${explainer.summary || 'No summary available'}</p>
        </div>
        
        <div class="explainer-body">
          <h2>Full Analysis</h2>
          <div class="explainer-content-text">
            ${(() => {
              // Try multiple possible content fields
              const content = explainer.body || explainer.content || explainer.text || explainer.description || explainer.full_content || '';
              
              if (!content || content.trim().length === 0) {
                return '<p><em>No full analysis content available for this explainer.</em></p>';
              }
              
              // Check if content looks like HTML and render accordingly
              if (content.includes('<p>') || content.includes('<div>') || content.includes('<h1>') || content.includes('<h2>')) {
                return content; // Render as HTML
              } else {
                // Convert plain text to HTML with proper formatting
                return content.split('\n\n').map(paragraph => 
                  paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                ).join('');
              }
            })()}
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('❌ Error loading explainer:', error);
    explainerContainer.innerHTML = `
      <div class="error-message">
        <h2>Failed to Load Analysis</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Unable to load the explainer content. Please try again later.</p>
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
  fetchAndRenderExplainer();
  
  // Add go back functionality
  const goBackBtn = document.getElementById("goBackBtn");
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
});
