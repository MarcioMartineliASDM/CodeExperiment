// Generate a social story via our Vercel serverless proxy (avoids CORS)
export async function generateStory(prompt, lang = 'en', numScenes = 5) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, lang, numScenes }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Server error ${res.status}`)
  }

  return res.json()
}

// Build a Pollinations image URL — used directly in <img src> (no CORS fetch needed)
export function buildImageUrl(imagePrompt) {
  const full = `children's cartoon illustration, friendly, colorful, simple: ${imagePrompt}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=768&height=512&nologo=true`
}
