import type { IconId } from '../assets/icons'
import type { AgentIcon, AgentIconStyle } from '../assets/icons/agents'

/**
 * Encuadre de la imagen del jugador dentro del Card Art Container.
 * x / y son coordenadas del lienzo de la carta (750 x 1039), no del recorte.
 */
export type ArtTransform = {
  x: number
  y: number
  scale: number
}

export type CardArt = {
  /** object URL de la imagen cargada por el usuario */
  src: string
  /** tamaño natural del archivo, necesario para reencuadrar */
  width: number
  height: number
  transform: ArtTransform
}

export const FACTIONS = {
  emperor: 'Emperador',
  'spacing-guild': 'Cofradía Espacial',
  'bene-gesserit': 'Bene Gesserit',
  fremen: 'Fremen',
} as const

export type Faction = keyof typeof FACTIONS

/**
 * Un icono dentro de una caja de contenido. `amount` sólo lo usan los iconos
 * que salen vacíos del PSD (solari, especia, persuasión); el resto lo ignora.
 */
export type ContentEntry = {
  icon: IconId
  amount: number
}

/**
 * Alturas disponibles de la caja del turno de agente, en filas de iconos.
 * No hay opción de sacarla: todas las cartas la llevan, aunque esté vacía.
 */
export const PLAY_ROWS = [1, 2, 3] as const
export type PlayRows = (typeof PLAY_ROWS)[number]

export const FACTION_IDS = Object.keys(FACTIONS) as Faction[]

/**
 * Color de cada facción, muestreado del extremo izquierdo de su banda en
 * `src/assets/layers/faction-*.png` (la banda degrada hacia negro a la
 * derecha, así que ese píxel es el color "puro"). Sólo lo usa la UI: en la
 * carta el color viene dentro del PNG.
 */
export const FACTION_COLORS: Record<Faction, string> = {
  emperor: '#636363',
  'spacing-guild': '#CD3A3D',
  'bene-gesserit': '#77588B',
  fremen: '#6A81B9',
}

/**
 * El modelo de la carta. Es la única fuente de verdad: el render es una
 * función pura de este objeto, así que guardar / cargar / exportar en lote
 * es simplemente serializar esto.
 */
export type Card = {
  title: string
  /** Cartas del mazo inicial: llevan el rombo antes del nombre. */
  starting: boolean
  /**
   * Una carta puede pertenecer a más de una facción. Las bandas se apilan
   * hacia abajo siempre en el orden de `FACTION_IDS`, no en el que se
   * eligieron.
   */
  factions: Faction[]
  /** null = carta sin costo de compra (las del mazo inicial, por ejemplo). */
  cost: number | null
  /** Icono del beneficio de compra. Si hay uno, se dibuja la cinta larga. */
  purchaseBenefit: IconId | null
  /**
   * Cantidad dibujada encima del icono del beneficio. Sólo la usan los iconos
   * que salen vacíos del PSD (`iconTakesNumber`); para el resto se ignora.
   */
  purchaseBenefitAmount: number
  /** Dónde se puede mandar el agente. Se apilan en la columna izquierda. */
  agentIcons: AgentIcon[]
  agentIconStyle: AgentIconStyle
  /**
   * Alto de la caja del turno de agente, en filas de iconos. 0 la saca.
   * Arranca siempre en y=696 y crece hacia abajo, tapando la banda de reveal
   * que tiene debajo — por eso no hace falta una banda de reveal por altura.
   */
  playRows: PlayRows
  /** La silueta negra del agente, al costado izquierdo de la caja de play. */
  agentSilhouette: boolean
  revealBox: boolean
  /** Iconos dentro de cada caja, en el orden en que se dibujan. */
  playIcons: ContentEntry[]
  revealIcons: ContentEntry[]
  art: CardArt | null
}

export const emptyCard = (): Card => ({
  title: '',
  starting: false,
  factions: [],
  cost: null,
  purchaseBenefit: null,
  purchaseBenefitAmount: 1,
  agentIcons: [],
  agentIconStyle: 'locations',
  playRows: 1,
  agentSilhouette: true,
  revealBox: true,
  playIcons: [],
  revealIcons: [],
  art: null,
})
