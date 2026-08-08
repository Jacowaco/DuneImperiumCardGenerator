import acquireFoldspace from './acquire-foldspace.png'
import costArrow from './cost-arrow.png'
import drawCard from './draw-card.png'
import drawIntrigue from './draw-intrigue.png'
import influenceGainOne from './influence-gain-one.png'
import influenceGainTwo from './influence-gain-two.png'
import influenceLoseOne from './influence-lose-one.png'
import influenceLoseTwo from './influence-lose-two.png'
import persuasion from './persuasion.png'
import signetRing from './signet-ring.png'
import solari from './solari.png'
import spice from './spice.png'
import sword from './sword.png'
import trash from './trash.png'
import troop from './troop.png'
import water from './water.png'

/**
 * Iconos recortados de la hoja `Symbols.png` por `scripts/prepare_assets.py`.
 *
 * Ojo: `solari`, `spice` y `persuasion` vienen con un número quemado en el
 * arte (3, 1 y 1). Para poder poner cualquier cantidad hacen falta las
 * versiones sin número exportadas del PSD.
 */
export const ICONS = {
  water: { url: water, label: 'Agua' },
  solari: { url: solari, label: 'Solari' },
  spice: { url: spice, label: 'Especia' },
  troop: { url: troop, label: 'Tropa' },
  'draw-card': { url: drawCard, label: 'Robar carta' },
  'draw-intrigue': { url: drawIntrigue, label: 'Robar intriga' },
  trash: { url: trash, label: 'Descartar' },
  'acquire-foldspace': { url: acquireFoldspace, label: 'Foldspace' },
  'signet-ring': { url: signetRing, label: 'Anillo de sello' },
  persuasion: { url: persuasion, label: 'Persuasión' },
  sword: { url: sword, label: 'Espada' },
  'influence-gain-one': { url: influenceGainOne, label: 'Ganar 1 influencia' },
  'influence-gain-two': { url: influenceGainTwo, label: 'Ganar 2 influencia' },
  'influence-lose-one': { url: influenceLoseOne, label: 'Perder 1 influencia' },
  'influence-lose-two': { url: influenceLoseTwo, label: 'Perder 2 influencia' },
  'cost-arrow': { url: costArrow, label: 'Flecha de costo' },
} as const

export type IconId = keyof typeof ICONS

export const ICON_IDS = Object.keys(ICONS) as IconId[]
