import type { IconId } from '../assets/icons'
import { emptyCard, PLAY_ROWS, type Card, type ContentPart, type Faction } from './card'

/**
 * El mazo se guarda como JSON plano. Las imágenes viajan adentro como data
 * URL, así que el archivo es autocontenido: se puede pasar a otra máquina y
 * abre igual, sin adjuntos sueltos.
 */
export const FILE_EXTENSION = '.dune.json'

const AUTOSAVE_KEY = 'dune-card-generator:card'

type SavedFile = {
  format: 'dune-imperium-card'
  version: 3
  cards: Card[]
}

/** La versión 1 guardaba una sola carta. */
type LegacyFile = { format: string; version?: number; card?: Card }

export function serializeDeck(cards: Card[]): string {
  const file: SavedFile = { format: 'dune-imperium-card', version: 3, cards }
  return JSON.stringify(file, null, 2)
}

/**
 * Los campos que falten se completan con los de una carta vacía, así los
 * archivos guardados con versiones viejas siguen abriendo cuando el modelo
 * crece.
 */
export function parseDeck(json: string): Card[] {
  const parsed: unknown = JSON.parse(json)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as SavedFile).format !== 'dune-imperium-card'
  ) {
    throw new Error('El archivo no es una carta de Dune: Imperium.')
  }

  const file = parsed as SavedFile & LegacyFile
  const cards = file.cards ?? (file.card ? [file.card] : [])
  if (!cards.length) throw new Error('El archivo no tiene ninguna carta.')

  return cards.map((card) => migrate({ ...emptyCard(), ...card }))
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

export function downloadDeck(cards: Card[]) {
  // Un mazo de una sola carta se guarda con el nombre de esa carta; varios,
  // con un nombre genérico, porque no hay uno mejor que elegir.
  const name = cards.length === 1 ? cards[0].title.trim() || 'carta' : 'mazo'
  const blob = new Blob([serializeDeck(cards)], { type: 'application/json' })
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

export function saveAutosave(cards: Card[]) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, serializeDeck(cards))
  } catch {
    // Se llenó la cuota (imágenes grandes). No es motivo para romper la app.
  }
}

export function loadAutosave(): Card[] | null {
  const json = localStorage.getItem(AUTOSAVE_KEY)
  if (!json) return null
  try {
    return parseDeck(json)
  } catch {
    return null
  }
}
