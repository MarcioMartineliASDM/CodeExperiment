import { useState } from 'react'
import { useStories } from './hooks/useStories'
import { StoryList } from './components/StoryList'
import { StoryEditor } from './components/StoryEditor'
import { StoryViewer } from './components/StoryViewer'

// Simple single-page router: 'list' | 'edit' | 'view'
function App() {
  const [screen, setScreen] = useState('list')
  const [activeId, setActiveId] = useState(null)

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
      />
    )
  }

  if (screen === 'view' && activeStory) {
    return (
      <StoryViewer
        story={activeStory}
        onBack={handleBack}
        onEdit={() => setScreen('edit')}
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
    />
  )
}

export default App
