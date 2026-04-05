// Proxy Pollinations TTS server-side to avoid browser CORS restrictions
export default async function handler(req, res) {
  const { text, voice = 'nova' } = req.query

  if (!text) return res.status(400).json({ error: 'Missing text' })

  const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${voice}`

  try {
    const upstream = await fetch(url)
    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`)

    const contentType = upstream.headers.get('content-type') ?? 'audio/mpeg'
    const buffer = await upstream.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error('TTS proxy error:', err)
    res.status(502).json({ error: err.message })
  }
}
