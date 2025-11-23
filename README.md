# AI Storyteller

Dynamic storytelling web app that generates multi‑scene stories with consistent characters using a free Hugging Face text‑generation model.

## Tech stack

- **Backend**: Node.js + Express
- **Frontend**: Plain HTML/CSS/JS (static files)
- **AI**: Hugging Face Inference API (router.huggingface.co/v1/chat/completions)
- **Model**: HuggingFaceTB/SmolLM3-3B (free tier)

## How it works

1. User fills a form: title, genre, tone, characters, world, and number of scenes.
2. Frontend sends this to `/api/generate-story`.
3. Backend builds a prompt and calls Hugging Face’s OpenAI‑compatible chat completions endpoint.
4. Response is parsed and rendered as paragraphs in the UI.

## Setup and run locally

1. Clone or download this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file (copy `.env.example`) and add a free Hugging Face token:

   ```text
   HF_API_KEY=hf_your_token_here
   HF_MODEL_ID=HuggingFaceTB/SmolLM3-3B
   PORT=3000
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open http://localhost:3000

## Deploy (free)

- Push to GitHub.
- On Render, create a new Web Service, connect the repo, and set:
  - Runtime: Node
  - Build command: `npm install`
  - Start command: `npm start` or `npm run dev`
  - Environment variables: `HF_API_KEY` and `HF_MODEL_ID`.

## Notes

- Uses the new Hugging Face router endpoint (OpenAI‑compatible).
- Free tier has rate limits; retry if generation fails.
- UI is lightweight and works on mobile web.
