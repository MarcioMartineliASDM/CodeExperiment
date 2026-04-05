import { useState } from 'react'
import { generateStory, fetchImageAsDataUrl } from '../services/ai'

const SCENE_OPTIONS = [3, 4, 5, 6, 7]

const EXAMPLE_PROMPTS = {
  en: ['Going to the supermarket', 'Taking a bath', 'Getting a haircut', 'Riding the school bus', 'Visiting the doctor'],
  es: ['Ir al supermercado', 'Bañarse', 'Cortarse el pelo', 'Ir en el autobús escolar', 'Visitar al médico'],
  'pt-BR': ['Ir ao supermercado', 'Tomar banho', 'Cortar o cabelo', 'Andar no ônibus escolar', 'Visitar o médico'],
}

export function StoryGenerator({ lang, t, onBack, onSave }) {
  const [prompt, setPrompt] = useState('')
  const [numScenes, setNumScenes] = useState(5)
  const [step, setStep] = useState('idle') // idle | generating-text | generating-images | preview | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [draft, setDraft] = useState(null) // generated story before saving
  const [errorMsg, setErrorMsg] = useState('')

  const examples = EXAMPLE_PROMPTS[lang] ?? EXAMPLE_PROMPTS.en

  async function handleGenerate() {
    if (!prompt.trim()) return
    setStep('generating-text')
    setErrorMsg('')

    let story
    try {
      story = await generateStory(prompt.trim(), lang, numScenes)
    } catch (err) {
      setErrorMsg(err.message)
      setStep('error')
      return
    }

    // Generate images for each scene in parallel
    setStep('generating-images')
    setProgress({ done: 0, total: story.scenes.length })

    const scenesWithImages = await Promise.all(
      story.scenes.map(async (scene, i) => {
        try {
          const imageUrl = await fetchImageAsDataUrl(scene.imagePrompt ?? scene.text)
          setProgress(p => ({ ...p, done: p.done + 1 }))
          return { ...scene, imageUrl, imageAlt: scene.imagePrompt ?? scene.text }
        } catch {
          setProgress(p => ({ ...p, done: p.done + 1 }))
          return { ...scene, imageUrl: null, imageAlt: '' }
        }
      })
    )

    setDraft({ ...story, scenes: scenesWithImages })
    setStep('preview')
  }

  function handleSave() {
    if (!draft) return
    onSave(draft)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 font-semibold text-gray-600 transition-all"
        >
          {t('back')}
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>✨</span> {t('generateWithAI')}
        </h1>
      </div>

      <div className="max-w-xl mx-auto p-4 flex flex-col gap-5 pb-10">

        {/* Prompt input */}
        {(step === 'idle' || step === 'error') && (
          <>
            <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  {t('generatePromptLabel')}
                </label>
                <textarea
                  autoFocus
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={t('generatePromptPlaceholder')}
                  rows={3}
                  className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 text-lg resize-none focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              {/* Example prompts */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('examplePrompts')}</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      className="text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scene count */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  {t('generateScenes')}
                </label>
                <div className="flex gap-2">
                  {SCENE_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => setNumScenes(n)}
                      className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                        numScenes === n
                          ? 'bg-orange-500 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {step === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
                <p className="font-semibold mb-1">{t('generationFailed')}</p>
                <p className="text-red-400">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-5 rounded-2xl text-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <span>✨</span> {t('generateButton')}
            </button>
          </>
        )}

        {/* Generating text */}
        {step === 'generating-text' && (
          <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">✍️</div>
            <p className="text-xl font-bold text-gray-700">{t('generatingText')}</p>
            <p className="text-gray-400 text-sm text-center">{t('generatingTextSub')}</p>
          </div>
        )}

        {/* Generating images */}
        {step === 'generating-images' && (
          <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-5">
            <div className="text-6xl animate-pulse">🎨</div>
            <p className="text-xl font-bold text-gray-700">{t('generatingImages')}</p>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-gray-500 text-sm">
              {progress.done} / {progress.total} {t('imagesReady')}
            </p>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && draft && (
          <>
            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
              <span className="text-4xl">{draft.emoji}</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{t('generatedStory')}</p>
                <h2 className="text-xl font-bold text-gray-800">{draft.title}</h2>
              </div>
            </div>

            {draft.scenes.map((scene, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.imageAlt}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="h-32 bg-orange-50 flex items-center justify-center text-gray-300 text-sm">
                    {t('noImage')}
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">{t('sceneLabel')} {i + 1}</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{scene.text}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep('idle'); setDraft(null) }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-lg transition-all"
              >
                {t('tryAgain')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <span>💾</span> {t('saveToLibrary')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
