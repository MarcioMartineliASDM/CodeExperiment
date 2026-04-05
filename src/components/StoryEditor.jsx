import { useState, useRef } from 'react'

const EMOJIS = ['📖', '🌟', '🏠', '🏫', '🦷', '🤲', '🛒', '🍽️', '🚌', '🛁', '😴', '👨‍⚕️', '🎉', '🐶', '🌈']

function SceneCard({ scene, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const fileRef = useRef(null)

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => onUpdate({ imageUrl: evt.target.result, imageAlt: file.name })
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    onUpdate({ imageUrl: null, imageAlt: '' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all">
      {/* Scene Header */}
      <div className="flex items-center justify-between bg-purple-50 px-4 py-2">
        <span className="font-bold text-purple-700 text-sm">Scene {index + 1}</span>
        <div className="flex gap-1">
          <button
            disabled={index === 0}
            onClick={onMoveUp}
            className="w-8 h-8 rounded-lg bg-white disabled:opacity-30 hover:bg-purple-100 flex items-center justify-center text-sm shadow-sm transition-all"
            title="Move up"
          >
            ↑
          </button>
          <button
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="w-8 h-8 rounded-lg bg-white disabled:opacity-30 hover:bg-purple-100 flex items-center justify-center text-sm shadow-sm transition-all"
            title="Move down"
          >
            ↓
          </button>
          {total > 1 && (
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg bg-white hover:bg-red-100 text-red-400 flex items-center justify-center text-sm shadow-sm transition-all"
              title="Delete scene"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Image Area */}
        <div className="flex flex-col items-center gap-2">
          {scene.imageUrl ? (
            <div className="relative w-full">
              <img
                src={scene.imageUrl}
                alt={scene.imageAlt || 'Scene image'}
                className="w-full h-48 object-contain rounded-xl bg-gray-50 border border-gray-200"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all shadow"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-purple-50 transition-colors text-purple-400 hover:text-purple-600"
            >
              <span className="text-3xl">🖼️</span>
              <span className="text-sm font-medium">Add a Picture</span>
              <span className="text-xs text-gray-400">Tap to upload</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {scene.imageUrl && (
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm text-blue-500 hover:text-blue-700 underline"
            >
              Change image
            </button>
          )}
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            What happens in this scene?
          </label>
          <textarea
            value={scene.text}
            onChange={e => onUpdate({ text: e.target.value })}
            placeholder="Write a short, simple sentence..."
            rows={3}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-base resize-none focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

export function StoryEditor({ story, onBack, onUpdateStory, onAddScene, onUpdateScene, onDeleteScene, onReorderScenes }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 font-semibold text-gray-600 transition-all flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <button
            onClick={() => setShowEmojiPicker(v => !v)}
            className="text-2xl hover:scale-110 transition-transform"
          >
            {story.emoji}
          </button>
          <input
            value={story.title}
            onChange={e => onUpdateStory(story.id, { title: e.target.value })}
            className="flex-1 text-lg font-bold text-gray-800 bg-transparent border-b-2 border-transparent focus:border-purple-400 focus:outline-none min-w-0 py-1"
            placeholder="Story title..."
          />
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-wrap gap-2 shadow-sm">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => { onUpdateStory(story.id, { emoji: e }); setShowEmojiPicker(false) }}
              className={`text-2xl w-12 h-12 rounded-xl transition-all ${story.emoji === e ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-gray-100 hover:bg-purple-100'}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Scenes */}
      <div className="max-w-xl mx-auto p-4 flex flex-col gap-4 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
            {story.scenes.length} Scene{story.scenes.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {story.scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={i}
            total={story.scenes.length}
            onUpdate={updates => onUpdateScene(story.id, scene.id, updates)}
            onDelete={() => onDeleteScene(story.id, scene.id)}
            onMoveUp={() => onReorderScenes(story.id, i, i - 1)}
            onMoveDown={() => onReorderScenes(story.id, i, i + 1)}
          />
        ))}

        {/* Add Scene */}
        <button
          onClick={() => onAddScene(story.id)}
          className="w-full py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-500 font-semibold text-lg hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span> Add Scene
        </button>
      </div>

      {/* Bottom Preview Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-200">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onBack}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-lg"
          >
            Done Editing ✓
          </button>
        </div>
      </div>
    </div>
  )
}
