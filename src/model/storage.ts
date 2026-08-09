import type { IconId } from '../assets/icons'
import {
  cardIconIds,
  emptyCard,
  PLAY_ROWS,
  type Card,
  type ContentPart,
  type Faction,
} from './card'
import type { CustomIcon } from './customIcon'
import { AppError } from './errors'

/**
 * El mazo se guarda como JSON plano. Las imágenes viajan adentro como data
 * URL, así que el archivo es autocontenido: se puede pasar a otra máquina y
 * abre igual, sin adjuntos sueltos.
 */
export const FILE_EXTENSION = '.dune.json'

const AUTOSAVE_KEY = 'dune-card-generator:card'

/**
 * Lo que se guarda y lo que se edita: las cartas y los iconos propios.
 *
 * Los iconos van al lado de las cartas y no adentro de cada una porque un mazo
 * con reglas custom los usa en varias, y así el PNG viaja una sola vez.
 */
export type Deck = {
  /** El nombre que ve el usuario, independiente del archivo: se edita desde la
   *  barra de arriba y no tiene por qué coincidir con cómo se guardó. */
  name: string | null
  cards: Card[]
  icons: CustomIcon[]
}

export const emptyDeck = (): Deck => ({ name: null, cards: [emptyCard()], icons: [] })

type SavedFile = {
  format: 'dune-imperium-card'
  version: 5
  name: string | null
  cards: Card[]
  icons: CustomIcon[]
}

/** La versión 1 guardaba una sola carta. */
type LegacyFile = { format: string; version?: number; card?: Card }

/**
 * Los iconos propios que el archivo tiene que llevar: los que alguna carta
 * nombra.
 *
 * La lista de iconos es del usuario y vive en el navegador
 * (`iconStore.ts`), no del mazo; el archivo se lleva una copia de lo que usa
 * para seguir siendo autocontenido —abrirlo en otra máquina tiene que verse
 * igual— sin arrastrar toda la biblioteca en cada mazo.
 */
export function packIcons(cards: Card[], icons: CustomIcon[]): CustomIcon[] {
  const used = new Set(cards.flatMap((card) => [...cardIconIds(card)]))
  return icons.filter((icon) => used.has(icon.id))
}

export function serializeDeck(deck: Deck): string {
  const file: SavedFile = {
    format: 'dune-imperium-card',
    version: 5,
    name: deck.name,
    cards: deck.cards,
    icons: packIcons(deck.cards, deck.icons),
  }
  return JSON.stringify(file, null, 2)
}

/**
 * Los campos que falten se completan con los de una carta vacía, así los
 * archivos guardados con versiones viejas siguen abriendo cuando el modelo
 * crece.
 */
export function parseDeck(json: string): Deck {
  const parsed: unknown = JSON.parse(json)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as SavedFile).format !== 'dune-imperium-card'
  ) {
    throw new AppError('not-a-card')
  }

  const file = parsed as SavedFile & LegacyFile
  const cards = file.cards ?? (file.card ? [file.card] : [])
  if (!cards.length) throw new AppError('no-cards')

  // Hasta la versión 3 no había iconos propios, y hasta la 4 no había nombre
  // propio: los archivos viejos abren con el catálogo del PSD y sin nombre, así
  // que la barra de arriba cae al del archivo.
  return {
    name: file.name ?? null,
    cards: cards.map((card) => migrate({ ...emptyCard(), ...card })),
    icons: file.icons ?? [],
  }
}

/**
 * Antes la carta tenía una sola facción en singular, las cajas de contenido se
 * podían sacar (`playRows: 0`, `revealBox: false`), y el contenido era una
 * lista de iconos sueltos en vez de piezas mezcladas con texto.
 */
type LegacyCard = Card & {
  faction?: Faction | null
  revealBox?: boolean
  playIcons?: { icon: IconId; amount: number }[]
  revealIcons?: { icon: IconId; amount: number }[]
}

function migrate(card: LegacyCard): Card {
  if (!card.factions.length && card.faction) card.factions = [card.faction]
  delete card.faction

  if (!PLAY_ROWS.includes(card.playRows)) card.playRows = 1
  delete card.revealBox

  const toParts = (icons: { icon: IconId; amount: number }[]): ContentPart[] =>
    icons.map(({ icon, amount }) => ({ type: 'icon', icon, amount }))

  if (!card.playContent.length && card.playIcons) card.playContent = toParts(card.playIcons)
  if (!card.revealContent.length && card.revealIcons)
    card.revealContent = toParts(card.revealIcons)
  delete card.playIcons
  delete card.revealIcons

  return card
}

export function downloadDeck(deck: Deck) {
  // Un mazo de una sola carta se guarda con el nombre de esa carta; varios,
  // con un nombre genérico, porque no hay uno mejor que elegir.
  const name = deck.cards.length === 1 ? deck.cards[0].title.trim() || 'carta' : 'mazo'
  const blob = new Blob([serializeDeck(deck)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${fileSafe(name)}${FILE_EXTENSION}`
  link.click()
  URL.revokeObjectURL(url)
}

/** Nombre de archivo sin caracteres que Windows rechaza. */
export function fileSafe(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '-')
}

/**
 * El nombre del mazo es el del archivo sin la extensión: es lo que el usuario
 * escribió en el diálogo de guardar, y `.dune.json` no aporta nada a la vista.
 * Se sacan las dos extensiones que la app acepta al abrir, no sólo la propia.
 */
export function deckName(fileName: string) {
  const bare = fileName.endsWith(FILE_EXTENSION)
    ? fileName.slice(0, -FILE_EXTENSION.length)
    : fileName.replace(/\.json$/, '')
  return bare.trim() || fileName
}

export function saveAutosave(deck: Deck) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, serializeDeck(deck))
  } catch {
    // Se llenó la cuota (imágenes grandes). No es motivo para romper la app.
  }
}

export function loadAutosave(): Deck | null {
  const json = localStorage.getItem(AUTOSAVE_KEY)
  if (!json) return null
  try {
    return parseDeck(json)
  } catch {
    return null
  }
}
