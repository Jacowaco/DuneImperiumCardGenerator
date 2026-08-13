import type { IconId } from '../assets/icons'
import { emptyCard, PLAY_ROWS, type Card, type ContentPart, type Faction } from './card'
import type { CustomFaction } from './customFaction'
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
 * Lo que se guarda y lo que se edita: las cartas, y los iconos y facciones
 * propios que este mazo tiene disponibles.
 *
 * Los iconos van al lado de las cartas y no adentro de cada una porque un mazo
 * con reglas custom los usa en varias, y así el PNG viaja una sola vez.
 *
 * Son **la lista del mazo**, no un resumen de lo que las cartas usan: se traen
 * a mano desde la biblioteca (o se suben), pueden estar sin usar todavía, y
 * son los que el selector de las cajas ofrece. Por eso el archivo los guarda
 * tal como están — lo que se ve acá es exactamente lo que se va a ver al
 * abrirlo en otra máquina.
 */
export type Deck = {
  /** El nombre que ve el usuario, independiente del archivo: se edita desde la
   *  barra de arriba y no tiene por qué coincidir con cómo se guardó. */
  name: string | null
  cards: Card[]
  icons: CustomIcon[]
  factions: CustomFaction[]
}

export const emptyDeck = (): Deck => ({ name: null, cards: [emptyCard()], icons: [], factions: [] })

type SavedFile = {
  format: 'dune-imperium-card'
  version: 8
  name: string | null
  cards: Card[]
  icons: CustomIcon[]
  factions: CustomFaction[]
  /**
   * Las bibliotecas enteras, y no sólo lo que las cartas usan — opcionales,
   * para cuando el usuario elige compartir un solo archivo con mazo y
   * bibliotecas juntos (el toggle "Incluir biblioteca" del pie de la
   * galería). Ausentes en un guardado normal.
   */
  library?: CustomIcon[]
  factionLibrary?: CustomFaction[]
}

/** La versión 1 guardaba una sola carta. */
type LegacyFile = { format: string; version?: number; card?: Card }

export function serializeDeck(
  deck: Deck,
  options?: { library?: CustomIcon[]; factionLibrary?: CustomFaction[] },
): string {
  const file: SavedFile = {
    format: 'dune-imperium-card',
    version: 8,
    name: deck.name,
    cards: deck.cards,
    icons: deck.icons,
    factions: deck.factions,
    library: options?.library,
    factionLibrary: options?.factionLibrary,
  }
  return JSON.stringify(file, null, 2)
}

/**
 * Los campos que falten se completan con los de una carta vacía, así los
 * archivos guardados con versiones viejas siguen abriendo cuando el modelo
 * crece.
 */
export function parseDeck(
  json: string,
): { deck: Deck; library: CustomIcon[]; factionLibrary: CustomFaction[] } {
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

  // Hasta la versión 3 no había iconos propios, hasta la 4 no había nombre
  // propio y hasta la 7 no había facciones propias: los archivos viejos abren
  // con el catálogo del PSD y sin nombre, así que la barra de arriba cae al
  // del archivo.
  return {
    deck: {
      name: file.name ?? null,
      cards: cards.map((card) => migrate({ ...emptyCard(), ...card })),
      icons: file.icons ?? [],
      factions: file.factions ?? [],
    },
    // Sólo las trae un archivo guardado con el toggle de biblioteca prendido.
    library: file.library ?? [],
    factionLibrary: file.factionLibrary ?? [],
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

export function downloadDeck(deck: Deck, library?: CustomIcon[], factionLibrary?: CustomFaction[]) {
  // Un mazo de una sola carta se guarda con el nombre de esa carta; varios,
  // con un nombre genérico, porque no hay uno mejor que elegir.
  const name = deck.cards.length === 1 ? deck.cards[0].title.trim() || 'carta' : 'mazo'
  downloadText(
    serializeDeck(deck, { library, factionLibrary }),
    `${fileSafe(name)}${FILE_EXTENSION}`,
  )
}

/**
 * Bajar un archivo, que es lo que queda cuando el navegador no deja escribir
 * donde el usuario elija (Firefox, Safari, la vista previa embebida del
 * editor). Lo usan el mazo y la biblioteca.
 */
export function downloadText(text: string, fileName: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
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
    return parseDeck(json).deck
  } catch {
    return null
  }
}
