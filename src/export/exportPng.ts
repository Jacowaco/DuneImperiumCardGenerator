import type Konva from 'konva'
import { CARD_WIDTH } from '../render/constants'

/**
 * Los nodos con este nombre son ayudas visuales del editor y se ocultan
 * durante el export para que el PNG tenga sólo la carta.
 */
export const NO_EXPORT = 'no-export'

/**
 * Escala fija del export: el template mide 750 x 1039 (300 DPI), así que
 * el PNG sale a 1500 x 2078 — 600 DPI, con margen de sobra para imprimir.
 */
export const EXPORT_SCALE = 2

/**
 * Exporta el stage a PNG. El preview puede estar a cualquier escala: se
 * compensa con el pixelRatio.
 */
export async function exportCardPng(
  stage: Konva.Stage,
  { filename = 'carta.png' } = {},
): Promise<void> {
  const helpers = stage.find(`.${NO_EXPORT}`)
  helpers.forEach((node) => node.hide())

  try {
    const blob = (await stage.toBlob({
      pixelRatio: (CARD_WIDTH * EXPORT_SCALE) / stage.width(),
      mimeType: 'image/png',
    })) as Blob

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    helpers.forEach((node) => node.show())
  }
}
