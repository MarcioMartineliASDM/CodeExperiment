import { useState, useEffect } from 'react'
import { useSpeech } from '../hooks/useSpeech'

export function StoryViewer({ story, onBack, onEdit }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const { speak, stop, speaking, supported } = useSpeech()

  const scene = story.scenes[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === story.scenes.length - 1

  // Speak scene text whenever scene changes in auto-play mode
  useEffect(() => {
    if (autoPlay && scene?.text) {
      speak(scene.text, () => {
        if (!isLast) {
          setCurrentIndex(i => i + 1)
        } else {
          setAutoPlay(false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, autoPlay])

  function handlePrev() {
    stop()
    setAutoPlay(false)
    setCurrentIndex(i => Math.max(0, i - 1))
  }

  function handleNext() {
    stop()
    setAutoPlay(false)
    setCurrentIndex(i => Math.min(story.scenes.length - 1, i + 1))
  }

  function handleSpeakCurrent() {
    if (speaking) { stop(); return }
    if (scene?.text) speak(scene.text)
  }

  function handleAutoPlay() {
    if (autoPlay) {
      stop()
      setAutoPlay(false)
      return
    }
    setAutoPlay(true)
    if (scene?.text) {
      speak(scene.text, () => {
        if (!isLast) setCurrentIndex(i => i + 1)
        else setAutoPlay(false)
      })
    }
  }

  function handleRestart() {
    stop()
    setAutoPlay(false)
    setCurrentIndex(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur shadow-sm">
        <button
          onClick={() => { stop(); setAutoPlay(false); onBack() }}
          className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 font-semibold text-gray-600 transition-all"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{story.emoji}</span>
          <span className="font-bold text-gray-800 text-sm sm:text-base truncate max-w-40">{story.title}</span>
        </div>
        <button
          onClick={() => { stop(); setAutoPlay(false); onEdit() }}
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl px-4 py-2 font-semibold transition-all text-sm"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-3">
        {story.scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => { stop(); setAutoPlay(false); setCurrentIndex(i) }}
            className={`rounded-full transition-all ${
              i === currentIndex
                ? 'w-6 h-3 bg-purple-600'
                : i < currentIndex
                ? 'w-3 h-3 bg-purple-300'
                : 'w-3 h-3 bg-gray-300'
            }`}
            aria-label={`Go to scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Scene counter */}
      <div className="text-center text-sm text-gray-500 font-medium">
        {currentIndex + 1} of {story.scenes.length}
      </div>

      {/* Main Scene */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Image */}
          {scene?.imageUrl ? (
            <div className="bg-gray-50">
              <img
                src={scene.imageUrl}
                alt={scene.imageAlt || 'Scene image'}
                className="w-full max-h-72 object-contain"
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 h-48 flex items-center justify-center">
              <span className="text-8xl">{story.emoji}</span>
            </div>
          )}

          {/* Text */}
          <div className="p-6 text-center">
            {scene?.text ? (
              <p className="text-2xl font-semibold text-gray-800 leading-relaxed">
                {scene.text}
              </p>
            ) : (
              <p className="text-xl text-gray-300 italic">No text for this scene</p>
            )}
          </div>

          {/* Speak this scene button */}
          {supported && scene?.text && (
            <div className="px-6 pb-5 flex justify-center">
              <button
                onClick={handleSpeakCurrent}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-base transition-all active:scale-95 shadow ${
                  speaking
                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {speaking ? (
                  <><span className="text-lg">⏹</span> Stop</>
                ) : (
                  <><span className="text-lg">🔊</span> Read Aloud</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white/90 backdrop-blur border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-2xl font-bold text-gray-600 transition-all active:scale-95 shadow-sm"
          >
            ←
          </button>

          {/* Auto-play / Restart */}
          <div className="flex-1 flex gap-2">
            {isLast && !autoPlay ? (
              <button
                onClick={handleRestart}
                className="flex-1 h-14 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span>↺</span> Restart
              </button>
            ) : (
              supported && (
                <button
                  onClick={handleAutoPlay}
                  className={`flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
                    autoPlay
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {autoPlay ? (
                    <><span>⏸</span> Pause</>
                  ) : (
                    <><span>▶</span> Auto-Read</>
                  )}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={isLast}
            className="w-14 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-30 flex items-center justify-center text-2xl font-bold text-white transition-all active:scale-95 shadow-sm"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
