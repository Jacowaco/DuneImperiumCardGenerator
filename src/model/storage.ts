import { emptyCard, PLAY_ROWS, type Card, type Faction } from './card'

/**
 * La carta se guarda como JSON plano. La imagen viaja adentro como data URL,
 * así que el archivo es autocontenido: se puede pasar a otra máquina y abre
 * igual, sin adjuntos sueltos.
 */
export const FILE_EXTENSION = '.dune.json'

const AUTOSAVE_KEY = 'dune-card-generator:card'

type SavedFile = {
  format: 'dune-imperium-card'
  version: 1
  card: Card
}

export function serializeCard(card: Card): string {
  const file: SavedFile = { format: 'dune-imperium-card', version: 1, card }
  return JSON.stringify(file, null, 2)
}

/**
 * Los campos que falten se completan con los de una carta vacía, así los
 * archivos guardados con versiones viejas siguen abriendo cuando el modelo
 * crece.
 */
export function parseCard(json: string): Card {
  const parsed: unknown = JSON.parse(json)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as SavedFile).format !== 'dune-imperium-card'
  ) {
    throw new Error('El archivo no es una carta de Dune: Imperium.')
  }

  return migrate({ ...emptyCard(), ...(parsed as SavedFile).card })
}

/**
 * Antes la carta tenía una sola facción, en singular, y las cajas de contenido
 * se podían sacar (`playRows: 0`, `revealBox: false`).
 */
type LegacyCard = Card & { faction?: Faction | null; revealBox?: boolean }

function migrate(card: LegacyCard): Card {
  if (!card.factions.length && card.faction) card.factions = [card.faction]
  delete card.faction

  if (!PLAY_ROWS.includes(card.playRows)) card.playRows = 1
  delete card.revealBox

  return card
}

export function downloadCard(card: Card) {
  const name = card.title.trim() || 'carta'
  const blob = new Blob([serializeCard(card)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${fileSafe(name)}${FILE_EXTENSION}`
  link.click()
  URL.revokeObjectURL(url)
}

/** Nombre de archivo sin caracteres que Windows rechaza. */
function fileSafe(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '-')
}

export function saveAutosave(card: Card) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, serializeCard(card))
  } catch {
    // Se llenó la cuota (imágenes grandes). No es motivo para romper la app.
  }
}

export function loadAutosave(): Card | null {
  const json = localStorage.getItem(AUTOSAVE_KEY)
  if (!json) return null
  try {
    return parseCard(json)
  } catch {
    return null
  }
}
