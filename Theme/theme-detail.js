const BASE_API_URL = "https://alximg.vercel.app";

const themeName = document.getElementById("theme-name");
const themeDescription = document.getElementById("theme-description");
const generateForm = document.getElementById("generate-form");
const imageUrlInput = document.getElementById("input-image-url");
const imageFileInput = document.getElementById("input-image-file");
const statusMessage = document.getElementById("status-message");
const resultBox = document.getElementById("result-box");
const generatedImage = document.getElementById("generated-image");
const downloadBtn = document.getElementById("download-btn");

let selectedTheme = null;
let generatedImageData = "";

function setStatus(message, isError = false) {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#5E3122" : "#1D4533";
}

function showResult(imageUrl) {
  if (!resultBox || !generatedImage || !downloadBtn) return;

  generatedImageData = imageUrl;
  generatedImage.src = imageUrl;
  downloadBtn.href = imageUrl;
  downloadBtn.download = selectedTheme ? `${selectedTheme.name || "theme-image"}.png` : "generated-image.png";
  resultBox.classList.add("visible");
}

async function getAllThemes() {
  try {
    const response = await fetch(`${BASE_API_URL}/get-all-themes`);

    if (!response.ok) {
      return { error: "Unable to fetch themes" };
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

function renderTheme(theme) {
  if (!theme) {
    setStatus("Theme not found.", true);
    return;
  }

  selectedTheme = theme;

  const title = theme.name || theme.title || theme.theme_name || "Untitled Theme";
  const description = theme.description || "No description available.";

  if (themeName) themeName.textContent = title;
  if (themeDescription) themeDescription.textContent = description;
}

async function loadThemeData() {
  const params = new URLSearchParams(window.location.search);
  const themeId = params.get("id");

  if (!themeId) {
    setStatus("No theme selected.", true);
    return;
  }

  const result = await getAllThemes();

  if (result.error) {
    setStatus("Unable to load theme details right now.", true);
    return;
  }

  const theme = result.themes.find((item) => String(item.id) === String(themeId));
  renderTheme(theme);

  if (!theme) {
    setStatus("This theme could not be found.", true);
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the uploaded image."));
    reader.readAsDataURL(file);
  });
}

async function handleGenerate(event) {
  event.preventDefault();

  if (!selectedTheme) {
    setStatus("Please wait for the theme to load.", true);
    return;
  }

  const file = imageFileInput && imageFileInput.files && imageFileInput.files[0];
  let imageUrl = imageUrlInput ? imageUrlInput.value.trim() : "";

  if (file) {
    try {
      imageUrl = await readFileAsDataUrl(file);
    } catch (error) {
      setStatus(error.message || "Could not read the selected image.", true);
      return;
    }
  }

  if (!imageUrl) {
    setStatus("Please enter an image URL or upload a file.", true);
    return;
  }

  setStatus("Generating your image...");

  try {
    const response = await fetch(`${BASE_API_URL}/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        theme_id: Number(selectedTheme.id),
        input_image_url: imageUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Image generation failed.");
    }

    const data = await response.json();

    if (!data || !data.image_url) {
      throw new Error("The server did not return an image.");
    }

    setStatus("Image generated successfully.");
    showResult(data.image_url);
  } catch (error) {
    const message = error && error.message ? error.message : "Unable to generate the image.";
    setStatus(message, true);
  }
}

if (generateForm) {
  generateForm.addEventListener("submit", handleGenerate);
}

if (imageFileInput) {
  imageFileInput.addEventListener("change", function () {
    if (imageFileInput.files && imageFileInput.files[0]) {
      imageUrlInput.value = "";
    }
  });
}

loadThemeData();
