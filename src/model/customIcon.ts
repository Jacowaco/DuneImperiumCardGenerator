import { CONTENT } from '../render/constants'
import { AppError } from './errors'

/**
 * Iconos que sube el usuario para escribir reglas que el juego no trae.
 *
 * Viven **dentro del mazo**, no en la app: el PNG viaja como data URL en el
 * `.dune.json`, igual que la imagen del jugador. Un mazo abierto en otra
 * máquina se ve igual sin adjuntos sueltos, que es la misma decisión que ya
 * tomaba `CardArt`.
 *
 * El id lleva prefijo para que nunca choque con uno del PSD y para poder
 * distinguirlos de un vistazo dentro del archivo guardado.
 */
export const CUSTOM_ICON_PREFIX = 'custom:'

export type CustomIconId = `custom:${string}`

export type CustomIcon = {
  id: CustomIconId
  label: string
  /** PNG recortado al contenido, como data URL. */
  url: string
  /**
   * Medidas del PNG guardado. Se anotan acá por lo mismo que existe
   * `icons/sizes.json`: el layout necesita la proporción antes de que el
   * navegador termine de cargar la imagen.
   */
  width: number
  height: number
  /** Alto dentro de la carta, en % del icono nominal (99 px). */
  size: number
}

export const isCustomIconId = (id: string): id is CustomIconId =>
  id.startsWith(CUSTOM_ICON_PREFIX)

/**
 * Une dos listas por id. Gana la segunda: la biblioteca del usuario es la
 * versión viva de cada icono, y la que trae un archivo abierto puede ser vieja
 * (se guardó con el nombre y el tamaño que tenía ese día).
 */
export function mergeIcons(base: CustomIcon[], winning: CustomIcon[]): CustomIcon[] {
  const byId = new Map(base.map((icon) => [icon.id, icon]))
  for (const icon of winning) byId.set(icon.id, icon)
  return [...byId.values()]
}

/** Si dos listas dicen lo mismo. Alcanza con lo editable: el PNG no cambia. */
export const sameIcons = (a: CustomIcon[], b: CustomIcon[]) =>
  a.length === b.length &&
  a.every((icon, i) => icon.id === b[i].id && icon.label === b[i].label && icon.size === b[i].size)

/**
 * Alpha por debajo de esto es fondo: el antialias del borde no cuenta como
 * contenido y si no el recorte queda con un margen invisible de un par de px.
 */
const ALPHA_THRESHOLD = 8

/**
 * La detección del recorte se hace sobre una copia reducida: buscar el borde
 * en una foto de 4000 px cuesta caro y no hace falta, porque el icono se
 * guarda chico igual.
 */
const WORK_SIZE = 1024

/**
 * Alto al que se guarda el PNG: el doble del nominal, que es a lo que se
 * dibuja en el export a 1×. Más que eso sólo engorda el archivo del mazo.
 */
const STORED_HEIGHT = CONTENT.nominalIconHeight * 2

export const newCustomIconId = (): CustomIconId =>
  `${CUSTOM_ICON_PREFIX}${
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  }`

/**
 * Prepara un archivo del usuario para que se comporte como un icono del PSD:
 * recortado al contenido y con el alto nominal.
 *
 * Los iconos del juego salen de `prepare_assets.py` recortados a la tinta,
 * porque el layout los posiciona por su caja real; un PNG con margen
 * transparente quedaría flotando lejos del texto. Acá se hace lo mismo en el
 * navegador, que es el único momento en que se puede: después ya es un dato
 * del mazo.
 */
export async function loadCustomIcon(file: File): Promise<CustomIcon> {
  const source = await decode(await readDataUrl(file), file.name)

  // Todo el trabajo se hace sobre la copia reducida: el resultado se guarda
  // más chico que ella, así que bajar primero no pierde nada.
  const work = draw(source, Math.min(1, WORK_SIZE / Math.max(source.width, source.height)))
  const bounds = contentBounds(work)
  if (!bounds) throw new AppError('empty-image', { name: file.name })

  // Nunca se agranda: un icono chico dibujado grande no gana nada y el data
  // URL crece igual.
  const scale = Math.min(1, STORED_HEIGHT / bounds.height)
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

  return {
    id: newCustomIconId(),
    label: baseName(file.name),
    url: canvas.toDataURL('image/png'),
    width,
    height,
    size: 100,
  }
}

/** Nombre del archivo sin la extensión, que es el mejor nombre por defecto. */
const baseName = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Icono'

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
function contentBounds(canvas: HTMLCanvasElement) {
  const { data } = context(canvas).getImageData(0, 0, canvas.width, canvas.height)

  let left = canvas.width
  let right = -1
  let top = canvas.height
  let bottom = -1

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      if (y > bottom) bottom = y
    }
  }

  if (right < 0) return null
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 }
}
