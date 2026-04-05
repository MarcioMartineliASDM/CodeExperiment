// Vercel serverless function — proxies to Pollinations text API (no CORS issues)

const LANG_NAMES = {
  en: 'English',
  es: 'Spanish',
  'pt-BR': 'Brazilian Portuguese',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt, lang = 'en', numScenes = 5 } = req.body ?? {}
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

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

  try {
    const pollinationsRes = await fetch('https://text.pollinations.ai/', {
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

    if (!pollinationsRes.ok) {
      throw new Error(`Pollinations error: ${pollinationsRes.status}`)
    }

    const text = await pollinationsRes.text()
    const story = JSON.parse(text)

    if (!story.title || !Array.isArray(story.scenes)) {
      throw new Error('Unexpected response shape')
    }

    return res.json(story)
  } catch (err) {
    console.error('Generate error:', err)
    return res.status(500).json({ error: err.message })
  }
}
