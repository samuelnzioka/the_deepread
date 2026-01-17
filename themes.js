// Global Theme System - Works Across All Pages
(function() {
    // Theme toggle button selector (works on any page)
    const themeSelectors = [
        '#themeToggleBtn',
        '.theme-toggle-top',
        '[aria-label*="theme"]',
        'button[class*="theme"]'
    ].join(',');

    // Initialize theme on page load
    function initTheme() {
        const btn = document.querySelector(themeSelectors);
        if (!btn) return;

        // Check for saved theme or system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const stored = localStorage.getItem('theme');
        const initialDark = stored ? stored === 'dark' : prefersDark;

        // Apply initial theme
        document.body.classList.toggle('dark', initialDark);
        updateButton(btn, initialDark);

        // Add click handler
        btn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateButton(btn, isDark);
        });
    }

    // Update button appearance
    function updateButton(btn, isDark) {
        const icon = isDark ? 'fa-sun' : 'fa-moon';
        const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        
        btn.innerHTML = `<i class="fas ${icon}"></i>`;
        btn.setAttribute('aria-label', label);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
