import type { CustomFaction } from './customFaction'
import type { CustomIcon } from './customIcon'
import { AppError } from './errors'

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

export type LibraryFile = {
  format: 'dune-imperium-library'
  version: 1
  icons: CustomIcon[]
  factions: CustomFaction[]
}

export function serializeLibrary(icons: CustomIcon[], factions: CustomFaction[]): string {
  const file: LibraryFile = {
    format: 'dune-imperium-library',
    version: 1,
    icons,
    factions,
  }
  return JSON.stringify(file, null, 2)
}

/**
 * Las listas que falten se leen como vacías: una biblioteca sin facciones es
 * un archivo válido, y al revés también.
 */
export function parseLibrary(json: string): { icons: CustomIcon[]; factions: CustomFaction[] } {
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

  return { icons, factions }
}

/** Nombre por defecto al exportar. No hay uno mejor: la biblioteca no tiene nombre. */
export const suggestedLibraryName = () => `biblioteca${LIBRARY_EXTENSION}`
