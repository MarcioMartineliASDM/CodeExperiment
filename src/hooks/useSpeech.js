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
  const [selectedVoice, setSelectedVoice] = useState(
    () => localStorage.getItem('preferred-voice') || ''
  )

  const audioRef = useRef(null)

  useEffect(() => {
    if (!supported) return
    function loadVoices() {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) setVoices(v)
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [supported])

  useEffect(() => {
    localStorage.setItem('preferred-voice', selectedVoice)
  }, [selectedVoice])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
  }, [])

  function speakWithBrowser(text, voiceName, onEnd) {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.85
    utter.pitch = 1.1
    if (voiceName) {
      const v = voices.find(v => v.name === voiceName)
      if (v) utter.voice = v
    }
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => { setSpeaking(false); onEnd?.() }
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  function speakWithAI(text, voiceId, onEnd) {
    const url = `/api/tts?text=${encodeURIComponent(text)}&voice=${voiceId}`
    const audio = new Audio(url)
    audioRef.current = audio
    setSpeaking(true)

    audio.oncanplaythrough = () => audio.play().catch(() => {
      // Autoplay blocked or other error — fall back to browser TTS
      setSpeaking(false)
      audioRef.current = null
      speakWithBrowser(text, '', onEnd)
    })
    audio.onended = () => { setSpeaking(false); audioRef.current = null; onEnd?.() }
    audio.onerror = () => {
      // AI voice failed — silently fall back to browser TTS
      setSpeaking(false)
      audioRef.current = null
      speakWithBrowser(text, '', onEnd)
    }
  }

  function speak(text, onEnd) {
    if (!text?.trim()) return
    stop()

    if (selectedVoice.startsWith('ai:')) {
      speakWithAI(text, selectedVoice.slice(3), onEnd)
    } else {
      speakWithBrowser(text, selectedVoice, onEnd)
    }
  }

  function stop() {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }

  const isAiVoice = selectedVoice.startsWith('ai:')
  const currentAiVoice = isAiVoice
    ? AI_VOICES.find(v => `ai:${v.id}` === selectedVoice)
    : null

  return { speak, stop, speaking, supported, voices, selectedVoice, setSelectedVoice, isAiVoice, currentAiVoice }
}
