import { ART_RECT } from '../render/constants'
import type { ArtTransform, CardArt } from './card'

export const MIN_ART_SCALE = 0.05
export const MAX_ART_SCALE = 8

export const clampArtScale = (scale: number) =>
  Math.min(MAX_ART_SCALE, Math.max(MIN_ART_SCALE, scale))

/**
 * Escala mínima para que la imagen cubra todo el Card Art Container
 * (equivalente a `object-fit: cover`), centrada en el recorte.
 */
export function fitCover(imageWidth: number, imageHeight: number): ArtTransform {
  const scale = Math.max(ART_RECT.width / imageWidth, ART_RECT.height / imageHeight)
  return centerAt(imageWidth, imageHeight, scale)
}

export function centerAt(
  imageWidth: number,
  imageHeight: number,
  scale: number,
): ArtTransform {
  return {
    scale,
    x: ART_RECT.x + (ART_RECT.width - imageWidth * scale) / 2,
    y: ART_RECT.y + (ART_RECT.height - imageHeight * scale) / 2,
  }
}

/**
 * Carga un archivo del usuario y lo encuadra para cubrir el contenedor.
 *
 * La imagen se guarda como data URL en vez de object URL para que el modelo
 * sea serializable tal cual: guardar la carta es un JSON.stringify.
 */
export function loadArtFromFile(file: File): Promise<CardArt> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error(`No se pudo leer el archivo: ${file.name}`))
    reader.onload = () => {
      const src = String(reader.result)
      const image = new Image()
      image.onerror = () => reject(new Error(`No es una imagen válida: ${file.name}`))
      image.onload = () =>
        resolve({
          src,
          width: image.width,
          height: image.height,
          transform: fitCover(image.width, image.height),
        })
      image.src = src
    }

    reader.readAsDataURL(file)
  })
}
