import { useState, useEffect, useRef } from 'react'
import { translateTexts } from '../services/translate'

// Translates a single story (title + all scene texts) when lang changes.
// Returns the story with translated content, plus a loading flag.
export function useTranslatedStory(story, lang) {
  const [result, setResult] = useState(story)
  const [translating, setTranslating] = useState(false)
  // Track the last (storyId, lang) pair we translated to avoid duplicate work
  const lastKey = useRef(null)

  useEffect(() => {
    const key = `${story.id}|${lang}`
    if (lastKey.current === key) return
    lastKey.current = key

    if (lang === 'en') {
      setResult(story)
      return
    }

    const texts = [story.title, ...story.scenes.map(s => s.text)]

    setTranslating(true)
    translateTexts(texts, lang)
      .then(translated => {
        const [translatedTitle, ...sceneTexts] = translated
        setResult({
          ...story,
          title: translatedTitle,
          scenes: story.scenes.map((s, i) => ({ ...s, text: sceneTexts[i] })),
        })
      })
      .catch(err => {
        console.warn('Story translation failed, showing original:', err.message)
        setResult(story)
      })
      .finally(() => setTranslating(false))
  }, [story.id, lang])

  // If the story content changed (e.g. user edited it), reset
  useEffect(() => {
    if (lang === 'en') setResult(story)
    else lastKey.current = null // force re-translate on next render
  }, [story.title, story.scenes.map(s => s.text).join('\x00')])

  return { translatedStory: result, translating }
}

// Translates the titles of all stories in a list when lang changes.
// Returns stories with translated titles, plus a loading flag.
export function useTranslatedStoryList(stories, lang) {
  const [result, setResult] = useState(stories)
  const [translating, setTranslating] = useState(false)
  const lastKey = useRef(null)

  useEffect(() => {
    const key = `${lang}|${stories.map(s => s.id + s.title).join('|')}`
    if (lastKey.current === key) return
    lastKey.current = key

    if (lang === 'en') {
      setResult(stories)
      return
    }

    const titles = stories.map(s => s.title)
    setTranslating(true)
    translateTexts(titles, lang)
      .then(translated => {
        setResult(stories.map((s, i) => ({ ...s, title: translated[i] })))
      })
      .catch(err => {
        console.warn('List translation failed, showing original:', err.message)
        setResult(stories)
      })
      .finally(() => setTranslating(false))
  }, [lang, stories.map(s => s.id + s.title).join('|')])

  return { translatedStories: result, translating }
}
