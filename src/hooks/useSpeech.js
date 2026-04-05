import { useEffect, useRef, useState } from 'react'

export const AI_VOICES = [
  { id: 'nova',    name: 'Nova',    desc: 'Friendly & warm' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Gentle & soft' },
  { id: 'alloy',   name: 'Alloy',   desc: 'Clear & neutral' },
  { id: 'echo',    name: 'Echo',    desc: 'Calm & precise' },
  { id: 'fable',   name: 'Fable',   desc: 'Expressive' },
  { id: 'onyx',    name: 'Onyx',    desc: 'Deep & confident' },
]

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const [voices, setVoices] = useState([])

  // selectedVoice: '' = browser default, 'ai:nova' = AI voice, or browser voice name
  const [selectedVoice, setSelectedVoice] = useState(
    () => localStorage.getItem('preferred-voice') || ''
  )

  const audioRef = useRef(null)
  const utteranceRef = useRef(null)

  // Load browser voices
  useEffect(() => {
    if (!supported) return
    function loadVoices() {
      const available = window.speechSynthesis.getVoices()
      if (available.length > 0) setVoices(available)
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [supported])

  useEffect(() => {
    localStorage.setItem('preferred-voice', selectedVoice)
  }, [selectedVoice])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
  }, [])

  function speakWithAI(text, voiceId, onEnd) {
    const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${voiceId}`
    const audio = new Audio(url)
    audioRef.current = audio
    setSpeaking(true)
    audio.onended = () => { setSpeaking(false); audioRef.current = null; onEnd?.() }
    audio.onerror = () => { setSpeaking(false); audioRef.current = null; onEnd?.() }
    audio.play().catch(() => { setSpeaking(false); audioRef.current = null })
  }

  function speakWithBrowser(text, onEnd) {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.85
    utter.pitch = 1.1
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice)
      if (voice) utter.voice = voice
    }
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => { setSpeaking(false); onEnd?.() }
    utter.onerror = () => setSpeaking(false)
    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  function speak(text, onEnd) {
    if (!text?.trim()) return
    stop()
    if (selectedVoice.startsWith('ai:')) {
      const voiceId = selectedVoice.slice(3)
      speakWithAI(text, voiceId, onEnd)
    } else {
      speakWithBrowser(text, onEnd)
    }
  }

  function stop() {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }

  const isAiVoice = selectedVoice.startsWith('ai:')
  const currentAiVoice = isAiVoice ? AI_VOICES.find(v => `ai:${v.id}` === selectedVoice) : null

  return {
    speak, stop, speaking, supported,
    voices, selectedVoice, setSelectedVoice,
    isAiVoice, currentAiVoice,
  }
}
