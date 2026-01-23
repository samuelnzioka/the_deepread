// URL Cleaner for THE DEEPREAD
// Cleans up messy URLs in the browser

class URLCleaner {
  constructor() {
    this.init();
  }

  init() {
    // Clean the URL after page loads
    this.cleanCurrentURL();
  }

  cleanCurrentURL() {
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    
    // Check if this is a messy URL with lots of parameters
    if (this.isMessyURL(url)) {
      // Extract the essential info and create a clean URL
      const cleanURL = this.createCleanURL(url);
      
      // Update browser URL without reloading the page
      if (cleanURL && cleanURL !== currentURL) {
        window.history.replaceState({}, '', cleanURL);
        console.log('🧹 Cleaned URL:', cleanURL);
      }
    }
  }

  isMessyURL(url) {
    // Check if URL has too many parameters (indicating messy data)
    const params = url.searchParams;
    const paramCount = Array.from(params.keys()).length;
    
    // If we have more than 2 parameters, it's probably messy
    return paramCount > 2;
  }

  createCleanURL(url) {
    const params = url.searchParams;
    const pathname = url.pathname;
    
    // Get the essential parameters
    const id = params.get('id');
    const title = params.get('title');
    
    if (!id) return null;
    
    // Create a slug from title if available
    let slug = '';
    if (title) {
      slug = this.createSlugFromTitle(decodeURIComponent(title));
    }
    
    // Determine the section from pathname
    let section = '';
    if (pathname.includes('explainer')) {
      section = 'explainers';
    } else if (pathname.includes('wars')) {
      section = 'wars';
    } else if (pathname.includes('sports')) {
      section = 'sports';
    }
    
    if (!section) return null;
    
    // Create clean URL
    const cleanURL = `/${section}/${slug || id}`;
    return cleanURL;
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
}

// Initialize URL cleaner
window.URLCleaner = URLCleaner;
new URLCleaner();
