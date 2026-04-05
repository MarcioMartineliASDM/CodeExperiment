const CACHE_KEY = 'translation-cache-v1'

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') }
  catch { return {} }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) }
  catch {}
}

// Translate an array of strings to the target language.
// Returns translated strings in the same order (empty strings pass through unchanged).
// Results are cached in localStorage by (lang, text) key.
export async function translateTexts(texts, targetLang) {
  if (!texts.length) return []

  const cache = loadCache()
  const results = [...texts]
  const needed = [] // { text, originalIndex }

  texts.forEach((text, i) => {
    if (!text?.trim()) return // leave empty strings as-is
    const key = `${targetLang}\x00${text}`
    if (cache[key] !== undefined) {
      results[i] = cache[key]
    } else {
      needed.push({ text, index: i })
    }
  })

  if (needed.length === 0) return results

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texts: needed.map(n => n.text),
      targetLang,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${response.status}`)
  }

  const { translations } = await response.json()

  needed.forEach(({ text, index }, i) => {
    const translated = translations[i] ?? text
    results[index] = translated
    cache[`${targetLang}\x00${text}`] = translated
  })

  saveCache(cache)
  return results
}
