import { PLAY_ROWS, type Card, type ContentPart, type PlayRows } from '../model/card'
import type { IconLibrary } from '../model/iconLibrary'
import { CONTENT } from './constants'
import { fontSizeForCapHeight, textWidth } from './text'

export type Box = { top: number; bottom: number }

/**
 * De qué pieza de la lista salió lo que se dibujó, y en qué renglón cayó.
 *
 * El render no lo usa: es para poder manipular el contenido **desde la
 * carta** — agarrar un icono donde se lo ve, y saber entre qué dos piezas
 * cae el puntero al soltar. Un texto se dibuja de a corridas de palabras que
 * pueden venir de varias piezas seguidas, así que lleva un rango
 * (`from`–`to`) y no un índice solo.
 */
type Origin = {
  from: number
  to: number
  /** Borde de arriba y alto del renglón, ya en escala de carta. */
  lineTop: number
  lineHeight: number
}

export type Placement = Origin &
  (
    | { kind: 'icon'; icon: string; amount: number; x: number; y: number; width: number; height: number }
    | {
        kind: 'text'
        text: string
        x: number
        baseline: number
        size: number
        width: number
        /** Relleno de una pieza vacía: se dibuja atenuado y no sale en el PNG. */
        placeholder?: boolean
      }
  )

/**
 * Una pieza medida, todavía sin ubicar, en la escala nominal (icono = 99 px).
 * El texto se parte en palabras porque el corte de renglón es por palabra.
 *
 * `part` es de qué pieza de la lista salió: una palabra no se puede devolver
 * sola al modelo, pero sí decir junto a cuál de las piezas cayó.
 */
type Item =
  | { kind: 'icon'; icon: string; amount: number; width: number; height: number; part: number }
  | { kind: 'word'; text: string; width: number; part: number; placeholder?: boolean }
  | { kind: 'break'; part: number }

const NOMINAL_FONT = fontSizeForCapHeight(CONTENT.text.capHeight, CONTENT.text.weight)
const SPACE = textWidth(' ', NOMINAL_FONT, CONTENT.text.weight)

const word = (text: string, part: number): Item => ({
  kind: 'word',
  text,
  width: textWidth(text, NOMINAL_FONT, CONTENT.text.weight),
  part,
})

/**
 * `placeholder` es la palabra con la que se dibuja una pieza de texto todavía
 * vacía. Sin ella la pieza no ocupa nada, que es lo que corresponde al
 * exportar; con ella se la ve en la carta y se la puede agarrar apenas se la
 * suelta, que es lo que hace falta mientras se edita.
 */
function measure(parts: ContentPart[], library: IconLibrary, placeholder?: string): Item[] {
  return parts.flatMap((part, index): Item[] => {
    if (part.type === 'break') return [{ kind: 'break', part: index }]

    if (part.type === 'icon') {
      // Un icono propio que ya no está en el mazo no reserva lugar: dejar el
      // hueco vacío se vería como un error de layout y no como lo que es.
      const entry = library[part.icon]
      if (!entry) return []
      const { width, height } = entry
      return [{ kind: 'icon', icon: part.icon, amount: part.amount, width, height, part: index }]
    }

    const text = part.text.trim()
    if (!text) return placeholder ? [{ ...word(placeholder, index), placeholder: true }] : []

    return text.split(/\s+/).map((item) => word(item, index))
  })
}

type Line = { items: Item[]; width: number; height: number }

/**
 * Separación entre dos piezas contiguas. Entre palabras es un espacio normal;
 * en cuanto hay un icono de por medio se usa el hueco más grande, porque un
 * icono pegado a una palabra se lee mal.
 *
 * Tiene que dar lo mismo acá y al ubicar las piezas: si las dos cuentas no
 * coinciden, el renglón queda descentrado.
 */
const separation = (previous: Item | undefined, item: Item) => {
  if (!previous) return 0
  return previous.kind === 'word' && item.kind === 'word' ? SPACE : CONTENT.gap
}

/** Corte de renglón codicioso: se llena hasta que no entra y se sigue abajo. */
function wrap(items: Item[], maxWidth: number): Line[] {
  const lines: Line[] = []
  let current: Line = { items: [], width: 0, height: CONTENT.text.lineHeight }

  const push = () => {
    lines.push(current)
    current = { items: [], width: 0, height: CONTENT.text.lineHeight }
  }

  for (const item of items) {
    if (item.kind === 'break') {
      push()
      continue
    }

    const gap = separation(current.items.at(-1), item)
    if (current.items.length && current.width + gap + item.width > maxWidth) push()

    current.width += separation(current.items.at(-1), item) + item.width
    current.items.push(item)
    if (item.kind === 'icon') current.height = Math.max(current.height, item.height)
  }

  if (current.items.length) lines.push(current)
  return lines
}

