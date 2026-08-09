import type { IconId } from '../assets/icons'
import type { AgentIcon, AgentIconStyle } from '../assets/icons/agents'
import type { CustomIconId } from './customIcon'
import type { Language } from './language'

/**
 * Un icono de la carta: alguno de los del PSD o uno que haya subido el usuario
 * al mazo. Los dos se nombran igual desde la carta; quién es cuál lo resuelve
 * el catálogo (`iconLibrary.ts`).
 */
export type AnyIconId = IconId | CustomIconId

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

/**
 * El orden de este objeto **es** el orden canónico de las facciones: en él se
 * apilan las bandas de una carta de varias facciones y en él se muestran los
 * botones del panel. Confirmado contra siete pares de cartas reales de dos y
 * tres facciones de `reference/cards/` (p.ej. *Throne Room Politics*, *Keys to
 * Power*, *Imperium Ceremony*, *Satellite Ban*): en todas, la de arriba es la
 * que aparece antes en esta lista.
 */
export type Faction = 'emperor' | 'spacing-guild' | 'bene-gesserit' | 'fremen'

export const FACTIONS: Record<Faction, Record<Language, string>> = {
  emperor: { es: 'Emperador', en: 'Emperor' },
  'spacing-guild': { es: 'Cofradía Espacial', en: 'Spacing Guild' },
  'bene-gesserit': { es: 'Bene Gesserit', en: 'Bene Gesserit' },
  fremen: { es: 'Fremen', en: 'Fremen' },
}

/**
 * Una pieza del contenido de una caja. Los iconos y el texto van mezclados en
 * la misma línea, como en las cartas reales ("<icono> 2 Influence : <icono>"),
 * y el layout los va acomodando en renglones.
 */
export type ContentPart =
  /** `amount` sólo lo usan los iconos que salen vacíos del PSD; el resto lo ignora. */
  | { type: 'icon'; icon: AnyIconId; amount: number }
  | { type: 'text'; text: string }
  /** Corta el renglón a mano, para cuando el acomodo automático no alcanza. */
  | { type: 'break' }

export const iconPart = (icon: AnyIconId): ContentPart => ({ type: 'icon', icon, amount: 1 })
export const textPart = (text = ''): ContentPart => ({ type: 'text', text })

/**
 * Alturas disponibles de la caja del turno de agente, en filas de iconos.
 * No hay opción de sacarla: todas las cartas la llevan, aunque esté vacía.
 */
export const PLAY_ROWS = [1, 2, 3] as const
export type PlayRows = (typeof PLAY_ROWS)[number]

/**
 * Cómo se llaman esas alturas en la UI. El número de filas es cómo está hecha
 * la caja, no cómo se elige: lo que se ve es una caja más chica o más grande.
 */
export const PLAY_ROWS_LABELS: Record<PlayRows, Record<Language, string>> = {
  1: { es: 'Chica', en: 'Small' },
  2: { es: 'Media', en: 'Medium' },
  3: { es: 'Grande', en: 'Large' },
}

export const FACTION_IDS = Object.keys(FACTIONS) as Faction[]

/**
 * Color de cada facción, muestreado del extremo izquierdo de su banda en
 * `src/assets/layers/faction-*.png` (la banda degrada hacia negro a la
 * derecha, así que ese píxel es el color "puro"). Sólo lo usa la UI: en la
 * carta el color viene dentro del PNG.
 */
export const FACTION_COLORS: Record<Faction, string> = {
  'bene-gesserit': '#77588B',
  'spacing-guild': '#CD3A3D',
  emperor: '#636363',
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
  purchaseBenefit: AnyIconId | null
  /**
   * Cantidad dibujada encima del icono del beneficio. Sólo la usan los iconos
   * que salen vacíos del PSD (`iconTakesNumber`); para el resto se ignora.
   */
  purchaseBenefitAmount: number
  /** Dónde se puede mandar el agente. Se apilan en la columna izquierda. */
  agentIcons: AgentIcon[]
  agentIconStyle: AgentIconStyle
  /**
   * Alto de la caja del turno de agente, en filas de iconos. La caja siempre
   * está: arranca en y=696 y crece hacia abajo, tapando la banda de reveal que
   * tiene debajo — por eso no hace falta una banda de reveal por altura.
   *
   * Sólo se usa con `playRowsAuto` en `false`: con el ajuste automático
   * prendido, la altura efectiva sale de `autoPlayRows` y este valor queda
   * de respaldo para cuando el usuario lo apaga.
   */
  playRows: PlayRows
  /**
   * Si está prendido (default), el alto de la caja de play sale solo del
   * contenido: la más chica que entra sin achicar el texto/iconos. Apagarlo
   * deja elegir `playRows` a mano.
   */
  playRowsAuto: boolean
  /** La silueta negra del agente, al costado izquierdo de la caja de play. */
  agentSilhouette: boolean
  /** Iconos dentro de cada caja, en el orden en que se dibujan. */
  playContent: ContentPart[]
  revealContent: ContentPart[]
  art: CardArt | null
  /**
   * Marca de "ya está terminada", para saber cuáles del mazo no hay que tocar
   * más. Es una anotación de trabajo: no se dibuja ni sale en el PNG.
   */
  done: boolean
}

/** Los iconos que la carta nombra, sin repetir: contenido y beneficio de compra. */
export function cardIconIds(card: Card): Set<string> {
  const ids = new Set<string>()

  for (const part of [...card.playContent, ...card.revealContent]) {
    if (part.type === 'icon') ids.add(part.icon)
  }
  if (card.purchaseBenefit) ids.add(card.purchaseBenefit)

  return ids
}

export const emptyCard = (): Card => ({
  title: '',
  starting: false,
  factions: [],
  cost: 0,
  purchaseBenefit: null,
  purchaseBenefitAmount: 1,
  agentIcons: [],
  agentIconStyle: 'locations',
  playRows: 1,
  playRowsAuto: true,
  agentSilhouette: true,
  playContent: [],
  revealContent: [],
  art: null,
  done: false,
})
