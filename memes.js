console.log("memes.js loaded");

const API_URL = "https://the-terrific-proxy.onrender.com/api/memes";
const memesContainer = document.getElementById("memes-feed");
const refreshBtn = document.querySelector("button[onclick='loadMemes(true)']");

let afterCursor = null;
let isLoading = false;
let newestMemeTimestamp = null;

/* =========================
   MEME MODAL
========================= */
function openMemeModal(imageSrc, title) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'meme-modal-overlay';
  modal.innerHTML = `
    <div class="meme-modal-content">
      <button class="meme-modal-close" onclick="closeMemeModal()">
        <i class="fas fa-times"></i>
      </button>
      <img src="${imageSrc}" alt="${title}" class="meme-modal-image">
    </div>
  `;
  
  // Add to body
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeMemeModal();
    }
  });
  
  // Close on ESC key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeMemeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function closeMemeModal() {
  const modal = document.querySelector('.meme-modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

/* =========================
   LOAD MEMES
========================= */
async function loadMemes(reset = false, prepend = false) {
  if (isLoading) return;
  isLoading = true;

  if (reset) {
    memesContainer.innerHTML = "";
    afterCursor = null;
    newestMemeTimestamp = null;
  }

  try {
    console.log("Fetching memes...");
    let url;
    
    if (prepend) {
      // For refresh, get fresh memes from the top
      url = API_URL;
    } else {
      // For regular loading, use pagination
      url = afterCursor
        ? `${API_URL}?after=${afterCursor}`
        : API_URL;
    }

    const res = await fetch(url);
    const data = await res.json();

    console.log("Memes received:", data);

    if (!Array.isArray(data.memes)) {
      throw new Error("Invalid memes format");
    }

    data.memes.forEach(meme => {
      const card = document.createElement("div");
      card.className = prepend ? "meme-card new-content" : "meme-card";

      card.innerHTML = prepend ? `
        <div class="new-badge">🆕 NEW</div>
        <img src="${meme.image}" alt="Meme" onclick="openMemeModal('${meme.image}', '${meme.title.replace(/'/g, "\\'")}')">
        <h3>${meme.title}</h3>
        <div class="context">${meme.subreddit}</div>
        <div class="meme-share">
          <button class="share-btn" onclick="openShareMenu('${meme.image}', '${meme.title}', '${meme.permalink}')">
            <i class="fas fa-share-alt"></i> Share
          </button>
          <div class="share-menu" id="share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}">
            <button onclick="shareToWhatsApp('${meme.image}', '${meme.title}', '${meme.permalink}')">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
            <button onclick="shareToFacebook('${meme.image}', '${meme.title}', '${meme.permalink}')">
              <i class="fab fa-facebook"></i> Facebook
            </button>
            <button onclick="shareToX('${meme.image}', '${meme.title}', '${meme.permalink}')">
              <i class="fab fa-x-twitter"></i> X
            </button>
            <button onclick="shareToInstagram('${meme.image}', '${meme.title}')">
              <i class="fab fa-instagram"></i> Instagram
            </button>
            <button onclick="shareToTikTok('${meme.image}', '${meme.title}')">
              <i class="fab fa-tiktok"></i> TikTok
            </button>
            <button onclick="copyLink('${meme.permalink}')">
              <i class="fas fa-link"></i> Copy Link
            </button>
          </div>
        </div>
      ` : `
        <img src="${meme.image}" alt="Meme" onclick="openMemeModal('${meme.image}', '${meme.title.replace(/'/g, "\\'")}')">
        <h3>${meme.title}</h3>
        <div class="context">${meme.subreddit}</div>
        <div class="meme-share">
          <button class="share-btn" onclick="openShareMenu('${meme.image}', '${meme.title}', '${meme.permalink}')">
            <i class="fas fa-share-alt"></i> Share
          </button>
          <div class="share-menu" id="share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}">
            <button onclick="shareToWhatsApp('${meme.image}', '${meme.title}', '${meme.permalink}')">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
            <button onclick="shareToFacebook('${meme.image}', '${meme.title}', '${meme.permalink}')">
              <i class="fab fa-facebook"></i> Facebook
            </button>
            <button onclick="shareToX('${meme.image}', '${meme.title}', '${meme.permalink}')">
              <i class="fab fa-x-twitter"></i> X
            </button>
            <button onclick="shareToInstagram('${meme.image}', '${meme.title}')">
              <i class="fab fa-instagram"></i> Instagram
            </button>
            <button onclick="shareToTikTok('${meme.image}', '${meme.title}')">
              <i class="fab fa-tiktok"></i> TikTok
            </button>
            <button onclick="copyLink('${meme.permalink}')">
              <i class="fas fa-link"></i> Copy Link
            </button>
          </div>
        </div>
      `;

      if (prepend) {
        memesContainer.prepend(card);
      } else {
        memesContainer.appendChild(card);
      }
    });

    // Only update cursor for regular loading, not refresh
    if (!prepend) {
      afterCursor = data.after || null;
    }

  } catch (err) {
    console.error("Failed to load memes:", err);
    memesContainer.innerHTML += `<p class="error-message">Failed to load memes.</p>`;
  } finally {
    isLoading = false;
  }
}

/* =========================
   INFINITE SCROLL
========================= */
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 300
  ) {
    loadMemes();
  }
});

/* =========================
   REFRESH BUTTON
========================= */
if (refreshBtn) {
  refreshBtn.removeAttribute('onclick'); // Remove inline onclick
  refreshBtn.addEventListener("click", async () => {
    // Load fresh memes and prepend them to the top
    await loadMemes(false, true);
    
    // Scroll to top to show new content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================
   SHARE FUNCTIONS
========================= */
function openShareMenu(image, title, permalink) {
  // Close all other share menus
  document.querySelectorAll('.share-menu').forEach(menu => {
    menu.style.display = 'none';
  });
  
  // Find the share menu for this card
  event.target.nextElementSibling.style.display = 
    event.target.nextElementSibling.style.display === 'block' ? 'none' : 'block';
}

function shareToWhatsApp(image, title, permalink) {
  const text = `Check out this meme: ${title} - ${permalink}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareToFacebook(image, title, permalink) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(permalink)}`, '_blank');
}

function shareToX(image, title, permalink) {
  const text = `Check out this meme: ${title}`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(permalink)}`, '_blank');
}

function shareToInstagram(image, title) {
  // Instagram doesn't support direct sharing, so we copy the text and open Instagram
  const text = `Check out this meme: ${title}`;
  navigator.clipboard.writeText(text);
  alert('Text copied! Open Instagram and paste in your story or post.');
  window.open('https://www.instagram.com', '_blank');
}

function shareToTikTok(image, title) {
  // TikTok doesn't support direct sharing, so we copy the text and open TikTok
  const text = `Check out this meme: ${title}`;
  navigator.clipboard.writeText(text);
  alert('Text copied! Open TikTok and paste in your video description.');
  window.open('https://www.tiktok.com', '_blank');
}

function copyLink(permalink) {
  navigator.clipboard.writeText(permalink).then(() => {
    // Show success message
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.style.background = '#27ae60';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
    }, 2000);
  });
}

// Close share menus when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.meme-share')) {
    document.querySelectorAll('.share-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});

/* =========================
   INITIAL LOAD
========================= */
loadMemes();
