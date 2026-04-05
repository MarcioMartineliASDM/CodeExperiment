import { useEffect, useRef, useState } from 'react'

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const utteranceRef = useRef(null)

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  function speak(text, onEnd) {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.85
    utter.pitch = 1.1
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

  return { speak, stop, speaking, supported }
}
