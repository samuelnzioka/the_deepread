const container = document.getElementById("analysis");

async function loadAnalysis() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      container.innerHTML = "<p>Invalid analysis link.</p>";
      return;
    }

    const res = await fetch(
      `https://the-terrific-proxy.onrender.com/api/explainers/${id}`
    );

    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();

    container.innerHTML = `
      <h1>${data.title}</h1>
      <img src="${data.image}" class="analysis-image" />

      <h2>Background</h2>
      <p>${data.background}</p>

      <h2>What’s Happening</h2>
      <p>${data.happening}</p>

      <h2>Global Impact</h2>
      <p>${data.globalImpact}</p>

      <h2>Why It Matters</h2>
      <p>${data.whyItMatters}</p>

      <h2>What Comes Next</h2>
      <p>${data.outlook}</p>
    `;

  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p>Failed to load analysis.</p>";
  }
}

loadAnalysis();
