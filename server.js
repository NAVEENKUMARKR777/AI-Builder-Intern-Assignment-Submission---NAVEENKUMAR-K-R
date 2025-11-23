require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL_ID = process.env.HF_MODEL_ID || "tiiuae/falcon-7b-instruct";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/generate-story", async (req, res) => {
  const { title, genre, tone, mainCharacters, worldDescription, scenesCount } = req.body;

  if (!HF_API_KEY) {
    return res.status(500).json({ error: "HF_API_KEY is not configured on the server." });
  }

  if (!mainCharacters || typeof mainCharacters !== "string" || !mainCharacters.trim()) {
    return res.status(400).json({ error: "Please provide at least a brief description of main characters." });
  }

  const prompt = buildPrompt({
    title,
    genre,
    tone,
    mainCharacters,
    worldDescription,
    scenesCount,
  });

  try {
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: HF_MODEL_ID,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.9,
        top_p: 0.95,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const data = response.data;

    if (data && data.error) {
      const msg =
        typeof data.error === "string"
          ? data.error
          : data.error.message || JSON.stringify(data.error);
      return res.status(502).json({ error: msg });
    }

    let generatedText;

    if (
      data &&
      Array.isArray(data.choices) &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      typeof data.choices[0].message.content === "string"
    ) {
      generatedText = data.choices[0].message.content;
    } else if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      generatedText = first.generated_text || first.text || first.output_text || JSON.stringify(first);
    } else if (typeof data === "string") {
      generatedText = data;
    } else if (data && typeof data.generated_text === "string") {
      generatedText = data.generated_text;
    }

    if (!generatedText) {
      return res.status(500).json({ error: "Model did not return any text." });
    }

    res.json({ story: generatedText.trim() });
  } catch (err) {
    console.error(
      "Error generating story via Hugging Face:",
      err.response && err.response.status,
      err.response && err.response.data ? err.response.data : err.message || err
    );

    if (err.response && err.response.data && err.response.data.error) {
      return res.status(502).json({ error: err.response.data.error });
    }

    res.status(500).json({ error: "Failed to generate story. Please try again." });
  }
});

function buildPrompt({ title, genre, tone, mainCharacters, worldDescription, scenesCount }) {
  const scenes = Number(scenesCount) || 4;
  const lines = [];

  lines.push("You are an imaginative fiction writer.");
  lines.push("Write a coherent, engaging story split into distinct scenes.");
  lines.push("The same main characters must appear consistently across all scenes, keeping names, personality traits, and relationships stable.");
  lines.push("");
  lines.push(`Title: ${title && title.trim() ? title.trim() : "Untitled Adventure"}`);
  if (genre && genre.trim()) {
    lines.push(`Genre: ${genre.trim()}`);
  }
  if (tone && tone.trim()) {
    lines.push(`Tone: ${tone.trim()}`);
  }
  lines.push(`Main characters: ${mainCharacters.trim()}`);
  if (worldDescription && worldDescription.trim()) {
    lines.push(`World and setting: ${worldDescription.trim()}`);
  }
  lines.push("");
  lines.push(`Structure the story as ${scenes} numbered scenes.`);
  lines.push('Use clear headings like "Scene 1:", "Scene 2:", and so on.');
  lines.push("Each scene should move the plot forward.");
  lines.push("End with a satisfying resolution in the final scene.");

  return lines.join("\n");
}

app.listen(PORT, () => {
  console.log(`AI Storyteller server listening on http://localhost:${PORT}`);
});
