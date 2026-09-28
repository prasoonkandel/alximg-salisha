const BASE_API_URL = "https://alximg.vercel.app";

const themesGrid = document.getElementById("themes-grid");
const themeSearch = document.getElementById("theme-search");
let allThemes = [];

async function getAllThemes() {
  try {
    const response = await fetch(BASE_API_URL + "/get-all-themes");

    if (!response.ok) {
      return { error: "HTTP error: " + response.status };
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return { themes: data };
    }

    if (data && Array.isArray(data.themes)) {
      return { themes: data.themes };
    }

    return { themes: [] };
  } catch (error) {
    return { error: error };
  }
}

function showLoadingState() {
  if (!themesGrid) return;

  themesGrid.innerHTML = '<p class="themes-empty">Loading...</p>';
}

function showEmptyState(message) {
  if (!themesGrid) return;

  themesGrid.innerHTML = '<p class="themes-empty">' + message + '</p>';
}

function createThemeCard(theme) {
  const card = document.createElement("article");
  card.className = "theme-card";

  let title = "Untitled Theme";
  if (theme && theme.title) {
    title = theme.title;
  } else if (theme && theme.name) {
    title = theme.name;
  } else if (theme && theme.theme_name) {
    title = theme.theme_name;
  }

  let description = "No description available.";
  if (theme && theme.description) {
    description = theme.description;
  } else if (theme && theme.prompt) {
    description = theme.prompt;
  } else if (theme && theme.details) {
    description = theme.details;
  }

  card.innerHTML = `
    <div class="theme-card-body">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  `;

  return card;
}

function renderThemes(themes) {
  if (!themesGrid) return;

  if (!themes || themes.length === 0) {
    showEmptyState("No themes match your search.");
    return;
  }

  themesGrid.innerHTML = "";

  themes.forEach((theme) => {
    themesGrid.appendChild(createThemeCard(theme));
  });
}

function filterThemes(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    renderThemes(allThemes);
    return;
  }

  const filteredThemes = allThemes.filter((theme) => {
    const title = [
      theme?.title,
      theme?.name,
      theme?.theme_name,
      ""
    ].join(" ").toLowerCase();

    const description = [
      theme?.description,
      theme?.prompt,
      theme?.details,
      ""
    ].join(" ").toLowerCase();

    return title.includes(normalizedQuery) || description.includes(normalizedQuery);
  });

  renderThemes(filteredThemes);
}

async function initThemes() {
  if (!themesGrid) return;

  showLoadingState();

  var result = await getAllThemes();

  if (result.error) {
    console.error("Error fetching themes:", result.error);
    showEmptyState("Unable to load themes right now.");
    return;
  }

  allThemes = Array.isArray(result.themes) ? result.themes : [];
  renderThemes(allThemes);

  if (themeSearch) {
    themeSearch.addEventListener("input", function (event) {
      filterThemes(event.target.value);
    });
  }
}

document.addEventListener("DOMContentLoaded", initThemes);

