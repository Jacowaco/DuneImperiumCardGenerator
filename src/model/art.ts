import { ART_RECT } from '../render/constants'
import type { ArtTransform, CardArt } from './card'

export const MAX_ART_SCALE = 8

/**
 * Escala mínima para que la imagen cubra todo el Card Art Container
 * (equivalente a `object-fit: cover`). Es también el piso del zoom: por
 * debajo de acá el fondo del contenedor asoma por algún lado.
 */
export const coverScale = (imageWidth: number, imageHeight: number) =>
  Math.max(ART_RECT.width / imageWidth, ART_RECT.height / imageHeight)

/**
 * Techo del zoom. Una imagen muy chica necesita más de `MAX_ART_SCALE` sólo
 * para cubrir el recorte, así que el techo nunca queda por debajo del piso.
 */
export const maxArtScale = (imageWidth: number, imageHeight: number) =>
  Math.max(MAX_ART_SCALE, coverScale(imageWidth, imageHeight))

export const clampArtScale = (scale: number, imageWidth: number, imageHeight: number) =>
  Math.min(
    maxArtScale(imageWidth, imageHeight),
    Math.max(coverScale(imageWidth, imageHeight), scale),
  )

/**
 * Encierra el encuadre dentro del recorte: la escala nunca baja del cover y la
 * posición nunca deja entrar un borde de la imagen. Así el fondo gris del
 * contenedor no se ve nunca, ni al hacer zoom ni al arrastrar.
 */
export function clampArtTransform(
  transform: ArtTransform,
  imageWidth: number,
  imageHeight: number,
): ArtTransform {
  const scale = clampArtScale(transform.scale, imageWidth, imageHeight)
  return {
    scale,
    x: clampAxis(transform.x, imageWidth * scale, ART_RECT.x, ART_RECT.width),
    y: clampAxis(transform.y, imageHeight * scale, ART_RECT.y, ART_RECT.height),
  }
}

/**
 * Deja el tramo de imagen que sobra libre para moverse, pero no más. Si la
 * imagen no llega a cubrir el eje (sólo pasa con transforms viejos o cargados
 * de un archivo), la centra: es lo menos feo posible.
 */
function clampAxis(value: number, size: number, start: number, extent: number) {
  if (size <= extent) return start + (extent - size) / 2
  return Math.min(start, Math.max(start + extent - size, value))
}

export function fitCover(imageWidth: number, imageHeight: number): ArtTransform {
  return centerAt(imageWidth, imageHeight, coverScale(imageWidth, imageHeight))
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
