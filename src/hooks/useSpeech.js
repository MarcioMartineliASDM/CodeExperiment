import { useEffect, useRef, useState } from 'react'

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('preferred-voice') || '')
  const utteranceRef = useRef(null)

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

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  function speak(text, onEnd) {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.85
    utter.pitch = 1.1

    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice)
      if (voice) utter.voice = voice
    }

    utter.onstart = () => setSpeaking(true)
    utter.onend = () => {
      setSpeaking(false)
      onEnd?.()
    }
    utter.onerror = () => setSpeaking(false)
    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  function stop() {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  return { speak, stop, speaking, supported, voices, selectedVoice, setSelectedVoice }
}
