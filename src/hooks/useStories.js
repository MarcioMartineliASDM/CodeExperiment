import { useState, useEffect } from 'react'

const STORAGE_KEY = 'social-stories'

const SAMPLE_STORIES = [
  {
    id: 'sample-1',
    title: 'Going to the Dentist',
    emoji: '🦷',
    createdAt: Date.now() - 86400000,
    scenes: [
      {
        id: 's1',
        text: 'Today I am going to the dentist.',
        imageUrl: null,
        imageAlt: '',
      },
      {
        id: 's2',
        text: 'The dentist will look at my teeth.',
        imageUrl: null,
        imageAlt: '',
      },
      {
        id: 's3',
        text: 'I will sit in the big chair.',
        imageUrl: null,
        imageAlt: '',
      },
      {
        id: 's4',
        text: 'I will open my mouth wide.',
        imageUrl: null,
        imageAlt: '',
      },
      {
        id: 's5',
        text: 'When it is over, I can feel proud. I did it!',
        imageUrl: null,
        imageAlt: '',
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Washing My Hands',
    emoji: '🤲',
    createdAt: Date.now() - 3600000,
    scenes: [
      { id: 's1', text: 'I will wash my hands.', imageUrl: null, imageAlt: '' },
      { id: 's2', text: 'I turn on the water.', imageUrl: null, imageAlt: '' },
      { id: 's3', text: 'I put soap on my hands.', imageUrl: null, imageAlt: '' },
      { id: 's4', text: 'I rub my hands together for 20 seconds.', imageUrl: null, imageAlt: '' },
      { id: 's5', text: 'I rinse the soap off.', imageUrl: null, imageAlt: '' },
      { id: 's6', text: 'I dry my hands with a towel. My hands are clean!', imageUrl: null, imageAlt: '' },
    ],
  },
]

function loadStories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // First run — seed with samples
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_STORIES))
  return SAMPLE_STORIES
}

function saveStories(stories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
}

export function useStories() {
  const [stories, setStories] = useState(loadStories)

  useEffect(() => {
    saveStories(stories)
  }, [stories])

  function createStory(title, emoji = '📖') {
    const story = {
      id: crypto.randomUUID(),
      title,
      emoji,
      createdAt: Date.now(),
      scenes: [{ id: crypto.randomUUID(), text: '', imageUrl: null, imageAlt: '' }],
    }
    setStories(prev => [story, ...prev])
    return story.id
  }

  function updateStory(id, updates) {
    setStories(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
  }

  function deleteStory(id) {
    setStories(prev => prev.filter(s => s.id !== id))
  }

  function addScene(storyId) {
    setStories(prev =>
      prev.map(s =>
        s.id === storyId
          ? { ...s, scenes: [...s.scenes, { id: crypto.randomUUID(), text: '', imageUrl: null, imageAlt: '' }] }
          : s,
      ),
    )
  }

  function updateScene(storyId, sceneId, updates) {
    setStories(prev =>
      prev.map(s =>
        s.id === storyId
          ? { ...s, scenes: s.scenes.map(sc => (sc.id === sceneId ? { ...sc, ...updates } : sc)) }
          : s,
      ),
    )
  }

  function deleteScene(storyId, sceneId) {
    setStories(prev =>
      prev.map(s =>
        s.id === storyId ? { ...s, scenes: s.scenes.filter(sc => sc.id !== sceneId) } : s,
      ),
    )
  }

  function reorderScenes(storyId, fromIndex, toIndex) {
    setStories(prev =>
      prev.map(s => {
        if (s.id !== storyId) return s
        const scenes = [...s.scenes]
        const [moved] = scenes.splice(fromIndex, 1)
        scenes.splice(toIndex, 0, moved)
        return { ...s, scenes }
      }),
    )
  }

  return { stories, createStory, updateStory, deleteStory, addScene, updateScene, deleteScene, reorderScenes }
}
