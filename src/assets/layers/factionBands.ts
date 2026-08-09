import type { Faction } from '../../model/card'

/**
 * Las 16 combinaciones posición × facción las genera `prepare_assets.py`
 * tiñendo la plantilla en blanco de cada posición, así que acá se levantan
 * con un glob en vez de una lista a mano — mismo patrón que
 * `assets/icons/influence.ts`.
 */
const files = import.meta.glob('./faction-bands/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/** 1 = arriba y más ancha, 4 = abajo y más angosta. */
export function factionBandUrl(faction: Faction, rank: number): string {
  return files[`./faction-bands/${faction}-${rank}.png`]
}
