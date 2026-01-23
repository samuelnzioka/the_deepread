// URL Rewriter for THE DEEPREAD
// Converts clean URLs to query parameters for existing pages

class URLRewriter {
  constructor() {
    this.init();
  }

  init() {
    // Check if we need to rewrite the URL
    this.rewriteCurrentURL();
    
    // Update all homepage links to use clean URLs
    this.updateHomepageLinks();
  }

  // Convert current clean URL to query parameters
  rewriteCurrentURL() {
    const path = window.location.pathname;
    const pathParts = path.replace(/^\/|\/$/g, '').split('/');

    if (pathParts.length >= 2) {
      const section = pathParts[0];
      const slug = pathParts[1];
      
      // Map sections to page files
      const sectionMap = {
        'explainers': 'explainer.html',
        'wars': 'wars.html',
        'sports': 'sports.html'
      };

      if (sectionMap[section]) {
        // Find the article by slug from API
        this.findArticleAndRedirect(section, slug, sectionMap[section]);
      }
    }
  }

  // Find article by slug and redirect with proper ID
  async findArticleAndRedirect(section, slug, targetPage) {
    try {
      const endpoint = this.getApiEndpoint(section);
      const response = await fetch(endpoint);
      const data = await response.json();
      
      const article = this.findArticleBySlug(data, slug);
      
      if (article) {
        // Redirect with proper ID and slug
        const newURL = `${targetPage}?id=${encodeURIComponent(article.id)}&slug=${encodeURIComponent(slug)}`;
        window.location.replace(newURL);
      }
    } catch (error) {
      console.error('Error finding article:', error);
    }
  }

  getApiEndpoint(section) {
    const endpoints = {
      'explainers': 'https://the-terrific-proxy.onrender.com/api/explainers',
      'wars': 'https://the-terrific-proxy.onrender.com/api/wars',
      'sports': 'https://the-terrific-proxy.onrender.com/api/sports'
    };
    return endpoints[section] || null;
  }

  findArticleBySlug(data, slug) {
    if (!data.articles || !Array.isArray(data.articles)) {
      return null;
    }
    
    for (const article of data.articles) {
      // Direct slug match
      if (article.slug === slug) {
        return article;
      }
      
      // ID match (fallback)
      if (article.id === slug) {
        return article;
      }
      
      // Title-based slug match
      const titleSlug = this.createSlugFromTitle(article.title);
      if (titleSlug === slug) {
        return article;
      }
    }
    
    return null;
  }

  createSlugFromTitle(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Update homepage links to use clean URLs
  updateHomepageLinks() {
    // This will be called from the individual trending scripts
    // to convert their links to clean URLs
  }

  // Convert internal links to clean URLs
  static createCleanURL(section, id, slug) {
    return `/${section}/${slug}`;
  }
}

// Initialize URL rewriter
window.URLRewriter = URLRewriter;
new URLRewriter();
