import { useState } from 'react'
import { LANGUAGES } from '../i18n'
import { useTranslatedStoryList } from '../hooks/useTranslate'

const EMOJIS = ['📖', '🌟', '🏠', '🏫', '🦷', '🤲', '🛒', '🍽️', '🚌', '🛁', '😴', '👨‍⚕️', '🎉', '🐶', '🌈']

export function StoryList({ stories, onOpen, onView, onCreate, onDelete, lang, onChangeLang, t }) {
  const { translatedStories, translating } = useTranslatedStoryList(stories, lang)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📖')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(title.trim(), emoji)
    setTitle('')
    setEmoji('📖')
    setShowNew(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <header className="text-center py-6 mb-4 relative">
        {/* Language switcher */}
        <div className="absolute top-0 right-0 flex gap-1 pt-2">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => onChangeLang(l.code)}
              title={l.label}
              className={`text-xl w-10 h-10 rounded-xl transition-all ${
                lang === l.code
                  ? 'bg-purple-200 ring-2 ring-purple-500 scale-110'
                  : 'bg-white hover:bg-purple-100 shadow-sm'
              }`}
            >
              {l.flag}
            </button>
          ))}
        </div>

        <div className="text-5xl mb-2">📚</div>
        <h1 className="text-3xl font-bold text-purple-800">{t('appTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('appSubtitle')}</p>
      </header>

      {/* New Story Button */}
      {!showNew && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all active:scale-95"
          >
            {t('newStory')}
          </button>
        </div>
      )}

      {/* New Story Form */}
      {showNew && (
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-700 mb-4">{t('createNewStory')}</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('storyTitleLabel')}</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('storyTitlePlaceholder')}
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">{t('pickIcon')}</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-2xl w-12 h-12 rounded-xl transition-all ${emoji === e ? 'bg-purple-200 ring-2 ring-purple-500 scale-110' : 'bg-gray-100 hover:bg-purple-100'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl text-lg transition-all"
              >
                {t('create')}
              </button>
              <button
                type="button"
                onClick={() => { setShowNew(false); setTitle(''); setEmoji('📖') }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-lg transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center text-gray-400 mt-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl">{t('noStories')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {translatedStories.map(story => (
            <div
              key={story.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <button onClick={() => onView(story.id)} className="w-full text-left">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center h-32 text-7xl">
                  {story.emoji}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800 truncate">{story.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {story.scenes.length} {story.scenes.length !== 1 ? t('scenes') : t('scene')}
                  </p>
                </div>
              </button>

              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => onView(story.id)}
                  className="flex-1 py-3 text-purple-600 font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
                >
                  <span>▶</span> {t('read')}
                </button>
                <button
                  onClick={() => onOpen(story.id)}
                  className="flex-1 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 border-x border-gray-100"
                >
                  <span>✏️</span> {t('edit')}
                </button>
                {deleteConfirm === story.id ? (
                  <button
                    onClick={() => { onDelete(story.id); setDeleteConfirm(null) }}
                    className="flex-1 py-3 text-white bg-red-500 font-semibold hover:bg-red-600 transition-colors"
                  >
                    {t('deleteConfirm')}
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(story.id)}
                    onBlur={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 text-red-400 font-semibold hover:bg-red-50 transition-colors"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
