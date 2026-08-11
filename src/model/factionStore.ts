import type { CustomFaction } from './customFaction'
import { FACTIONS_STORE, withStore } from './db'

/**
 * Biblioteca de facciones propias: las que armaste alguna vez, disponibles en
 * cualquier mazo que abras después. Mismo rol y las mismas reglas que
 * `iconStore.ts` — **sólo un lugar de donde copiar**: traer una facción de acá
 * la copia al mazo, no la referencia, así que el render nunca ve la
 * biblioteca y el mazo sigue siendo autocontenido.
 */

export async function listLibraryFactions(): Promise<CustomFaction[]> {
  try {
    const factions = await withStore<CustomFaction[]>(FACTIONS_STORE, 'readonly', (store) =>
      store.getAll(),
    )
    return factions.sort((a, b) => a.label.localeCompare(b.label))
  } catch {
    return []
  }
}

export async function saveLibraryFaction(faction: CustomFaction): Promise<void> {
  try {
    await withStore(FACTIONS_STORE, 'readwrite', (store) => store.put(faction))
  } catch {
    // Guardar en la biblioteca es una comodidad: que falle no puede costarte
    // la facción que acabás de crear, que ya está en el mazo abierto.
  }
}

export async function removeLibraryFaction(id: string): Promise<void> {
  try {
    await withStore(FACTIONS_STORE, 'readwrite', (store) => store.delete(id))
  } catch {
    // Igual que arriba.
  }
}

export async function syncFactionLibrary(
  previous: CustomFaction[],
  next: CustomFaction[],
): Promise<void> {
  const kept = new Set(next.map((faction) => faction.id))

  await Promise.all([
    ...previous.filter((faction) => !kept.has(faction.id)).map((faction) => removeLibraryFaction(faction.id)),
    ...next.map(saveLibraryFaction),
  ])
}

/**
 * Suma a la biblioteca las facciones que trae un mazo abierto y devuelve cómo
 * queda. Las que ya están **no se pisan**: la versión del usuario es la que
 * vale.
 */
export async function adoptFactions(factions: CustomFaction[]): Promise<CustomFaction[]> {
  const known = new Set((await listLibraryFactions()).map((faction) => faction.id))
  const missing = factions.filter((faction) => !known.has(faction.id))

  if (!missing.length) return listLibraryFactions()

  await Promise.all(missing.map(saveLibraryFaction))
  return listLibraryFactions()
}
