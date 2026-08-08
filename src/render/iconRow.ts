import ICON_SIZES from '../assets/icons/sizes.json'
import type { ContentEntry } from '../model/card'
import { CONTENT } from './constants'

/** Tamaño natural de cada icono, generado por `scripts/prepare_assets.py`. */
const SIZES: Record<string, number[]> = ICON_SIZES

export type IconPlacement = {
  entry: ContentEntry
  x: number
  y: number
  width: number
  height: number
}

type Box = { top: number; bottom: number }

/**
 * Acomoda una fila de iconos centrada dentro de la caja.
 *
 * Todos se escalan con el **mismo factor**, no a la misma altura: en el arte
 * original no todos miden igual (la gota es más baja que el cubo de tropa) y
 * unificar la altura les cambiaría la proporción entre sí.
 */
export function layoutIconRow(entries: ContentEntry[], box: Box): IconPlacement[] {
  if (!entries.length) return []

  const available = box.bottom - box.top - CONTENT.padding * 2
  let scale = Math.min(available, CONTENT.nominalIconHeight) / CONTENT.nominalIconHeight

  const natural = entries.map((entry) => SIZES[entry.icon] ?? [CONTENT.nominalIconHeight, CONTENT.nominalIconHeight])
  const rowWidth = (factor: number) =>
    natural.reduce((total, [width]) => total + width * factor, 0) +
    CONTENT.gap * (entries.length - 1)

  // Si no entran a lo ancho, se achican todos por igual.
  const maxWidth = CONTENT.right - CONTENT.left
  if (rowWidth(scale) > maxWidth) {
    const icons = natural.reduce((total, [width]) => total + width, 0)
    scale = (maxWidth - CONTENT.gap * (entries.length - 1)) / icons
  }

  const centerY = (box.top + box.bottom) / 2
  let x = (CONTENT.left + CONTENT.right) / 2 - rowWidth(scale) / 2

  return entries.map((entry, index) => {
    const [naturalWidth, naturalHeight] = natural[index]
    const width = naturalWidth * scale
    const height = naturalHeight * scale
    const placement = { entry, x, y: centerY - height / 2, width, height }
    x += width + CONTENT.gap
    return placement
  })
}

/** Área útil de la caja del turno de agente para una altura dada. */
export const playBox = (rows: number): Box => ({
  top: CONTENT.play.top,
  bottom: CONTENT.play.bottoms[rows],
})

/**
 * Área útil de la banda de revelación: lo que queda debajo de la caja de play.
 * Si no hay caja de play, la banda se usa entera.
 */
export const revealBox = (rows: number): Box => ({
  top: rows > 0 ? CONTENT.play.bottoms[rows] : CONTENT.reveal.top,
  bottom: CONTENT.reveal.bottom,
})
