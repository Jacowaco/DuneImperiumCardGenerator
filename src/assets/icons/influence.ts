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
  'gain-one': { es: 'Ganar 1', en: 'Gain 1', pt: 'Ganhar 1' },
  'lose-one': { es: 'Perder 1', en: 'Lose 1', pt: 'Perder 1' },
  'gain-two': { es: 'Ganar 2', en: 'Gain 2', pt: 'Ganhar 2' },
  'lose-two': { es: 'Perder 2', en: 'Lose 2', pt: 'Perder 2' },
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
        },
      },
    ]),
  ),
) as Record<InfluenceIconId, { url: string; label: Record<Language, string> }>
