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
const label = (
  es: string,
  en: string,
  pt: string,
  fr: string,
  de: string,
): Record<Language, string> => ({ es, en, pt, fr, de })

const CORE_ICONS = {
  'victory-point': {
    url: victoryPoint,
    label: label('Punto de victoria', 'Victory Point', 'Ponto de Vitória', 'Point de Victoire', 'Siegpunkt'),
  },
  water: { url: water, label: label('Agua', 'Water', 'Água', 'Eau', 'Wasser') },
  solari: { url: solari, label: label('Solari', 'Solari', 'Solari', 'Solari', 'Solari') },
  spice: { url: spice, label: label('Especia', 'Spice', 'Especiaria', 'Épice', 'Spice') },
  troop: { url: troop, label: label('Tropa', 'Troop', 'Tropa', 'Troupe', 'Truppe') },
  'draw-card': {
    url: drawCard,
    label: label('Robar carta', 'Draw Card', 'Comprar carta', 'Piocher une carte', 'Karte ziehen'),
  },
  'draw-intrigue': {
    url: drawIntrigue,
    label: label(
      'Robar intriga',
      'Draw Intrigue',
      'Comprar intriga',
      'Piocher une intrigue',
      'Intrige ziehen',
    ),
  },
  trash: { url: trash, label: label('Descartar', 'Trash', 'Descartar', 'Détruire', 'Vernichten') },
  'acquire-foldspace': {
    url: acquireFoldspace,
    label: label('Foldspace', 'Foldspace', 'Foldspace', 'Foldspace', 'Foldspace'),
  },
  'signet-ring': {
    url: signetRing,
    label: label('Anillo de sello', 'Signet Ring', 'Anel de Sinete', 'Anneau sigillaire', 'Siegelring'),
  },
  persuasion: {
    url: persuasion,
    label: label('Persuasión', 'Persuasion', 'Persuasão', 'Persuasion', 'Überzeugung'),
  },
  sword: { url: sword, label: label('Espada', 'Sword', 'Espada', 'Épée', 'Schwert') },
  'influence-gain-one': {
    url: influenceGainOne,
    label: label(
      'Ganar 1 influencia',
      'Gain 1 Influence',
      'Ganhar 1 de influência',
      'Gagner 1 influence',
      'Erhalte 1 Einfluss',
    ),
  },
  'influence-gain-two': {
    url: influenceGainTwo,
    label: label(
      'Ganar 2 influencia',
      'Gain 2 Influence',
      'Ganhar 2 de influência',
      'Gagner 2 influence',
      'Erhalte 2 Einfluss',
    ),
  },
  'influence-lose-one': {
    url: influenceLoseOne,
    label: label(
      'Perder 1 influencia',
      'Lose 1 Influence',
      'Perder 1 de influência',
      'Perdre 1 influence',
      'Verliere 1 Einfluss',
    ),
  },
  'influence-lose-two': {
    url: influenceLoseTwo,
    label: label(
      'Perder 2 influencia',
      'Lose 2 Influence',
      'Perder 2 de influência',
      'Perdre 2 influence',
      'Verliere 2 Einfluss',
    ),
  },
  'cost-arrow': {
    url: costArrow,
    label: label('Flecha de costo', 'Cost Arrow', 'Seta de custo', 'Flèche de coût', 'Kostenpfeil'),
  },
} as const

const IX_ICONS = {
  'acquire-tech': {
    url: acquireTech,
    label: label(
      'Adquirir tecnología',
      'Acquire Tech',
      'Adquirir tecnologia',
      'Acquérir une technologie',
      'Technologie erwerben',
    ),
  },
  'acquire-tech-discount-one': {
    url: acquireTechDiscountOne,
    label: label(
      'Adquirir tecnología (−1 especia)',
      'Acquire Tech (−1 Spice)',
      'Adquirir tecnologia (−1 especiaria)',
      'Acquérir une technologie (−1 épice)',
      'Technologie erwerben (−1 Spice)',
    ),
  },
  freighter: { url: freighter, label: label('Carguero', 'Freighter', 'Cargueiro', 'Cargo', 'Frachter') },
  unit: { url: unit, label: label('Acorazado', 'Unit', 'Unidade', 'Unité', 'Einheit') },
  'discard-card': {
    url: discardCard,
    label: label(
      'Descartar una carta',
      'Discard a Card',
      'Descartar uma carta',
      'Défausser une carte',
      'Karte abwerfen',
    ),
  },
} as const

const IMMORTALITY_ICONS = {
  research: {
    url: research,
    label: label('Investigación', 'Research', 'Pesquisa', 'Recherche', 'Forschung'),
  },
  tleilaxu: { url: tleilaxu, label: label('Tleilaxu', 'Tleilaxu', 'Tleilaxu', 'Tleilaxu', 'Tleilaxu') },
  specimen: { url: specimen, label: label('Espécimen', 'Specimen', 'Espécime', 'Spécimen', 'Exemplar') },
  combat: { url: combat, label: label('Combate', 'Combat', 'Combate', 'Combat', 'Kampf') },
  'trash-intrigue': {
    url: trashIntrigue,
    label: label(
      'Descartar intriga',
      'Trash Intrigue',
      'Descartar intriga',
      'Détruire une intrigue',
      'Intrige vernichten',
    ),
  },
  'genetic-marker-one': {
    url: geneticMarkerOne,
    label: label(
      'Marcador genético 1',
      'Genetic Marker 1',
      'Marcador genético 1',
      'Marqueur génétique 1',
      'Genetischer Marker 1',
    ),
  },
  'genetic-marker-two': {
    url: geneticMarkerTwo,
    label: label(
      'Marcador genético 2',
      'Genetic Marker 2',
      'Marcador genético 2',
      'Marqueur génétique 2',
      'Genetischer Marker 2',
    ),
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
