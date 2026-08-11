import { createContext, useContext } from 'react'

import {
  ICON_NUMBER_COLORS,
  ICONS,
  IMMORTALITY_ICON_IDS,
  INFLUENCE_ICON_IDS,
  IX_ICON_IDS,
  type IconId,
} from '../assets/icons'
import ICON_SIZES from '../assets/icons/sizes.json'
import { INFLUENCE_VARIANTS, type InfluenceVariant } from '../assets/icons/influence'
import { CONTENT } from '../render/constants'
import type { AnyIconId } from './card'
import type { CustomFaction } from './customFaction'
import { DEFAULT_CUSTOM_ICON_NUMBER_COLOR, type CustomIcon } from './customIcon'
import { factionInfluenceIconId, getFactionInfluenceIcon } from './factionArt'
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
  /**
   * Generado desde una facción propia (uno de sus 4 rombos de influencia), no
   * subido a mano: se agrupa junto a los rombos del juego base
   * (`groupIconIds`) y no se puede borrar solo — se borra borrando la
   * facción que lo generó.
   */
  factionInfluence?: boolean
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
    numberColor: icon.showNumber ? icon.numberColor ?? DEFAULT_CUSTOM_ICON_NUMBER_COLOR : undefined,
  }
}

/**
 * Los 4 rombos de "+1/-1 Influencia" que genera una facción propia a partir
 * de su emblema (`factionArt.ts`). Mientras uno todavía se está calentando
 * (recién subida la facción, la promesa de canvas no resolvió) se saltea —
 * igual que un icono borrado — y aparece solo apenas termine, cuando algo
 * más dispare un rebuild de la biblioteca.
 */
const factionInfluenceEntries = (
  customFactions: CustomFaction[],
  language: Language,
): [string, IconEntry][] =>
  customFactions.flatMap((faction) =>
    (Object.keys(INFLUENCE_VARIANTS) as InfluenceVariant[]).flatMap((variant) => {
      const icon = getFactionInfluenceIcon(faction.id, variant)
      if (!icon) return []
      return [
        [
          factionInfluenceIconId(faction.id, variant),
          {
            url: icon.url,
            label: `${faction.label} · ${pick(INFLUENCE_VARIANTS[variant], language)}`,
            width: icon.width,
            height: icon.height,
            custom: true,
            factionInfluence: true,
          },
        ],
      ]
    }),
  )

export const buildIconLibrary = (
  custom: CustomIcon[],
  customFactions: CustomFaction[],
  language: Language,
): IconLibrary => ({
  ...buildBuiltinIcons(language),
  ...Object.fromEntries(custom.map((icon) => [icon.id, customIconEntry(icon)])),
  ...Object.fromEntries(factionInfluenceEntries(customFactions, language)),
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

/**
 * El catálogo agrupado como se muestra en los selectores visuales: propios
 * primero (son los que se subieron a propósito para este mazo), después el
 * juego base y las expansiones aparte, para no revisar tooltip por tooltip
 * cuando el mazo no las usa.
 */
export const groupIconIds = (library: IconLibrary) => {
  const ids = Object.keys(library) as AnyIconId[]
  // Los rombos generados van con los del juego base en "influencia", no con
  // los propios genéricos: son un rombo más para el que arma el contenido de
  // una caja, no algo que gestionar aparte.
  const factionInfluence = ids.filter((id) => library[id].factionInfluence)
  const custom = ids.filter((id) => library[id].custom && !library[id].factionInfluence)
  const builtin = ids.filter((id) => !library[id].custom)
  const ix = builtin.filter((id) => (IX_ICON_IDS as readonly AnyIconId[]).includes(id))
  const immortality = builtin.filter((id) =>
    (IMMORTALITY_ICON_IDS as readonly AnyIconId[]).includes(id),
  )
  const builtinInfluence = builtin.filter((id) =>
    (INFLUENCE_ICON_IDS as readonly AnyIconId[]).includes(id),
  )
  const influence = [...builtinInfluence, ...factionInfluence]
  const core = builtin.filter(
    (id) => !ix.includes(id) && !immortality.includes(id) && !builtinInfluence.includes(id),
  )
  return { custom, core, ix, immortality, influence }
}
