const CACHE_KEY = 'translation-cache-v1'

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') }
  catch { return {} }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) }
  catch {}
}

// MyMemory free translation API — no key required, ~5000 chars/day free
async function translateOne(text, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`)
  const data = await res.json()
  const translated = data.responseData?.translatedText
  if (!translated) throw new Error('Empty response from MyMemory')
  return translated
}

// Translate an array of strings to the target language.
// Returns translated strings in the same order. Caches results in localStorage.
export async function translateTexts(texts, targetLang) {
  if (!texts.length) return []

  const cache = loadCache()
  const results = [...texts]
  const needed = []

  texts.forEach((text, i) => {
    if (!text?.trim()) return
    const key = `${targetLang}\x00${text}`
    if (cache[key] !== undefined) {
      results[i] = cache[key]
    } else {
      needed.push({ text, index: i })
    }
  })

  if (needed.length === 0) return results

  // Translate all uncached texts in parallel
  const translated = await Promise.all(
    needed.map(({ text }) => translateOne(text, targetLang).catch(() => text))
  )

  needed.forEach(({ text, index }, i) => {
    results[index] = translated[i]
    cache[`${targetLang}\x00${text}`] = translated[i]
  })

  saveCache(cache)
  return results
}
