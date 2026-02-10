// Local News functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load Kenya news by default
    loadLocalNews('kenya');
});

let currentCountry = 'kenya';
let isLoading = false;

async function loadLocalNews(country) {
    if (isLoading) return;
    
    isLoading = true;
    currentCountry = country;
    
    // Update active tab
    document.querySelectorAll('.local-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const container = document.getElementById('local-news-container');
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> Loading ${getCountryName(country)} news...
        </div>
    `;
    
    try {
        // Use the correct API endpoint from server.js
        const response = await fetch(`https://the-terrific-proxy.onrender.com/api/local-news/${country}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const articles = await response.json();
        console.log(`📄 ${country} news data:`, articles);
        
        renderLocalNews(articles, country);
        
    } catch (error) {
        console.error(`❌ Error loading ${country} news:`, error);
        container.innerHTML = `
            <div class="error-message">
                <h2>Unable to Load ${getCountryName(country)} News</h2>
                <p>Could not fetch the latest news. Please try again later.</p>
                <div style="margin-top: 20px;">
                    <button class="bubble-btn" onclick="loadLocalNews('${country}')">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        `;
    } finally {
        isLoading = false;
    }
}

function renderLocalNews(articles, country) {
    const container = document.getElementById('local-news-container');
    
    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div class="no-content">
                <h2>No ${getCountryName(country)} News Available</h2>
                <p>No articles found at the moment. Please check back later.</p>
            </div>
        `;
        return;
    }
    
    let html = `<div class="local-news-grid">`;
    
    articles.forEach(article => {
        const title = article.title || 'No title';
        const summary = article.summary || 'No summary available';
        const image = article.image || null;
        const url = article.link || '#';
        const source = getCountryName(country);
        const published = new Date().toISOString(); // Since API doesn't provide date
        
        html += `
            <article class="local-news-card">
                ${image ? `<img src="${image}" alt="${title}" class="local-news-image">` : ''}
                <div class="local-news-content">
                    <h3 class="local-news-title">${title}</h3>
                    <p class="local-news-summary">${summary}</p>
                    <div class="local-news-meta">
                        <span class="source">${source}</span>
                        <span class="published">${formatDate(published)}</span>
                    </div>
                    <a href="${url}" target="_blank" class="read-more-btn">
                        Read Full Article →
                    </a>
                </div>
            </article>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
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

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Unknown date';
    }
}
