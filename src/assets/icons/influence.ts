import type { Language } from '../../model/language'
import { AGENT_ICONS } from './agents'

/**
 * Los rombos de influencia por facción los **genera** `prepare_assets.py`
 * componiendo el rombo vacío con el emblema de cada facción, así que acá se
 * levantan con un glob en vez de una lista a mano: si el script agrega o
 * cambia una combinación, esto la toma sola.
 */
const files = import.meta.glob('./influence/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export type InfluenceVariant = 'gain-one' | 'lose-one' | 'gain-two' | 'lose-two'

export const INFLUENCE_VARIANTS: Record<InfluenceVariant, Record<Language, string>> = {
  'gain-one': {
    es: 'Ganar 1',
    en: 'Gain 1',
    pt: 'Ganhar 1',
    fr: 'Gagner 1',
    de: 'Erhalte 1',
    it: 'Guadagna 1',
    pl: 'Zyskaj 1',
    cs: 'Získej 1',
    hu: 'Szerezz 1',
    ru: 'Получить 1',
    uk: 'Отримати 1',
    bg: 'Получаване на 1',
  },
  'lose-one': {
    es: 'Perder 1',
    en: 'Lose 1',
    pt: 'Perder 1',
    fr: 'Perdre 1',
    de: 'Verliere 1',
    it: 'Perdi 1',
    pl: 'Strać 1',
    cs: 'Ztrať 1',
    hu: 'Veszíts 1',
    ru: 'Потерять 1',
    uk: 'Втратити 1',
    bg: 'Загуба на 1',
  },
  'gain-two': {
    es: 'Ganar 2',
    en: 'Gain 2',
    pt: 'Ganhar 2',
    fr: 'Gagner 2',
    de: 'Erhalte 2',
    it: 'Guadagna 2',
    pl: 'Zyskaj 2',
    cs: 'Získej 2',
    hu: 'Szerezz 2',
    ru: 'Получить 2',
    uk: 'Отримати 2',
    bg: 'Получаване на 2',
  },
  'lose-two': {
    es: 'Perder 2',
    en: 'Lose 2',
    pt: 'Perder 2',
    fr: 'Perdre 2',
    de: 'Verliere 2',
    it: 'Perdi 2',
    pl: 'Strać 2',
    cs: 'Ztrať 2',
    hu: 'Veszíts 2',
    ru: 'Потерять 2',
    uk: 'Втратити 2',
    bg: 'Загуба на 2',
  },
}

/** Sólo las cuatro facciones tienen rombo; Landsraad, Ciudad y Especia no. */
export const INFLUENCE_FACTIONS = [
  'emperor',
  'spacing-guild',
  'bene-gesserit',
  'fremen',
] as const

export type InfluenceFaction = (typeof INFLUENCE_FACTIONS)[number]

export type InfluenceIconId = `influence-${InfluenceFaction}-${InfluenceVariant}`

export const INFLUENCE_ICONS = Object.fromEntries(
  INFLUENCE_FACTIONS.flatMap((faction) =>
    (Object.keys(INFLUENCE_VARIANTS) as InfluenceVariant[]).map((variant) => [
      `influence-${faction}-${variant}`,
      {
        url: files[`./influence/${faction}-${variant}.png`],
        label: {
          es: `${INFLUENCE_VARIANTS[variant].es} influencia · ${AGENT_ICONS[faction].es}`,
          en: `${INFLUENCE_VARIANTS[variant].en} influence · ${AGENT_ICONS[faction].en}`,
          pt: `${INFLUENCE_VARIANTS[variant].pt} de influência · ${AGENT_ICONS[faction].pt}`,
          fr: `${INFLUENCE_VARIANTS[variant].fr} influence · ${AGENT_ICONS[faction].fr}`,
          de: `${INFLUENCE_VARIANTS[variant].de} Einfluss · ${AGENT_ICONS[faction].de}`,
          it: `${INFLUENCE_VARIANTS[variant].it} influenza · ${AGENT_ICONS[faction].it}`,
          pl: `${INFLUENCE_VARIANTS[variant].pl} wpływu · ${AGENT_ICONS[faction].pl}`,
          cs: `${INFLUENCE_VARIANTS[variant].cs} vliv · ${AGENT_ICONS[faction].cs}`,
          hu: `${INFLUENCE_VARIANTS[variant].hu} befolyást · ${AGENT_ICONS[faction].hu}`,
          ru: `${INFLUENCE_VARIANTS[variant].ru} влияния · ${AGENT_ICONS[faction].ru}`,
          uk: `${INFLUENCE_VARIANTS[variant].uk} впливу · ${AGENT_ICONS[faction].uk}`,
          bg: `${INFLUENCE_VARIANTS[variant].bg} влияние · ${AGENT_ICONS[faction].bg}`,
        },
      },
    ]),
  ),
) as Record<InfluenceIconId, { url: string; label: Record<Language, string> }>
