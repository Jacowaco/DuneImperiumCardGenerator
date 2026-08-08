import type { IconId } from '../assets/icons'

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

export const FACTION_IDS = Object.keys(FACTIONS) as Faction[]

/**
 * El modelo de la carta. Es la única fuente de verdad: el render es una
 * función pura de este objeto, así que guardar / cargar / exportar en lote
 * es simplemente serializar esto.
 */
export type Card = {
  title: string
  /** Cartas del mazo inicial: llevan el rombo antes del nombre. */
  starting: boolean
  faction: Faction | null
  /** null = carta sin costo de compra (las del mazo inicial, por ejemplo). */
  cost: number | null
  /** Icono del beneficio de compra. Si hay uno, se dibuja la cinta larga. */
  purchaseBenefit: IconId | null
  art: CardArt | null
}

export const emptyCard = (): Card => ({
  title: '',
  starting: false,
  faction: null,
  cost: null,
  purchaseBenefit: null,
  art: null,
})
