import { createContext, useContext } from 'react'

import { ICON_NUMBER_COLORS, ICONS, type IconId } from '../assets/icons'
import ICON_SIZES from '../assets/icons/sizes.json'
import { CONTENT } from '../render/constants'
import type { AnyIconId } from './card'
import type { CustomIcon } from './customIcon'
import { pick, type Language } from './language'

/**
 * Todo lo que hace falta saber de un icono para dibujarlo y para ofrecerlo en
 * el panel, venga del PSD o lo haya subido el usuario.
 *
 * Junta en una sola tabla las tres que había sueltas (`ICONS`, `sizes.json` y
 * `ICON_NUMBER_COLORS`), porque a partir de los iconos propios el catálogo deja
 * de ser una constante del build: depende del mazo abierto.
 */
export type IconEntry = {
  url: string
  label: string
  /** Medidas con las que entra al layout, en la escala nominal (icono = 99 px). */
  width: number
  height: number
  /** Color del número que se dibuja encima, en los que salen vacíos del PSD. */
  numberColor?: string
  /** Los del usuario se muestran aparte en el panel y se pueden borrar. */
  custom?: boolean
}

export type IconLibrary = Record<string, IconEntry>

/** Tamaño natural de cada icono, generado por `scripts/prepare_assets.py`. */
const SIZES: Record<string, number[]> = ICON_SIZES

const NOMINAL: [number, number] = [CONTENT.nominalIconHeight, CONTENT.nominalIconHeight]

const buildBuiltinIcons = (language: Language): IconLibrary =>
  Object.fromEntries(
    (Object.keys(ICONS) as IconId[]).map((id) => {
      const [width, height] = SIZES[id] ?? NOMINAL
      return [
        id,
        {
          url: ICONS[id].url,
          label: pick(ICONS[id].label, language),
          width,
          height,
          numberColor: ICON_NUMBER_COLORS[id],
        },
      ]
    }),
  )

/**
 * El icono del usuario se guarda con el alto que le dio el navegador al
 * recortarlo, que no tiene por qué ser el nominal; acá se lo lleva a la escala
 * del layout respetando la proporción y el % que haya elegido.
 */
export const customIconEntry = (icon: CustomIcon): IconEntry => {
  const height = (CONTENT.nominalIconHeight * icon.size) / 100
  return {
    url: icon.url,
    label: icon.label,
    height,
    width: height * (icon.width / icon.height),
    custom: true,
  }
}

export const buildIconLibrary = (custom: CustomIcon[], language: Language): IconLibrary => ({
  ...buildBuiltinIcons(language),
  ...Object.fromEntries(custom.map((icon) => [icon.id, customIconEntry(icon)])),
})

/**
 * El catálogo se pasa por contexto porque ahora sale del mazo, y tanto el
 * render (preview y miniaturas) como los paneles necesitan el mismo.
 */
const IconLibraryContext = createContext<IconLibrary>(buildBuiltinIcons('es'))

export const IconLibraryProvider = IconLibraryContext.Provider
export const useIconLibrary = () => useContext(IconLibraryContext)

/**
 * Una carta puede nombrar un icono que ya no está —se borró del mazo, o el
 * archivo se armó a mano—. Eso no es motivo para romper el render: la pieza se
 * saltea al dibujar y el editor la marca como faltante, que es donde el usuario
 * puede hacer algo al respecto.
 */
export const findIcon = (library: IconLibrary, id: AnyIconId): IconEntry | undefined =>
  library[id]
