import ICON_SIZES from '../assets/icons/sizes.json'
import type { ContentPart } from '../model/card'
import { CONTENT } from './constants'
import { fontSizeForCapHeight, textWidth } from './text'

/** Tamaño natural de cada icono, generado por `scripts/prepare_assets.py`. */
const SIZES: Record<string, number[]> = ICON_SIZES

export type Box = { top: number; bottom: number }

export type Placement =
  | { kind: 'icon'; icon: string; amount: number; x: number; y: number; width: number; height: number }
  | { kind: 'text'; text: string; x: number; baseline: number; size: number }

/**
 * Una pieza medida, todavía sin ubicar, en la escala nominal (icono = 99 px).
 * El texto se parte en palabras porque el corte de renglón es por palabra.
 */
type Item =
  | { kind: 'icon'; icon: string; amount: number; width: number; height: number }
  | { kind: 'word'; text: string; width: number }
  | { kind: 'break' }

const NOMINAL_FONT = fontSizeForCapHeight(CONTENT.text.capHeight, CONTENT.text.weight)
const SPACE = textWidth(' ', NOMINAL_FONT, CONTENT.text.weight)

function measure(parts: ContentPart[]): Item[] {
  return parts.flatMap((part): Item[] => {
    if (part.type === 'break') return [{ kind: 'break' }]

    if (part.type === 'icon') {
      const [width, height] = SIZES[part.icon] ?? [
        CONTENT.nominalIconHeight,
        CONTENT.nominalIconHeight,
      ]
      return [{ kind: 'icon', icon: part.icon, amount: part.amount, width, height }]
    }

    return part.text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        kind: 'word',
        text: word,
        width: textWidth(word, NOMINAL_FONT, CONTENT.text.weight),
      }))
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
export function layoutContent(parts: ContentPart[], box: Box): Placement[] {
  const items = measure(parts)
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

    const flush = () => {
      if (!run.length) return
      placements.push({
        kind: 'text',
        text: run.join(' '),
        x: runStart,
        baseline: middle + (CONTENT.text.capHeight * scale) / 2,
        size: NOMINAL_FONT * scale,
      })
      run = []
    }

    line.items.forEach((item, position) => {
      if (item.kind === 'break') return
      x += separation(line.items[position - 1], item) * scale

      if (item.kind === 'word') {
        if (!run.length) runStart = x
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
