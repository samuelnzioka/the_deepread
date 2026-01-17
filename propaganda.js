const container = document.getElementById("videos");
const refreshBtn = document.getElementById("refreshVideos");

if (!container) {
  console.error("❌ #videos container not found");
}

/* SEARCH QUERY */
const QUERY =
  "information warfare geopolitics propaganda media manipulation";

let nextPageToken = null;
let loading = false;
let lastRefreshTime = Date.now();
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Add date filtering for recent content
const getRecentDateFilter = () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return sevenDaysAgo.toISOString();
};

/* =========================
   LOAD VIDEOS WITH DATE FILTERING
========================= */
async function loadVideos(reset = false) {
  if (loading) return;
  loading = true;

  if (reset) {
    container.innerHTML = "";
    nextPageToken = null;
  }

  let url =
    `https://the-terrific-proxy.onrender.com/api/youtube?q=${encodeURIComponent(QUERY)}`;

  if (nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  // Add date filter parameter for recent content
  url += `&publishedAfter=${getRecentDateFilter()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("YouTube API response:", data);

    // Debug each part of the condition
    console.log("data exists:", !!data);
    console.log("data.videos:", data.videos);
    console.log("data.videos is array:", Array.isArray(data.videos));
    console.log("data.videos length:", data.videos?.length);

    if (!data || !Array.isArray(data.videos) || data.videos.length === 0) {
      console.log("❌ Condition failed - showing 'No analysis videos found'");
      if (reset) {
        container.innerHTML = "<p>No analysis videos found.</p>";
      }
      loading = false;
      return;
    }

    console.log("✅ Condition passed - proceeding to render videos");

    nextPageToken = data.nextPageToken;

    console.log("🎬 Starting to render", data.videos.length, "videos");
    console.log("🎯 Container element:", container);

    // Create document fragment for efficient DOM manipulation
    const tempContainer = document.createDocumentFragment();
    
    data.videos.forEach((v, index) => {
      console.log(`📹 Rendering video ${index + 1}:`, v);
      
      const card = document.createElement("div");
      card.className = "explainer-card"; // Use exact same class as explainers
      
      // Add new-content class to first few videos for visual indicator
      if (reset && index < 3) {
        card.classList.add("new-content");
      }

      card.innerHTML = `
        ${v.thumbnail ? `<img src="${v.thumbnail}" alt="${v.title}">` : ""}
        <div class="explainer-body">
          <h3>${v.title}</h3>
          <p>${v.channel}</p>
          <div class="explainer-meta">
            <span class="source">YouTube</span>
            <span class="date">Video Analysis</span>
          </div>
          <button class="read-full-btn" onclick="playVideo('${v.videoId}', '${encodeURIComponent(v.title)}', '${encodeURIComponent(v.channel)}')">
            Watch Video →
          </button>
        </div>
      `;

      console.log(`📦 Created card for video ${index + 1}:`, card);
      tempContainer.appendChild(card);
    });

    // Prepend new content to TOP (newest first)
    if (reset) {
      container.innerHTML = '';
      lastRefreshTime = Date.now(); // Update refresh time on manual refresh
    }
    container.insertBefore(tempContainer, container.firstChild);

    console.log("🎉 All videos rendered. Container children count:", container.children.length);

  } catch (err) {
    console.error("❌ YouTube load error:", err);
    if (reset) {
      container.innerHTML =
        "<p>Failed to load propaganda analysis.</p>";
    }
  } finally {
    loading = false;
  }
}

/* =========================
   INFINITE SCROLL - LOAD MORE AT TOP
========================= */
const videosContainer = document.getElementById("videos");

videosContainer.addEventListener("scroll", () => {
  const atTop = videosContainer.scrollTop === 0;
  
  if (atTop && !loading && nextPageToken) {
    // Add some padding to trigger loading
    videosContainer.scrollTop = 50;
    loadVideos(); // Load more videos (older content)
  }
});

/* =========================
   REFRESH BUTTON
========================= */
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    loadVideos(true); // refresh from top
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   AUTO REFRESH EVERY 30 MINUTES
========================= */
function checkAndAutoRefresh() {
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  
  if (timeSinceLastRefresh >= REFRESH_INTERVAL) {
    console.log('🔄 Auto refreshing after 30 minutes...');
    loadVideos(true); // This will clear container and load fresh content
  }
}

// Check for auto-refresh every minute
setInterval(checkAndAutoRefresh, 60 * 1000); // Check every minute

/* =========================
   INITIAL LOAD
========================= */
loadVideos(true);

/* =========================
   VIDEO PLAYER FUNCTIONS
========================= */
function playVideo(videoId, title, channel) {
  const videosContainer = document.getElementById('videos');
  const mainContent = document.querySelector('.content');
  
  // Create video player interface
  const videoPlayerHTML = `
    <div class="video-player-container">
      <div class="video-player-header">
        <button class="back-to-videos-btn" onclick="backToVideos()">
          ← Back to Propaganda Videos
        </button>
      </div>
      <div class="video-player-content">
        <div class="video-wrapper">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            frameborder="0" 
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        </div>
        <div class="video-info">
          <h1>${decodeURIComponent(title)}</h1>
          <p class="video-channel">${decodeURIComponent(channel)}</p>
        </div>
      </div>
    </div>
  `;
  
  // Hide the videos grid and show video player
  videosContainer.style.display = 'none';
  
  // Insert video player after the header
  const header = mainContent.querySelector('.page-header');
  header.insertAdjacentHTML('afterend', videoPlayerHTML);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToVideos() {
  const videoPlayer = document.querySelector('.video-player-container');
  const videosContainer = document.getElementById('videos');
  
  // Remove video player
  if (videoPlayer) {
    videoPlayer.remove();
  }
  
  // Show videos grid again
  videosContainer.style.display = 'grid';
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
