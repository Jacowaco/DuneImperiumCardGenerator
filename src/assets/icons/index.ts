import acquireFoldspace from './acquire-foldspace.png'
import acquireTech from './acquire-tech.png'
import acquireTechDiscountOne from './acquire-tech-discount-one.png'
import combat from './combat.png'
import discardCard from './discard-card.png'
import dreadnought from './dreadnought.png'
import geneticMarkerOne from './genetic-marker-one.png'
import geneticMarkerTwo from './genetic-marker-two.png'
import research from './research.png'
import specimen from './specimen.png'
import tleilaxu from './tleilaxu.png'
import trashIntrigue from './trash-intrigue.png'
import unit from './unit.png'
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
import { INFLUENCE_ICONS, type InfluenceIconId } from './influence'
import victoryPoint from './victory-point.png'
import water from './water.png'

/**
 * Iconos recortados de la hoja de símbolos por `scripts/prepare_assets.py`.
 *
 * `solari`, `spice` y `persuasion` vienen sin número: la cantidad la dibuja
 * la app encima.
 *
 * Los `influence-*` sin facción son los genéricos con "?" ("la facción que
 * elijas"); los rombos por facción se agregan desde `./influence`, donde se
 * generan por composición.
 */
const BASE_ICONS = {
  'victory-point': { url: victoryPoint, label: 'Punto de victoria' },
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

  // Rise of Ix
  'acquire-tech': { url: acquireTech, label: 'Ix · Adquirir tecnología' },
  'acquire-tech-discount-one': {
    url: acquireTechDiscountOne,
    label: 'Ix · Adquirir tecnología (−1 especia)',
  },
  dreadnought: { url: dreadnought, label: 'Ix · Dreadnought' },
  unit: { url: unit, label: 'Ix · Unidad (tropa o dreadnought)' },
  'discard-card': { url: discardCard, label: 'Ix · Descartar una carta' },

  // Immortality
  research: { url: research, label: 'Immortality · Investigación' },
  tleilaxu: { url: tleilaxu, label: 'Immortality · Tleilaxu' },
  specimen: { url: specimen, label: 'Immortality · Espécimen' },
  combat: { url: combat, label: 'Immortality · Combate' },
  'trash-intrigue': { url: trashIntrigue, label: 'Immortality · Descartar intriga' },
  'genetic-marker-one': {
    url: geneticMarkerOne,
    label: 'Immortality · Marcador genético 1',
  },
  'genetic-marker-two': {
    url: geneticMarkerTwo,
    label: 'Immortality · Marcador genético 2',
  },
} as const

export const ICONS: Record<IconId, { url: string; label: string }> = {
  ...BASE_ICONS,
  ...INFLUENCE_ICONS,
}

export type IconId = keyof typeof BASE_ICONS | InfluenceIconId

export const ICON_IDS = Object.keys(ICONS) as IconId[]

/**
 * Los iconos que vienen vacíos necesitan que la app les dibuje la cantidad
 * encima. El valor es el color del número, elegido para contrastar con el
 * fondo del icono: el solari es plateado, la especia naranja y la persuasión
 * azul.
 */
export const ICON_NUMBER_COLORS: Partial<Record<IconId, string>> = {
  solari: '#2b2b2b',
  spice: '#ffffff',
  persuasion: '#ffffff',
}

export const iconTakesNumber = (icon: IconId) => icon in ICON_NUMBER_COLORS
