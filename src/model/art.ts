import { ART_RECT } from '../render/constants'
import type { ArtRotation, ArtTransform, CardArt } from './card'
import { AppError } from './errors'

export const MAX_ART_SCALE = 8

/**
 * El tamaño que la imagen ocupa **ya girada**: con 90 o 270 el alto pasa a ser
 * el ancho. Todas las cuentas de encuadre —cover, techo del zoom, límites del
 * arrastre— van sobre este tamaño y no sobre el del archivo, porque lo que
 * tiene que cubrir el recorte es la imagen como se ve.
 */
export function orientedSize(width: number, height: number, rotation: ArtRotation = 0) {
  return rotation === 90 || rotation === 270 ? { width: height, height: width } : { width, height }
}

/** Lo mismo, para el caso normal: una imagen con su encuadre actual. */
export const artSize = (art: CardArt) =>
  orientedSize(art.width, art.height, art.transform.rotation)

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
  // Se conserva el resto del transform —giro y espejado— en vez de armar uno
  // nuevo: por acá pasan las tres formas de mover la imagen, y perderlos acá
  // sería enderezar la foto sola al primer arrastre.
  return {
    ...transform,
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

/** Ajustar y centrar desde el panel, conservando el giro y el espejado. */
export function fitCoverArt(art: CardArt): ArtTransform {
  const { width, height } = artSize(art)
  return keepOrientation(art, fitCover(width, height))
}

export function centerArt(art: CardArt): ArtTransform {
  const { width, height } = artSize(art)
  return keepOrientation(art, centerAt(width, height, art.transform.scale))
}

const keepOrientation = (art: CardArt, transform: ArtTransform): ArtTransform => ({
  ...transform,
  rotation: art.transform.rotation,
  flip: art.transform.flip,
})

/**
 * Un cuarto de vuelta en sentido horario.
 *
 * Reencuadra de cero en vez de intentar arrastrar el encuadre anterior: al
 * girar, el recorte pasa a mostrar una parte completamente distinta de la
 * imagen —lo que era el borde de arriba pasa a ser el costado—, así que no hay
 * un "mismo encuadre" que conservar. Ajustar y centrar es lo predecible.
 */
export function rotateArt(art: CardArt): ArtTransform {
  const rotation = (((art.transform.rotation ?? 0) + 90) % 360) as ArtRotation
  const { width, height } = orientedSize(art.width, art.height, rotation)
  return { ...fitCover(width, height), rotation, flip: art.transform.flip }
}

/**
 * Espejado horizontal. El tamaño no cambia, así que el encuadre se conserva:
 * se refleja la posición dentro del recorte para que siga viéndose el mismo
 * tramo de imagen, sólo que dado vuelta.
 */
export function flipArt(art: CardArt): ArtTransform {
  const { width, height } = artSize(art)
  const { x, scale } = art.transform
  return clampArtTransform(
    {
      ...art.transform,
      flip: !art.transform.flip,
      x: 2 * ART_RECT.x + ART_RECT.width - (x + width * scale),
    },
    width,
    height,
  )
}

/**
 * Dónde y cómo hay que ponerle el nodo a Konva para que la imagen girada caiga
 * con su borde de arriba a la izquierda en `transform.x/y`.
 *
 * Konva gira alrededor de la posición del nodo, así que con un giro de 90° el
 * nodo termina fuera de la caja que ocupa la imagen: hay que correrlo por la
 * diferencia entre la esquina del nodo y la esquina de la caja girada. Se
 * calcula sobre las cuatro esquinas y no caso por caso porque así el espejado
 * entra en la misma cuenta.
 *
 * El espejado va **después** del giro —espeja lo que se ve— y en Konva eso es
 * un `scaleX` negativo con el giro al revés: `R(-r)·F = F·R(r)`. Con el giro
 * tal cual, espejar y después girar 90° daría el resultado de girar 270°.
 */
export function artPlacement(art: CardArt) {
  const { x, y, scale, rotation = 0, flip = false } = art.transform
  const konvaRotation = flip ? (360 - rotation) % 360 : rotation

  // El giro siempre es múltiplo de 90, así que el seno y el coseno son exactos;
  // Math.cos(π/2) daría 6e-17 y ensuciaría la posición.
  const quarter = konvaRotation / 90
  const cos = [1, 0, -1, 0][quarter]
  const sin = [0, 1, 0, -1][quarter]
  const scaleX = flip ? -scale : scale

  const corners = [
    [0, 0],
    [art.width, 0],
    [0, art.height],
    [art.width, art.height],
  ].map(([u, v]) => {
    const lx = u * scaleX
    const ly = v * scale
    return [lx * cos - ly * sin, lx * sin + ly * cos]
  })

  const minX = Math.min(...corners.map(([cx]) => cx))
  const minY = Math.min(...corners.map(([, cy]) => cy))

  return {
    rotation: konvaRotation,
    scaleX,
    scaleY: scale,
    /** La posición del nodo, ya corrida para que la caja empiece en (x, y). */
    konvaX: x - minX,
    konvaY: y - minY,
    /** Lo que hay que restarle a la posición del nodo para volver a (x, y). */
    minX,
    minY,
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

    reader.onerror = () => reject(new AppError('read-failed', { name: file.name }))
    reader.onload = () => {
      const src = String(reader.result)
      const image = new Image()
      image.onerror = () => reject(new AppError('invalid-image', { name: file.name }))
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
