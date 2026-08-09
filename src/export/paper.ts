import type { Language } from '../model/language'
import { CARD_HEIGHT, CARD_WIDTH } from '../render/constants'

/**
 * Tamaños de papel y cómo entran las cartas en cada uno.
 *
 * Todo se calcula en píxeles a 300 DPI, que es la resolución del template: así
 * la carta se dibuja píxel a píxel y mide exactamente 63,5 × 88 mm en el papel.
 * El PDF después declara la hoja en su tamaño físico, así que nadie la puede
 * escalar por error.
 */

const DPI = 300
export const MM = DPI / 25.4

export const mm = (value: number) => Math.round(value * MM)

export type PaperId = 'a4' | 'letter' | 'a3' | 'sra3'

export const PAPERS: Record<
  PaperId,
  { label: Record<Language, string>; widthMm: number; heightMm: number }
> = {
  a4: { label: { es: 'A4', en: 'A4' }, widthMm: 210, heightMm: 297 },
  letter: { label: { es: 'Carta', en: 'Letter' }, widthMm: 215.9, heightMm: 279.4 },
  a3: { label: { es: 'A3', en: 'A3' }, widthMm: 297, heightMm: 420 },
  sra3: { label: { es: 'SRA3', en: 'SRA3' }, widthMm: 320, heightMm: 450 },
}

export const PAPER_IDS = Object.keys(PAPERS) as PaperId[]

/**
 * Sangrado: cada carta se dibuja 3 mm más grande de negro por lado.
 *
 * No inventa nada — el borde de la carta ya es negro sólido, con 2 mm de negro
 * antes de que empiece el contenido —, y es lo que hace que una guillotina
 * corrida 1 mm deje negro en vez de un filo blanco. Los 3 mm son el estándar
 * que pide cualquier imprenta.
 */
export const BLEED = mm(3)

/**
 * Muchas impresoras no imprimen los primeros milímetros del papel, así que las
 * marcas de corte se mantienen adentro de este margen o no salen. Es también
 * el motivo por el que el largo de la marca se calcula y no es fijo: en Carta
 * el margen de arriba es la mitad que en A4.
 */
const SAFE_EDGE = mm(4)
export const MARK_GAP = mm(0.5)
const MARK_MIN = mm(2)
const MARK_MAX = mm(4)

export const MARK_WIDTH = 2

/** Lo que hay que reservar de cada lado para que la marca entre y se imprima. */
const MIN_MARGIN = SAFE_EDGE + MARK_GAP + MARK_MIN

/** Largo de marca que entra en un margen dado, o 0 si no entra ninguna. */
const markLength = (margin: number) => {
  const room = margin - SAFE_EDGE - MARK_GAP
  return room < MARK_MIN ? 0 : Math.min(room, MARK_MAX)
}

export type Imposition = {
  paper: PaperId
  bleed: boolean
  /** Tamaño de la hoja en píxeles a 300 DPI. */
  width: number
  height: number
  /** Paso de la grilla: la carta, más el sangrado de los dos lados si lo hay. */
  pitchX: number
  pitchY: number
  columns: number
  rows: number
  perSheet: number
}

/**
 * Cuántas cartas entran en la hoja. Con sangrado el paso crece 6 mm en cada
 * eje, así que en A4 se pasa de nueve cartas a seis — por eso el sangrado va
 * con hojas grandes y las de casa van pegadas.
 */
export function impose(paper: PaperId, bleed: boolean): Imposition {
  const { widthMm, heightMm } = PAPERS[paper]
  const width = mm(widthMm)
  const height = mm(heightMm)

  const pitchX = CARD_WIDTH + (bleed ? 2 * BLEED : 0)
  const pitchY = CARD_HEIGHT + (bleed ? 2 * BLEED : 0)

  const columns = Math.max(1, Math.floor((width - 2 * MIN_MARGIN) / pitchX))
  const rows = Math.max(1, Math.floor((height - 2 * MIN_MARGIN) / pitchY))

  return {
    paper,
    bleed,
    width,
    height,
    pitchX,
    pitchY,
    columns,
    rows,
    perSheet: columns * rows,
  }
}

export const sheetCount = (cards: number, { perSheet }: Imposition) =>
  Math.max(1, Math.ceil(cards / perSheet))

export type PageLayout = {
  /** Bloque de cartas dentro de la hoja, sangrado incluido. */
  left: number
  top: number
  right: number
  bottom: number
  columns: number
  rows: number
  /** Líneas de corte, en píxeles de la hoja. Con sangrado son dos por carta. */
  trimX: number[]
  trimY: number[]
  /** Largo de las marcas de cada eje, ya recortado a lo que la impresora imprime. */
  markX: number
  markY: number
}

/**
 * Ubica las cartas de una página. El bloque va **centrado**: la última página
 * puede tener menos cartas y así queda igual de encuadrada que las demás, que
 * es lo que importa porque cada hoja se corta por separado.
 */
export function layoutPage(count: number, imposition: Imposition): PageLayout {
  const { width, height, pitchX, pitchY, bleed } = imposition

  const columns = Math.min(count, imposition.columns)
  const rows = Math.ceil(count / imposition.columns)

  const left = Math.round((width - columns * pitchX) / 2)
  const top = Math.round((height - rows * pitchY) / 2)

  // Sin sangrado las cartas están pegadas y comparten el corte, así que hay una
  // línea por borde de grilla. Con sangrado cada carta tiene las suyas.
  const inset = bleed ? BLEED : 0
  const trimX = bleed
    ? Array.from({ length: columns }, (_, column) => left + column * pitchX + inset).flatMap(
        (x) => [x, x + CARD_WIDTH],
      )
    : Array.from({ length: columns + 1 }, (_, column) => left + column * pitchX)

  const trimY = bleed
    ? Array.from({ length: rows }, (_, row) => top + row * pitchY + inset).flatMap((y) => [
        y,
        y + CARD_HEIGHT,
      ])
    : Array.from({ length: rows + 1 }, (_, row) => top + row * pitchY)

  return {
    left,
    top,
    right: left + columns * pitchX,
    bottom: top + rows * pitchY,
    columns,
    rows,
    trimX,
    trimY,
    // Las marcas de las líneas verticales viven en el margen de arriba y abajo,
    // y al revés: por eso cada eje se mide contra el margen que le toca.
    markX: markLength(top),
    markY: markLength(left),
  }
}

/** Dónde va la carta `index` de la página, en la esquina de su zona de corte. */
export const cardPosition = (index: number, layout: PageLayout, imposition: Imposition) => ({
  x: layout.left + (index % imposition.columns) * imposition.pitchX,
  y: layout.top + Math.floor(index / imposition.columns) * imposition.pitchY,
})