const blockHeight = (lines: Line[]) => lines.reduce((total, line) => total + line.height, 0)

/**
 * Acomoda el contenido centrado dentro de la caja.
 *
 * La escala se busca probando: al achicar entra más texto por renglón, así que
 * el corte de línea cambia y hay que rehacerlo. Se arranca a tamaño completo y
 * se baja hasta que el bloque entra a lo alto.
 */
export function layoutContent(
  parts: ContentPart[],
  box: Box,
  library: IconLibrary,
): Placement[] {
  const items = measure(parts, library)
  if (!items.length) return []

  const maxWidth = CONTENT.right - CONTENT.left - CONTENT.paddingX * 2
  const maxHeight = box.bottom - box.top - CONTENT.padding * 2

  let scale = 1
  let lines = wrap(items, maxWidth)
  while (blockHeight(lines) * scale > maxHeight && scale > 0.2) {
    scale -= 0.02
    lines = wrap(items, maxWidth / scale)
  }

  const centerX = (CONTENT.left + CONTENT.right) / 2
  const placements: Placement[] = []
  let y = (box.top + box.bottom) / 2 - (blockHeight(lines) * scale) / 2

  for (const line of lines) {
    const lineHeight = line.height * scale
    const middle = y + lineHeight / 2
    let x = centerX - (line.width * scale) / 2

    // Las palabras seguidas se dibujan de una sola vez, para no perder el
    // espaciado natural entre ellas al posicionarlas una por una.
    let run: string[] = []
    let runStart = x
    let runFrom = 0
    let runTo = 0

    const flush = () => {
      if (!run.length) return
      placements.push({
        kind: 'text',
        text: run.join(' '),
        x: runStart,
        baseline: middle + (CONTENT.text.capHeight * scale) / 2,
        size: NOMINAL_FONT * scale,
        width: x - runStart,
        from: runFrom,
        to: runTo,
        lineTop: y,
        lineHeight,
      })
      run = []
    }

    line.items.forEach((item, position) => {
      if (item.kind === 'break') return
      x += separation(line.items[position - 1], item) * scale

      if (item.kind === 'word') {
        if (!run.length) {
          runStart = x
          runFrom = item.part
        }
        runTo = item.part
        run.push(item.text)
        x += item.width * scale
        return
      }

      flush()
      const width = item.width * scale
      const height = item.height * scale
      placements.push({
        kind: 'icon',
        icon: item.icon,
        amount: item.amount,
        x,
        y: middle - height / 2,
        width,
        height,
        from: item.part,
        to: item.part,
        lineTop: y,
        lineHeight,
      })
      x += width
    })

    flush()
    y += lineHeight
  }

  return placements
}

/** Área útil de la caja del turno de agente para una altura dada. */
export const playBox = (rows: number): Box => ({
  top: CONTENT.play.top,
  bottom: CONTENT.play.bottoms[rows],
})

/**
 * Área útil de la banda de revelación: lo que queda debajo de la caja de play.
 * Con una sola fila la caja termina antes de que empiece la banda, así que ahí
 * manda el tope de la banda.
 */
export const revealBox = (rows: number): Box => ({
  top: Math.max(CONTENT.play.bottoms[rows], CONTENT.reveal.top),
  bottom: CONTENT.reveal.bottom,
})

/**
 * La caja de play más chica de las tres donde el contenido entra a tamaño
 * completo (sin que `layoutContent` tenga que achicarlo). Si ni la más grande
 * alcanza, se devuelve esa igual — el achique automático se hace cargo.
 */
export function autoPlayRows(parts: ContentPart[], library: IconLibrary): PlayRows {
  const items = measure(parts, library)
  if (!items.length) return PLAY_ROWS[0]

  const maxWidth = CONTENT.right - CONTENT.left - CONTENT.paddingX * 2
  const height = blockHeight(wrap(items, maxWidth))

  for (const rows of PLAY_ROWS) {
    const box = playBox(rows)
    if (height <= box.bottom - box.top - CONTENT.padding * 2) return rows
  }
  return PLAY_ROWS[PLAY_ROWS.length - 1]
}

/** Alto de caja que efectivamente se dibuja, según si el ajuste automático está prendido. */
export function effectivePlayRows(
  card: Pick<Card, 'playRows' | 'playRowsAuto' | 'playContent'>,
  library: IconLibrary,
): PlayRows {
  return card.playRowsAuto ? autoPlayRows(card.playContent, library) : card.playRows
}
