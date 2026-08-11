import { AppError } from './errors'

/**
 * Recorta una imagen subida por el usuario al contenido, para que se comporte
 * como un icono del PSD: los del juego salen de `prepare_assets.py` recortados
 * a la tinta, porque el layout los posiciona por su caja real, y un PNG con
 * margen transparente quedaría flotando lejos de lo que lo rodea. Esto hace lo
 * mismo en el navegador, que es el único momento en que se puede — después ya
 * es un dato guardado.
 *
 * Comparten esto los iconos propios (`customIcon.ts`) y las facciones propias
 * (`customFaction.ts`): mismo algoritmo, mismas constantes de trabajo.
 */

/**
 * Alpha por debajo de esto es fondo: el antialias del borde no cuenta como
 * contenido y si no el recorte queda con un margen invisible de un par de px.
 */
const DEFAULT_ALPHA_THRESHOLD = 8

export type CroppedImage = { url: string; width: number; height: number }

export async function cropToContent(
  file: File,
  options: { workSize: number; storedHeight: number; alphaThreshold?: number },
): Promise<CroppedImage> {
  const alphaThreshold = options.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD
  const source = await decode(await readDataUrl(file), file.name)

  // Todo el trabajo se hace sobre la copia reducida: el resultado se guarda
  // más chico que ella, así que bajar primero no pierde nada.
  const work = draw(source, Math.min(1, options.workSize / Math.max(source.width, source.height)))
  const bounds = contentBounds(work, alphaThreshold)
  if (!bounds) throw new AppError('empty-image', { name: file.name })

  // Nunca se agranda: recortado chico y dibujado grande no gana nada y el
  // data URL crece igual.
  const scale = Math.min(1, options.storedHeight / bounds.height)
  const width = Math.max(1, Math.round(bounds.width * scale))
  const height = Math.max(1, Math.round(bounds.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  context(canvas).drawImage(
    work,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    width,
    height,
  )

  return { url: canvas.toDataURL('image/png'), width, height }
}

/** Nombre del archivo sin la extensión, que es el mejor nombre por defecto. */
export const baseName = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Icono'

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new AppError('read-failed', { name: file.name }))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

function decode(url: string, name: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onerror = () => reject(new AppError('invalid-image', { name }))
    image.onload = () => resolve(image)
    image.src = url
  })
}

function context(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new AppError('canvas-failed')
  return ctx
}

function draw(image: HTMLImageElement, scale: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  context(canvas).drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Caja de lo que tiene tinta. Una imagen sin transparencia (un JPG, por
 * ejemplo) da la imagen entera, que es lo correcto: ahí no hay nada que
 * recortar.
 */
function contentBounds(canvas: HTMLCanvasElement, alphaThreshold: number) {
  const { data } = context(canvas).getImageData(0, 0, canvas.width, canvas.height)

  let left = canvas.width
  let right = -1
  let top = canvas.height
  let bottom = -1

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] <= alphaThreshold) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      if (y > bottom) bottom = y
    }
  }

  if (right < 0) return null
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 }
}
