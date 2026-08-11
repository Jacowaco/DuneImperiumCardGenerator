import { CONTENT } from '../render/constants'
import { cropToContent } from './imageCrop'

/**
 * Facciones que arma el usuario, para mazos homebrew con facciones que el
 * juego no trae.
 *
 * Viven **en el mazo y en una biblioteca del navegador** (`factionStore.ts`),
 * mismo patrón que los iconos propios (`customIcon.ts`): el emblema viaja
 * como data URL dentro del `.dune.json`, así que un mazo con facciones
 * custom abre igual en otra máquina, y la biblioteca deja reusarlas entre
 * mazos sin volver a subir el emblema.
 *
 * El id lleva un prefijo propio, distinto del de los iconos (`custom:`),
 * porque son dos namespaces separados: una facción se referencia desde
 * `card.factions`, un icono desde un `ContentPart`.
 */
export const CUSTOM_FACTION_PREFIX = 'faction:'

export type CustomFactionId = `faction:${string}`

export type CustomFaction = {
  id: CustomFactionId
  label: string
  /** Color de la banda y, indirectamente, de los rombos de influencia generados. */
  color: string
  /** Emblema recortado al contenido, como data URL. */
  emblem: string
  /** Medidas del emblema guardado, para escalarlo sin esperar a que cargue. */
  width: number
  height: number
}

/**
 * Color inicial al crear una facción, editable después. Es el sand-500 de la
 * interfaz y no repite ninguno de los cuatro colores de facción del juego
 * base, para que una recién creada no se confunda con una de ellas.
 */
export const DEFAULT_CUSTOM_FACTION_COLOR = '#b08d4f'

export const isCustomFactionId = (id: string): id is CustomFactionId =>
  id.startsWith(CUSTOM_FACTION_PREFIX)

/**
 * Une dos listas por id. Gana la segunda: la biblioteca del usuario es la
 * versión viva de cada facción, y la que trae un archivo abierto puede ser
 * vieja (se guardó con el nombre y el color que tenía ese día).
 */
export function mergeFactions(base: CustomFaction[], winning: CustomFaction[]): CustomFaction[] {
  const byId = new Map(base.map((faction) => [faction.id, faction]))
  for (const faction of winning) byId.set(faction.id, faction)
  return [...byId.values()]
}

/** Si dos listas dicen lo mismo. Alcanza con lo editable: el emblema no cambia. */
export const sameFactions = (a: CustomFaction[], b: CustomFaction[]) =>
  a.length === b.length &&
  a.every(
    (faction, i) =>
      faction.id === b[i].id && faction.label === b[i].label && faction.color === b[i].color,
  )

/**
 * La detección del recorte se hace sobre una copia reducida, igual que los
 * iconos propios: buscar el borde en una foto de 4000 px cuesta caro y no
 * hace falta, porque el emblema se guarda chico igual.
 */
const WORK_SIZE = 1024

/**
 * Alto al que se guarda el emblema: el mismo que un icono propio. Nunca se
 * dibuja más grande que eso —se autoajusta al hueco del rombo o sale a 28 px
 * fijo en el botón del selector—, así que no hace falta un tamaño mayor.
 */
const STORED_HEIGHT = CONTENT.nominalIconHeight * 2

export const newCustomFactionId = (): CustomFactionId =>
  `${CUSTOM_FACTION_PREFIX}${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`

/** Nombre del archivo sin la extensión, que es el mejor nombre por defecto. */
const baseName = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Facción'

export async function loadCustomFactionEmblem(file: File): Promise<CustomFaction> {
  const cropped = await cropToContent(file, { workSize: WORK_SIZE, storedHeight: STORED_HEIGHT })

  return {
    id: newCustomFactionId(),
    label: baseName(file.name),
    color: DEFAULT_CUSTOM_FACTION_COLOR,
    emblem: cropped.url,
    width: cropped.width,
    height: cropped.height,
  }
}
