import Anthropic from '@anthropic-ai/sdk'

const LANG_NAMES = {
  en: 'English',
  es: 'Spanish',
  'pt-BR': 'Brazilian Portuguese',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { texts, targetLang } = req.body ?? {}

  if (!Array.isArray(texts) || !targetLang) {
    return res.status(400).json({ error: 'Missing texts or targetLang' })
  }

  // Filter out empty strings — translate only non-empty texts
  const nonEmpty = texts.map((t, i) => ({ text: t, index: i })).filter(x => x.text?.trim())

  if (nonEmpty.length === 0) {
    return res.json({ translations: texts })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  try {
    const client = new Anthropic({ apiKey })
    const langName = LANG_NAMES[targetLang] ?? targetLang

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Translate the following texts to ${langName}.
These are simple, short sentences from children's social stories.
Keep translations clear, warm, and easy to understand for children.

Return ONLY a valid JSON array of translated strings in exactly the same order.
Do not add any explanation or extra text — just the JSON array.

Texts:
${JSON.stringify(nonEmpty.map(x => x.text))}`,
        },
      ],
    })

    const raw = response.content[0].text.trim()
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Response was not a JSON array')

    const translated = JSON.parse(match[0])

    // Merge translated texts back into original positions (empty strings stay empty)
    const results = [...texts]
    nonEmpty.forEach(({ index }, i) => {
      results[index] = translated[i] ?? texts[index]
    })

    return res.json({ translations: results })
  } catch (err) {
    console.error('Translation error:', err)
    return res.status(500).json({ error: 'Translation failed', details: err.message })
  }
}
