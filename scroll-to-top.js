// Return to Top Button - Works on all pages
(function() {
  // Create the button
  const returnToTopBtn = document.createElement('button');
  returnToTopBtn.className = 'return-to-top';
  returnToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  returnToTopBtn.setAttribute('aria-label', 'Return to top');
  returnToTopBtn.onclick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Add to page
  document.body.appendChild(returnToTopBtn);
  
  // Show/hide button based on scroll position
  function toggleReturnToTopButton() {
    if (window.scrollY > 300) {
      returnToTopBtn.classList.add('visible');
    } else {
      returnToTopBtn.classList.remove('visible');
    }
  }
  
  // Check scroll position
  window.addEventListener('scroll', toggleReturnToTopButton);
  
  // Initial check
  toggleReturnToTopButton();
})();
