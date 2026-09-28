const BASE_API_URL = "https://alximg.vercel.app";

async function getAllThemes() {
  try {
    const response = await fetch(`${BASE_API_URL}/get-all-themes`);
    
    if (!response.ok) {
     return {error: `HTTP error! Status: ${response.status}`};
    }
    const themes = await response.json();
    return themes;
  } catch (error) {                     
    return {error: error};
  }
}

