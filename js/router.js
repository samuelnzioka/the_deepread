// Dynamic Router for THE DEEPREAD
// Handles clean URLs like /explainers/:slug, /wars/:slug, /sports/:slug

class ArticleRouter {
    constructor() {
        this.currentSection = null;
        this.currentSlug = null;
        this.articleData = null;
    }

    // Parse current URL to extract section and slug
    parseCurrentUrl() {
        const path = window.location.pathname;
        console.log('🔍 Parsing URL path:', path);
        
        // Remove leading/trailing slashes and split
        const pathParts = path.replace(/^\/|\/$/g, '').split('/');
        
        if (pathParts.length >= 2) {
            this.currentSection = pathParts[0];
            this.currentSlug = pathParts[1];
            
            console.log('📋 Parsed:', {
                section: this.currentSection,
                slug: this.currentSlug
            });
            
            return true;
        }
        
        return false;
    }

    // Get API endpoint based on section
    getApiEndpoint(section, slug) {
        const endpoints = {
            'explainers': `https://the-terrific-proxy.onrender.com/api/explainers`,
            'wars': `https://the-terrific-proxy.onrender.com/api/wars`,
            'sports': `https://the-terrific-proxy.onrender.com/api/sports`
        };
        
        return endpoints[section] || null;
    }

    // Find article by slug in API response
    findArticleBySlug(data, slug) {
        if (!data.articles || !Array.isArray(data.articles)) {
            return null;
        }
        
        // Try multiple matching strategies
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

    // Create slug from title (for matching)
    createSlugFromTitle(title) {
        if (!title) return '';
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Fetch article data
    async fetchArticle(section, slug) {
        try {
            const endpoint = this.getApiEndpoint(section, slug);
            if (!endpoint) {
                throw new Error(`Unknown section: ${section}`);
            }
            
            console.log('🌐 Fetching from:', endpoint);
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 API response:', data);
            
            const article = this.findArticleBySlug(data, slug);
            
            if (!article) {
                throw new Error(`Article not found: ${slug}`);
            }
            
            return article;
            
        } catch (error) {
            console.error('❌ Error fetching article:', error);
            throw error;
        }
    }

    // Render article on page
    renderArticle(article) {
        console.log('🎨 Rendering article:', article);
        
        // Update page title
        document.title = `${article.title} - THE DEEPREAD`;
        document.getElementById('page-title').textContent = article.title;
        
        // Update breadcrumb
        const sectionName = this.currentSection.charAt(0).toUpperCase() + this.currentSection.slice(1);
        document.getElementById('breadcrumb-section').textContent = sectionName;
        document.getElementById('breadcrumb-title').textContent = article.title;
        
        // Update article content
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-source').textContent = article.source || 'Unknown';
        document.getElementById('article-date').textContent = new Date(article.date || Date.now()).toLocaleDateString();
        document.getElementById('article-section').textContent = sectionName.toUpperCase();
        
        // Update image
        const imageContainer = document.getElementById('article-image-container');
        const articleImage = document.getElementById('article-image');
        
        if (article.image) {
            articleImage.src = article.image;
            articleImage.alt = article.title;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }
        
        // Update body content
        const articleBody = document.getElementById('article-body');
        articleBody.innerHTML = article.body || article.summary || 'No content available';
        
        // Update original link
        const originalLink = document.getElementById('original-link');
        if (article.url) {
            originalLink.href = article.url;
            originalLink.style.display = 'inline-flex';
        } else {
            originalLink.style.display = 'none';
        }
        
        // Hide loading, show article
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('article-content').style.display = 'block';
        
        // Store article data
        this.articleData = article;
        
        // Load related articles
        this.loadRelatedArticles();
    }

    // Show error state
    showError(error) {
        console.error('❌ Showing error state:', error);
        
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('article-content').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
    }

    // Load related articles
    async loadRelatedArticles() {
        try {
            const endpoint = this.getApiEndpoint(this.currentSection, this.currentSlug);
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.articles && data.articles.length > 1) {
                // Filter out current article and show up to 3 related
                const related = data.articles
                    .filter(article => article.id !== this.articleData.id)
                    .slice(0, 3);
                
                if (related.length > 0) {
                    this.renderRelatedArticles(related);
                }
            }
        } catch (error) {
            console.log('📝 Could not load related articles:', error);
        }
    }

    // Render related articles
    renderRelatedArticles(articles) {
        const relatedGrid = document.getElementById('related-grid');
        relatedGrid.innerHTML = '';
        
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'news-card';
            
            const slug = article.slug || this.createSlugFromTitle(article.title);
            const articleUrl = `/${this.currentSection}/${slug}`;
            
            articleCard.innerHTML = `
                ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
                <div class="card-content">
                    <h3><a href="${articleUrl}">${article.title}</a></h3>
                    <p>${article.summary?.substring(0, 150) || ''}...</p>
                    <div class="card-meta">
                        <span class="source">${article.source}</span>
                        <span class="date">${new Date(article.date).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
            
            relatedGrid.appendChild(articleCard);
        });
        
        document.getElementById('related-articles').style.display = 'block';
    }

    // Initialize router
    async init() {
        console.log('🚀 Initializing Article Router');
        
        // Parse current URL
        if (!this.parseCurrentUrl()) {
            console.error('❌ Invalid URL format');
            this.showError(new Error('Invalid URL format'));
            return;
        }
        
        // Validate section
        const validSections = ['explainers', 'wars', 'sports'];
        if (!validSections.includes(this.currentSection)) {
            console.error('❌ Invalid section:', this.currentSection);
            this.showError(new Error(`Invalid section: ${this.currentSection}`));
            return;
        }
        
        try {
            // Fetch and render article
            const article = await this.fetchArticle(this.currentSection, this.currentSlug);
            this.renderArticle(article);
            
        } catch (error) {
            console.error('❌ Failed to load article:', error);
            this.showError(error);
        }
    }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const router = new ArticleRouter();
    router.init();
});

// Export for use in other files
window.ArticleRouter = ArticleRouter;
