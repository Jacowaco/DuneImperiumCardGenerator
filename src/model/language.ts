import { createContext, useContext, useState } from 'react'

/**
 * Es una preferencia del navegador, no del mazo: vive en su propio
 * localStorage, aparte del autoguardado. Un mazo abierto en otra máquina se ve
 * en el idioma que esa máquina tenga elegido, igual que el resto de la UI —
 * por eso no es un campo de `Card` ni de `Deck`.
 */
export type Language = 'es' | 'en' | 'pt'

export const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

export const LANGUAGE_IDS = Object.keys(LANGUAGE_NAMES) as Language[]

const STORAGE_KEY = 'dune-card-generator:language'

const detectLanguage = (): Language => {
  const preferred = navigator.languages ?? [navigator.language]
  const prefixes: Language[] = ['es', 'pt', 'en']
  return prefixes.find((prefix) => preferred.some((lang) => lang?.toLowerCase().startsWith(prefix))) ?? 'en'
}

const loadLanguage = (): Language => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'es' || stored === 'pt') return stored
  return detectLanguage()
}

export function useLanguageState() {
  const [language, setLanguageState] = useState<Language>(loadLanguage)

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return { language, setLanguage }
}

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'es',
  setLanguage: () => {},
})

export const LanguageProvider = LanguageContext.Provider
export const useLanguage = () => useContext(LanguageContext)

/** Elige el texto que corresponde al idioma actual de un mapa `{ es, en }`. */
export const pick = <T,>(map: Record<Language, T>, language: Language): T => map[language]
