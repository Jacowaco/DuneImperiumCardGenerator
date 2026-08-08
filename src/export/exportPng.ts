import type Konva from 'konva'
import { CARD_WIDTH } from '../render/constants'

/**
 * Los nodos con este nombre son ayudas visuales del editor y se ocultan
 * durante el export para que el PNG tenga sólo la carta.
 */
export const NO_EXPORT = 'no-export'

/**
 * Exporta el stage a PNG al tamaño real del template.
 *
 * `scale` 1 devuelve 750 x 1039 px, que es la carta a 300 DPI y ya sirve
 * para imprimir. El preview puede estar a cualquier escala: se compensa
 * con el pixelRatio.
 */
export async function exportCardPng(
  stage: Konva.Stage,
  { scale = 1, filename = 'carta.png' } = {},
): Promise<void> {
  const helpers = stage.find(`.${NO_EXPORT}`)
  helpers.forEach((node) => node.hide())

  try {
    const blob = (await stage.toBlob({
      pixelRatio: (CARD_WIDTH * scale) / stage.width(),
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
