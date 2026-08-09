import type { CustomIcon } from './customIcon'
import { ICONS_STORE, withStore } from './db'

/**
 * Biblioteca de iconos propios: los que subiste alguna vez, disponibles en
 * cualquier mazo que abras después.
 *
 * Es **sólo un lugar de donde copiar**. El mazo sigue llevando el PNG adentro,
 * así que un archivo abierto en otra máquina se ve igual; traer un icono de acá
 * es copiarlo al mazo, no referenciarlo. Por eso el render nunca ve la
 * biblioteca: si el selector de las cajas ofreciera iconos que no están en el
 * archivo, la carta se vería bien acá y saldría con un hueco en cualquier otro
 * lado.
 *
 * Va a IndexedDB y no a localStorage porque ahí vive el autoguardado del mazo:
 * unos pocos iconos de decenas de KB competirían por los ~5 MB del mismo cupo y
 * lo primero que se rompería es el autoguardado.
 *
 * El id (`custom:<uuid>`) viaja con la copia, así que el mismo icono en dos
 * mazos es el mismo icono y la biblioteca no se llena de duplicados.
 */

/**
 * Sin IndexedDB (modo incógnito, permisos) la biblioteca queda vacía y la app
 * sigue andando igual: los iconos del mazo abierto no dependen de esto.
 */
export async function listLibraryIcons(): Promise<CustomIcon[]> {
  try {
    const icons = await withStore<CustomIcon[]>(ICONS_STORE, 'readonly', (store) =>
      store.getAll(),
    )
    // Las claves son uuid, así que el orden de la base no significa nada.
    return icons.sort((a, b) => a.label.localeCompare(b.label))
  } catch {
    return []
  }
}

export async function saveLibraryIcon(icon: CustomIcon): Promise<void> {
  try {
    await withStore(ICONS_STORE, 'readwrite', (store) => store.put(icon))
  } catch {
    // Guardar en la biblioteca es una comodidad: que falle no puede costarte
    // el icono que acabás de subir, que ya está en el mazo abierto.
  }
}

export async function removeLibraryIcon(id: string): Promise<void> {
  try {
    await withStore(ICONS_STORE, 'readwrite', (store) => store.delete(id))
  } catch {
    // Igual que arriba.
  }
}

/**
 * Lleva la biblioteca de `previous` a `next`. El panel edita una lista y esto
 * la baja a la base: lo que desapareció se borra y el resto se vuelve a
 * escribir, que además cubre los renombres y los cambios de tamaño.
 */
export async function syncLibrary(previous: CustomIcon[], next: CustomIcon[]): Promise<void> {
  const kept = new Set(next.map((icon) => icon.id))

  await Promise.all([
    ...previous.filter((icon) => !kept.has(icon.id)).map((icon) => removeLibraryIcon(icon.id)),
    ...next.map(saveLibraryIcon),
  ])
}

/**
 * Suma a la biblioteca los iconos que trae un mazo abierto y devuelve cómo
 * queda. Los que ya están **no se pisan**: la versión del usuario es la que
 * vale, y la del archivo puede tener el nombre o el tamaño de otro día.
 */
export async function adoptIcons(icons: CustomIcon[]): Promise<CustomIcon[]> {
  const known = new Set((await listLibraryIcons()).map((icon) => icon.id))
  const missing = icons.filter((icon) => !known.has(icon.id))

  if (!missing.length) return listLibraryIcons()

  await Promise.all(missing.map(saveLibraryIcon))
  return listLibraryIcons()
}
