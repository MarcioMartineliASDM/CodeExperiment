import { useState } from 'react'
import { useStories } from './hooks/useStories'
import { useLanguage } from './hooks/useLanguage'
import { useTranslatedStory } from './hooks/useTranslate'
import { StoryList } from './components/StoryList'
import { StoryEditor } from './components/StoryEditor'
import { StoryViewer } from './components/StoryViewer'

// Thin wrapper that translates a single story before handing it to the viewer
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
  const [screen, setScreen] = useState('list')
  const [activeId, setActiveId] = useState(null)

  const { lang, changeLanguage, t } = useLanguage()

  const {
    stories,
    createStory,
    updateStory,
    deleteStory,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
  } = useStories()

  const activeStory = stories.find(s => s.id === activeId)

  function handleCreate(title, emoji) {
    const id = createStory(title, emoji)
    setActiveId(id)
    setScreen('edit')
  }

  function handleOpen(id) {
    setActiveId(id)
    setScreen('edit')
  }

  function handleView(id) {
    setActiveId(id)
    setScreen('view')
  }

  function handleBack() {
    setScreen('list')
    setActiveId(null)
  }

  if (screen === 'edit' && activeStory) {
    return (
      <StoryEditor
        story={activeStory}
        onBack={handleBack}
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
        onBack={handleBack}
        onEdit={() => setScreen('edit')}
        t={t}
      />
    )
  }

  return (
    <StoryList
      stories={stories}
      onCreate={handleCreate}
      onOpen={handleOpen}
      onView={handleView}
      onDelete={deleteStory}
      lang={lang}
      onChangeLang={changeLanguage}
      t={t}
    />
  )
}

export default App
