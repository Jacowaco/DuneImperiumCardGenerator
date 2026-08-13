import { createContext, useContext, useState } from 'react'

/**
 * Es una preferencia del navegador, no del mazo: vive en su propio
 * localStorage, aparte del autoguardado. Un mazo abierto en otra máquina se ve
 * en el idioma que esa máquina tenga elegido, igual que el resto de la UI —
 * por eso no es un campo de `Card` ni de `Deck`.
 */
export type Language =
  | 'es'
  | 'en'
  | 'pt'
  | 'fr'
  | 'de'
  | 'it'
  | 'pl'
  | 'cs'
  | 'hu'
  | 'ru'
  | 'uk'
  | 'bg'

/**
 * Los idiomas en los que Dune: Imperium tiene edición oficial y la fuente de
 * la carta puede dibujar. Jost embarca latin, latin-ext y cyrillic, así que
 * faltan el griego y los cuatro CJK (japonés, chino simplificado y
 * tradicional, coreano): sin fuente propia la banda de facción caería en
 * `system-ui` y el PNG saldría distinto según la máquina que lo exportó.
 *
 * Cada nombre va escrito en su propio idioma, que es como se busca el suyo en
 * una lista de doce.
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pl: 'Polski',
  cs: 'Čeština',
  hu: 'Magyar',
  ru: 'Русский',
  uk: 'Українська',
  bg: 'Български',
}

export const LANGUAGE_IDS = Object.keys(LANGUAGE_NAMES) as Language[]

const STORAGE_KEY = 'dune-card-generator:language'

/**
 * Se recorre lo que pide el navegador y no la lista de idiomas: `navigator.
 * languages` ya viene en orden de preferencia, así que a alguien con
 * `['fr', 'es']` le tiene que tocar francés. Buscando al revés —el primer
 * idioma de la app que aparezca en algún lado de la lista— ganaba el orden en
 * que están escritos acá, que no dice nada.
 */
const detectLanguage = (): Language => {
  const preferred = navigator.languages ?? [navigator.language]
  for (const lang of preferred) {
    const match = LANGUAGE_IDS.find((id) => lang?.toLowerCase().startsWith(id))
    if (match) return match
  }
  return 'en'
}

const isLanguage = (value: string | null): value is Language =>
  value !== null && (LANGUAGE_IDS as string[]).includes(value)

const loadLanguage = (): Language => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isLanguage(stored) ? stored : detectLanguage()
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
