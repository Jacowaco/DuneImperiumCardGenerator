import { CONTENT } from '../render/constants'
import { baseName, cropToContent } from './imageCrop'

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
  /**
   * Si dibuja encima la cantidad del `ContentPart`, como los iconos que salen
   * vacíos del PSD (`iconTakesNumber`). A diferencia de esos, acá lo elige el
   * usuario: un icono propio puede ser un símbolo que ya representa "uno" o
   * uno pensado para llevar cantidad, y no hay forma de saberlo del PNG.
   *
   * Opcional para que un mazo guardado antes de este campo siga abriendo:
   * `customIconEntry` (`iconLibrary.ts`) es el único lugar que lo lee, y ahí
   * se completa con `false`.
   */
  showNumber?: boolean
  /** Color del número, elegido por el usuario porque el fondo del icono varía. */
  numberColor?: string
}

/** Color inicial del número al prender `showNumber`, editable después. */
export const DEFAULT_CUSTOM_ICON_NUMBER_COLOR = '#ffffff'

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
  a.every(
    (icon, i) =>
      icon.id === b[i].id &&
      icon.label === b[i].label &&
      icon.size === b[i].size &&
      icon.showNumber === b[i].showNumber &&
      icon.numberColor === b[i].numberColor,
  )

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
 */
export async function loadCustomIcon(file: File): Promise<CustomIcon> {
  const cropped = await cropToContent(file, { workSize: WORK_SIZE, storedHeight: STORED_HEIGHT })

  return {
    id: newCustomIconId(),
    label: baseName(file.name),
    url: cropped.url,
    width: cropped.width,
    height: cropped.height,
    size: 100,
    showNumber: false,
    numberColor: DEFAULT_CUSTOM_ICON_NUMBER_COLOR,
  }
}
