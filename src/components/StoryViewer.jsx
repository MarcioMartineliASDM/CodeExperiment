import { useState, useEffect } from 'react'
import { useSpeech } from '../hooks/useSpeech'

function VoicePicker({ voices, selectedVoice, onSelect, onClose, t }) {
  const [search, setSearch] = useState('')

  const filtered = voices.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.lang.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, v) => {
    const lang = v.lang.split('-')[0].toUpperCase()
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(v)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">{t('chooseVoice')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <input
            autoFocus
            type="text"
            placeholder={t('searchVoices')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="overflow-y-auto flex-1 p-3">
          <button
            onClick={() => { onSelect(''); onClose() }}
            className={`w-full text-left px-4 py-3 rounded-xl mb-1 font-medium transition-colors ${
              selectedVoice === '' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            🔊 {t('defaultVoice')}
            {selectedVoice === '' && (
              <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">{t('current')}</span>
            )}
          </button>

          {Object.entries(grouped).sort().map(([lang, langVoices]) => (
            <div key={lang} className="mb-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2 mb-1">{lang}</div>
              {langVoices.map(voice => (
                <button
                  key={voice.name}
                  onClick={() => { onSelect(voice.name); onClose() }}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-colors ${
                    selectedVoice === voice.name
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm">{voice.name}</span>
                      {voice.localService && (
                        <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{t('onDevice')}</span>
                      )}
                    </div>
                    {selectedVoice === voice.name && <span className="text-purple-500">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">{t('noVoicesFound')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function StoryViewer({ story, translating = false, onBack, onEdit, t }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showVoicePicker, setShowVoicePicker] = useState(false)
  const { speak, stop, speaking, supported, voices, selectedVoice, setSelectedVoice } = useSpeech()

  const scene = story.scenes[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === story.scenes.length - 1

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

  const currentVoiceName = selectedVoice
    ? voices.find(v => v.name === selectedVoice)?.name?.split(' ')[0] ?? 'Custom'
    : t('defaultVoice').split(' ')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur shadow-sm">
        <button
          onClick={() => { stop(); setAutoPlay(false); onBack() }}
          className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 font-semibold text-gray-600 transition-all"
        >
          {t('back')}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{story.emoji}</span>
          <span className="font-bold text-gray-800 text-sm sm:text-base truncate max-w-40">{story.title}</span>
        </div>
        <button
          onClick={() => { stop(); setAutoPlay(false); onEdit() }}
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl px-4 py-2 font-semibold transition-all text-sm"
        >
          ✏️ {t('edit')}
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
            aria-label={`${i + 1}`}
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 font-medium">
        {currentIndex + 1} / {story.scenes.length}
      </div>

      {/* Main Scene */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
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

          <div className="p-6 text-center">
            {translating ? (
              <div className="flex flex-col items-center gap-2 text-purple-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
                <p className="text-sm">Translating…</p>
              </div>
            ) : scene?.text ? (
              <p className="text-2xl font-semibold text-gray-800 leading-relaxed">{scene.text}</p>
            ) : (
              <p className="text-xl text-gray-300 italic">{t('noTextForScene')}</p>
            )}
          </div>

          {supported && (
            <div className="px-6 pb-5 flex items-center justify-center gap-2">
              {scene?.text && (
                <button
                  onClick={handleSpeakCurrent}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-base transition-all active:scale-95 shadow ${
                    speaking
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {speaking ? <><span>⏹</span> {t('stop')}</> : <><span>🔊</span> {t('readAloud')}</>}
                </button>
              )}
              {voices.length > 0 && (
                <button
                  onClick={() => setShowVoicePicker(true)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm transition-all active:scale-95 shadow"
                  title={t('changeVoice')}
                >
                  <span>🎙️</span>
                  <span className="max-w-20 truncate">{currentVoiceName}</span>
                  <span className="text-xs text-gray-400">▾</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white/90 backdrop-blur border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-2xl font-bold text-gray-600 transition-all active:scale-95 shadow-sm"
          >
            ←
          </button>

          <div className="flex-1 flex gap-2">
            {isLast && !autoPlay ? (
              <button
                onClick={handleRestart}
                className="flex-1 h-14 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span>↺</span> {t('restart')}
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
                  {autoPlay ? <><span>⏸</span> {t('pause')}</> : <><span>▶</span> {t('autoRead')}</>}
                </button>
              )
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isLast}
            className="w-14 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-30 flex items-center justify-center text-2xl font-bold text-white transition-all active:scale-95 shadow-sm"
          >
            →
          </button>
        </div>
      </div>

      {showVoicePicker && (
        <VoicePicker
          voices={voices}
          selectedVoice={selectedVoice}
          onSelect={setSelectedVoice}
          onClose={() => setShowVoicePicker(false)}
          t={t}
        />
      )}
    </div>
  )
}
