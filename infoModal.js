const modal = document.getElementById("infoModal");
const titleBox = document.getElementById("infoTitle");
const contentBox = document.getElementById("infoContent");
const closeBtn = document.querySelector(".close-info");

console.log('🔧 Modal elements found:', {
  modal: !!modal,
  titleBox: !!titleBox,
  contentBox: !!contentBox,
  closeBtn: !!closeBtn
});

if (modal) {
  document.addEventListener("click", e => {
    const link = e.target.closest("[data-info]");
    if (!link) return;

    e.preventDefault();
    console.log('🔗 Footer link clicked:', link.dataset.info);

    const type = link.dataset.info;
    openInfo(type);
  });

  closeBtn.addEventListener("click", closeInfo);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeInfo();
  });
}

function openInfo(type) {
  console.log('🚪 Opening modal for:', type);
  const content = getContent(type);

  titleBox.textContent = content.title;
  contentBox.innerHTML = content.body;

  modal.classList.remove("hidden");
  console.log('✅ Modal opened, classes:', modal.className);
}

function closeInfo() {
  console.log('❌ Closing modal');
  modal.classList.add("hidden");
}

function getContent(type) {
  console.log('📋 Getting content for type:', type);
  switch (type) {
    case "about":
      return {
        title: "About The DeepRead",
        body: `
          <p><strong>The DeepRead</strong> is an independent informational and analytical media platform designed to present news summaries, explainers, commentary, and multimedia content relating to geopolitics, propaganda, warfare, international relations, and information influence. All materials published here are intended strictly for educational, journalistic, and research purposes and should not be interpreted as professional, legal, political, or military advice. While we strive to ensure accuracy, timeliness, and reliability of information displayed, we do not guarantee that all content is complete, current, or free from errors, and we disclaim any liability for decisions made based on use of this information. Some content displayed on this site may originate from third-party sources, including external news organizations, video platforms, and public APIs, and all intellectual property rights remain with their respective owners; platform does not claim ownership of such third-party material and uses it in accordance with fair use principles for purposes of commentary, criticism, and education.</p>
        `
      };

    case "terms":
      return {
        title: "Terms of Use",
        body: `
          <p>By accessing and using this website, you agree to comply with and be bound by these Terms of Use, which govern your interaction with all content, features, and services provided on this platform. This website is an independent informational and analytical media platform designed to present news summaries, explainers, commentary, and multimedia content relating to geopolitics, propaganda, warfare, international relations, and information influence. All materials published here are intended strictly for educational, journalistic, and research purposes and should not be interpreted as professional, legal, political, or military advice. While we strive to ensure accuracy, timeliness, and reliability of information displayed, we do not guarantee that all content is complete, current, or free from errors, and we disclaim any liability for decisions made based on use of this information. Some content displayed on this site may originate from third-party sources, including external news organizations, video platforms, and public APIs, and all intellectual property rights remain with their respective owners; platform does not claim ownership of such third-party material and uses it in accordance with fair use principles for purposes of commentary, criticism, and education. Users agree not to reproduce, redistribute, scrape, manipulate, or commercially exploit any content from this site without prior written permission, and further agree not to use platform in any way that may disrupt its functionality, compromise its security, or infringe upon the rights of other users or content providers. We reserve the right to modify, suspend, or discontinue any aspect of website at any time without prior notice, and to update these Terms of Use as necessary; continued use of the site following such changes constitutes acceptance of the revised terms. By using this platform, you acknowledge that all engagement with its content is voluntary and at your own discretion, and you accept full responsibility for how you interpret and apply information provided herein.</p>
        `
      };

    case "privacy":
      return {
        title: "Privacy Policy",
        body: `
          <p><strong>Privacy Policy for The DeepRead</strong></p>
          <p>Your privacy matters to us. This policy explains how The Terrific handles your information and protects your rights when using our independent informational and analytical media platform.</p>
          
          <h3>Information We Collect</h3>
          <p>We may collect basic technical data such as browser type, device, and anonymous usage statistics to improve our platform. No personal information is collected without your explicit consent.</p>
          
          <h3>Personal Data</h3>
          <p>We do not sell, trade, or rent users' personal information. Any information you voluntarily provide (e.g., via contact forms) is used only for communication purposes and is stored securely with appropriate safeguards.</p>
          
          <h3>Cookies and Local Storage</h3>
          <p>We may use cookies and local storage to enhance user experience, such as remembering theme preferences (dark/light mode). No tracking cookies are used beyond essential functionality.</p>
          
          <h3>Third-Party Content</h3>
          <p>Our site may display content from external platforms (YouTube, news APIs, Reddit, etc.). These services have their own privacy policies, and we are not responsible for their data collection practices.</p>
          
          <h3>Data Security</h3>
          <p>We take reasonable measures to protect your information, but no system is 100% secure. We implement appropriate technical and organizational measures to safeguard collected data.</p>
          
          <h3>Your Rights</h3>
          <p>You have the right to access, modify, or delete your personal information. You may also opt-out of non-essential data collection at any time.</p>
          
          <h3>Policy Updates</h3>
          <p>This privacy policy may be updated from time to time. Changes will be reflected on this page and constitute continued use of our platform.</p>
        `
      };

    case "contact":
      return {
        title: "Contact",
        body: `
          <p>📧 Email:
            <a href="mailto:samuelnzioka79@gmail.com" target="_blank">
              samuelnzioka79@gmail.com
            </a></p>

          <p>📘 Facebook:
            <a href="https://www.facebook.com/_samnzioka" target="_blank">
              facebook.com/_samnzioka
            </a></p>

          <p>📸 Instagram:
            <a href="https://www.instagram.com/_samnzioka" target="_blank">
              @_samnzioka
            </a></p>

          <p>📱 WhatsApp:
            <a href="https://wa.me/254798565752" target="_blank">
              +254 798565752
            </a></p>
        `
      };

    default:
      console.log('❌ Unknown modal type:', type);
      return { title: "", body: "" };
  }
}
