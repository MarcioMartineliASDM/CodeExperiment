import { useState } from 'react'
import { t } from '../i18n'

export function useLanguage() {
  const [lang, setLang] = useState(() => localStorage.getItem('app-language') || 'en')

  function changeLanguage(code) {
    setLang(code)
    localStorage.setItem('app-language', code)
  }

  return { lang, changeLanguage, t: (key) => t(lang, key) }
}
