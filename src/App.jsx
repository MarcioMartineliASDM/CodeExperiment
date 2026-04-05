import { useState } from 'react'
import { useStories } from './hooks/useStories'
import { useLanguage } from './hooks/useLanguage'
import { useTranslatedStory } from './hooks/useTranslate'
import { StoryList } from './components/StoryList'
import { StoryEditor } from './components/StoryEditor'
import { StoryViewer } from './components/StoryViewer'
import { StoryGenerator } from './components/StoryGenerator'

function TranslatedViewer({ story, lang, onBack, onEdit, t }) {
  const { translatedStory, translating } = useTranslatedStory(story, lang)
  return (
    <StoryViewer
      story={translatedStory}
      translating={translating}
      onBack={onBack}
      onEdit={onEdit}
      t={t}
    />
  )
}

function App() {
  const [screen, setScreen] = useState('list') // list | edit | view | generate
  const [activeId, setActiveId] = useState(null)

  const { lang, changeLanguage, t } = useLanguage()
  const { stories, createStory, updateStory, deleteStory, addScene, updateScene, deleteScene, reorderScenes } = useStories()

  const activeStory = stories.find(s => s.id === activeId)

  function handleCreate(title, emoji) {
    const id = createStory(title, emoji)
    setActiveId(id)
    setScreen('edit')
  }

  function handleSaveGenerated(draft) {
    // Build story from AI draft
    const id = createStory(draft.title, draft.emoji)
    // Replace the default blank scene with the generated scenes
    draft.scenes.forEach((scene, i) => {
      if (i === 0) {
        updateScene(id, /* we need the scene id — use updateStory instead below */ null, {})
      }
    })
    // Easier: directly patch via updateStory with full scenes array
    updateStory(id, {
      scenes: draft.scenes.map(s => ({
        id: crypto.randomUUID(),
        text: s.text,
        imageUrl: s.imageUrl ?? null,
        imageAlt: s.imageAlt ?? '',
      })),
    })
    setScreen('list')
  }

  if (screen === 'generate') {
    return (
      <StoryGenerator
        lang={lang}
        t={t}
        onBack={() => setScreen('list')}
        onSave={handleSaveGenerated}
      />
    )
  }

  if (screen === 'edit' && activeStory) {
    return (
      <StoryEditor
        story={activeStory}
        onBack={() => { setScreen('list'); setActiveId(null) }}
        onUpdateStory={updateStory}
        onAddScene={addScene}
        onUpdateScene={updateScene}
        onDeleteScene={deleteScene}
        onReorderScenes={reorderScenes}
        t={t}
      />
    )
  }

  if (screen === 'view' && activeStory) {
    return (
      <TranslatedViewer
        story={activeStory}
        lang={lang}
        onBack={() => { setScreen('list'); setActiveId(null) }}
        onEdit={() => setScreen('edit')}
        t={t}
      />
    )
  }

  return (
    <StoryList
      stories={stories}
      onCreate={handleCreate}
      onOpen={id => { setActiveId(id); setScreen('edit') }}
      onView={id => { setActiveId(id); setScreen('view') }}
      onDelete={deleteStory}
      onGenerate={() => setScreen('generate')}
      lang={lang}
      onChangeLang={changeLanguage}
      t={t}
    />
  )
}

export default App
