const form = document.getElementById("story-form");
const storyElement = document.getElementById("story");
const statusElement = document.getElementById("status");
const generateButton = document.getElementById("generate-btn");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    title: formData.get("title"),
    genre: formData.get("genre"),
    tone: formData.get("tone"),
    mainCharacters: formData.get("mainCharacters"),
    worldDescription: formData.get("worldDescription"),
    scenesCount: formData.get("scenesCount"),
  };

  storyElement.innerHTML = "";
  statusElement.textContent = "Generating story...";
  generateButton.disabled = true;

  try {
    const response = await fetch("/api/generate-story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      statusElement.textContent = data.error || "Something went wrong.";
      return;
    }

    statusElement.textContent = "";
    renderStory(data.story);
  } catch (error) {
    statusElement.textContent = "Failed to reach the server.";
  } finally {
    generateButton.disabled = false;
  }
});

function renderStory(text) {
  if (!text) {
    storyElement.textContent = "No story returned.";
    return;
  }

  const paragraphs = text.split(/\n{2,}/);
  storyElement.innerHTML = "";

  paragraphs.forEach((raw) => {
    const value = raw.trim();
    if (!value) {
      return;
    }
    const p = document.createElement("p");
    p.textContent = value;
    storyElement.appendChild(p);
  });
}
