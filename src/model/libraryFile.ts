import type { CustomFaction } from './customFaction'
import type { CustomIcon } from './customIcon'
import { AppError } from './errors'
import { fileSafe } from './storage'

/**
 * La biblioteca en un archivo.
 *
 * La biblioteca vive en IndexedDB, o sea **en este navegador**: se pierde al
 * cambiar de máquina, al borrar los datos del sitio o al abrir la app en otro
 * navegador. Un mazo se lleva adentro lo que usa, pero eso no alcanza para
 * mudar la biblioteca entera —lo que todavía no usaste no está en ningún mazo—
 * ni para tener una copia de respaldo.
 *
 * Es un formato aparte del mazo (`.dune.json`) y no una variante suya, porque
 * no es un mazo: no tiene cartas y no se abre como tal. Lleva las dos listas
 * juntas, iconos y facciones, porque las dos son "lo mío" y separarlas serían
 * dos archivos para el mismo viaje.
 */
export const LIBRARY_EXTENSION = '.dunelib.json'

/** La 1 no llevaba nombre. Un archivo así se lee igual: la biblioteca queda sin nombre. */
export const LIBRARY_VERSION = 2

export type LibraryFile = {
  format: 'dune-imperium-library'
  version: 1 | 2
  /** Cómo la bautizó quien la exportó. Opcional: se puede no ponerle ninguno. */
  name?: string
  icons: CustomIcon[]
  factions: CustomFaction[]
}

export function serializeLibrary(
  icons: CustomIcon[],
  factions: CustomFaction[],
  name: string | null,
): string {
  const file: LibraryFile = {
    format: 'dune-imperium-library',
    version: LIBRARY_VERSION,
    // Sin nombre no va la clave, en vez de ir vacía: es la misma distinción
    // que hace `saveLibraryName`, y así un archivo sin nombre se lee igual que
    // uno de la versión 1.
    ...(name ? { name } : {}),
    icons,
    factions,
  }
  return JSON.stringify(file, null, 2)
}

/**
 * Las listas que falten se leen como vacías: una biblioteca sin facciones es
 * un archivo válido, y al revés también.
 */
export function parseLibrary(json: string): {
  icons: CustomIcon[]
  factions: CustomFaction[]
  name: string | null
} {
  const parsed: unknown = JSON.parse(json)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as LibraryFile).format !== 'dune-imperium-library'
  ) {
    throw new AppError('not-a-library')
  }

  const file = parsed as LibraryFile
  const icons = file.icons ?? []
  const factions = file.factions ?? []
  if (!icons.length && !factions.length) throw new AppError('empty-library')

  return { icons, factions, name: file.name?.trim() || null }
}

/**
 * Nombre por defecto al exportar: el de la biblioteca, y si no tiene, uno
 * genérico. Los dos llevan la fecha, porque lo que se repite son las
 * **exportaciones** —el respaldo de una máquina y el de otra se llamaban igual
 * y quedaban indistinguibles en la carpeta—, y eso no lo arregla el nombre:
 * dos respaldos de la misma biblioteca se llaman igual justamente porque es la
 * misma.
 *
 * Va la fecha local y no `toISOString()`, que es UTC: a la noche daría el día
 * siguiente, y el respaldo diría un día que no es el que lo hiciste.
 */
export function suggestedLibraryName(name: string | null, now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${fileSafe(name?.trim() || 'biblioteca')}-${date}${LIBRARY_EXTENSION}`
}
