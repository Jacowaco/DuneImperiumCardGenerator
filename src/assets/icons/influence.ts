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

export const INFLUENCE_VARIANTS = {
  'gain-one': 'Ganar 1',
  'lose-one': 'Perder 1',
  'gain-two': 'Ganar 2',
  'lose-two': 'Perder 2',
} as const

export type InfluenceVariant = keyof typeof INFLUENCE_VARIANTS

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
        label: `${INFLUENCE_VARIANTS[variant]} influencia · ${AGENT_ICONS[faction]}`,
      },
    ]),
  ),
) as Record<InfluenceIconId, { url: string; label: string }>
