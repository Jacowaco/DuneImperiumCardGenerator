import type { InfluenceVariant } from './influence'

/**
 * El rombo vacío de cada variante, sin componer. `prepare_assets.py` ya los
 * deja acá al rebanar la hoja de símbolos (`compose_influence` los usa como
 * base); nada de TypeScript los importaba todavía porque hasta ahora sólo
 * hacía falta el resultado ya compuesto (`./influence`). Las facciones
 * propias los necesitan sueltos para componer su propio emblema encima, en
 * el navegador (`factionArt.ts`).
 */
const files = import.meta.glob('./blanks/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const blankInfluenceUrl = (variant: InfluenceVariant): string =>
  files[`./blanks/blank-${variant}.png`]
