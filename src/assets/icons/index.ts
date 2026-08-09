import acquireFoldspace from './acquire-foldspace.png'
import acquireTech from './acquire-tech.png'
import acquireTechDiscountOne from './acquire-tech-discount-one.png'
import combat from './combat.png'
import discardCard from './discard-card.png'
import freighter from './freighter.png'
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
import type { Language } from '../../model/language'

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
const label = (es: string, en: string): Record<Language, string> => ({ es, en })

const CORE_ICONS = {
  'victory-point': { url: victoryPoint, label: label('Punto de victoria', 'Victory Point') },
  water: { url: water, label: label('Agua', 'Water') },
  solari: { url: solari, label: label('Solari', 'Solari') },
  spice: { url: spice, label: label('Especia', 'Spice') },
  troop: { url: troop, label: label('Tropa', 'Troop') },
  'draw-card': { url: drawCard, label: label('Robar carta', 'Draw Card') },
  'draw-intrigue': { url: drawIntrigue, label: label('Robar intriga', 'Draw Intrigue') },
  trash: { url: trash, label: label('Descartar', 'Trash') },
  'acquire-foldspace': { url: acquireFoldspace, label: label('Foldspace', 'Foldspace') },
  'signet-ring': { url: signetRing, label: label('Anillo de sello', 'Signet Ring') },
  persuasion: { url: persuasion, label: label('Persuasión', 'Persuasion') },
  sword: { url: sword, label: label('Espada', 'Sword') },
  'influence-gain-one': {
    url: influenceGainOne,
    label: label('Ganar 1 influencia', 'Gain 1 Influence'),
  },
  'influence-gain-two': {
    url: influenceGainTwo,
    label: label('Ganar 2 influencia', 'Gain 2 Influence'),
  },
  'influence-lose-one': {
    url: influenceLoseOne,
    label: label('Perder 1 influencia', 'Lose 1 Influence'),
  },
  'influence-lose-two': {
    url: influenceLoseTwo,
    label: label('Perder 2 influencia', 'Lose 2 Influence'),
  },
  'cost-arrow': { url: costArrow, label: label('Flecha de costo', 'Cost Arrow') },
} as const

const IX_ICONS = {
  'acquire-tech': { url: acquireTech, label: label('Adquirir tecnología', 'Acquire Tech') },
  'acquire-tech-discount-one': {
    url: acquireTechDiscountOne,
    label: label('Adquirir tecnología (−1 especia)', 'Acquire Tech (−1 Spice)'),
  },
  freighter: { url: freighter, label: label('Carguero', 'Freighter') },
  unit: { url: unit, label: label('Acorazado', 'Unit') },
  'discard-card': { url: discardCard, label: label('Descartar una carta', 'Discard a Card') },
} as const

const IMMORTALITY_ICONS = {
  research: { url: research, label: label('Investigación', 'Research') },
  tleilaxu: { url: tleilaxu, label: label('Tleilaxu', 'Tleilaxu') },
  specimen: { url: specimen, label: label('Espécimen', 'Specimen') },
  combat: { url: combat, label: label('Combate', 'Combat') },
  'trash-intrigue': { url: trashIntrigue, label: label('Descartar intriga', 'Trash Intrigue') },
  'genetic-marker-one': {
    url: geneticMarkerOne,
    label: label('Marcador genético 1', 'Genetic Marker 1'),
  },
  'genetic-marker-two': {
    url: geneticMarkerTwo,
    label: label('Marcador genético 2', 'Genetic Marker 2'),
  },
} as const

const BASE_ICONS = { ...CORE_ICONS, ...IX_ICONS, ...IMMORTALITY_ICONS } as const

export const ICONS: Record<IconId, { url: string; label: Record<Language, string> }> = {
  ...BASE_ICONS,
  ...INFLUENCE_ICONS,
}

export type IconId = keyof typeof BASE_ICONS | InfluenceIconId

export const ICON_IDS = Object.keys(ICONS) as IconId[]

/** Para agrupar el selector de iconos del editor por expansión. */
export const IX_ICON_IDS = Object.keys(IX_ICONS) as IconId[]
export const IMMORTALITY_ICON_IDS = Object.keys(IMMORTALITY_ICONS) as IconId[]
export const INFLUENCE_ICON_IDS = Object.keys(INFLUENCE_ICONS) as IconId[]

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
