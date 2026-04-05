// Pollinations.ai — free, no API key required

const LANG_NAMES = {
  en: 'English',
  es: 'Spanish',
  'pt-BR': 'Brazilian Portuguese',
}

// Generate a social story structure from a user prompt
export async function generateStory(prompt, lang = 'en', numScenes = 5) {
  const langName = LANG_NAMES[lang] ?? 'English'

  const systemPrompt = `You create simple social stories for children who have communication difficulties or cannot speak.
Stories use short, clear sentences a child can understand.
Write the story in ${langName}.

Return ONLY valid JSON matching this exact shape — no markdown, no explanation:
{
  "title": "Short story title",
  "emoji": "one relevant emoji",
  "scenes": [
    { "text": "Short sentence describing what happens.", "imagePrompt": "Simple children's illustration: ..." },
    ...
  ]
}

Rules:
- ${numScenes} scenes total
- Each scene text: one clear sentence, max 12 words
- Each imagePrompt: describe a simple, friendly, colorful cartoon scene — no scary elements
- emoji: one emoji that represents the story topic`

  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a social story about: ${prompt}` },
      ],
      model: 'openai',
      jsonMode: true,
    }),
  })

  if (!response.ok) throw new Error(`Text generation failed: ${response.status}`)

  const text = await response.text()
  const json = JSON.parse(text)

  // Validate shape
  if (!json.title || !Array.isArray(json.scenes)) {
    throw new Error('Unexpected response shape from text API')
  }

  return json
}

// Generate an image URL for a scene (returned URL is usable directly in <img src>)
export function buildImageUrl(imagePrompt) {
  const safePrompt = `children's cartoon illustration, friendly, colorful, simple: ${imagePrompt}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=768&height=512&nologo=true`
}

// Fetch an image from Pollinations and return a base64 data URL for offline storage
export async function fetchImageAsDataUrl(imagePrompt) {
  const url = buildImageUrl(imagePrompt)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
