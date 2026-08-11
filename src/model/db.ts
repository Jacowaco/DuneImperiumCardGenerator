/**
 * La base de IndexedDB del navegador, compartida por todo lo que necesita
 * sobrevivir a una recarga sin entrar en el archivo del mazo: el handle del
 * último archivo abierto y la biblioteca de iconos propios.
 *
 * **Va una sola apertura para toda la app.** Cada `indexedDB.open` declara una
 * versión, y la base se queda con la más alta que le hayan pedido: si un módulo
 * abriera la 1 después de que otro migró a la 2, el `open` falla con
 * `VersionError`. Por eso los stores se crean todos acá y nadie abre la base
 * por su cuenta.
 */

const DB_NAME = 'dune-card-generator'
const VERSION = 3

export const FILES_STORE = 'files'
export const ICONS_STORE = 'icons'
export const FACTIONS_STORE = 'factions'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION)

    // Se crea lo que falte y nada más: una base de la versión 1 ya tiene
    // `files` y sólo le falta `icons`, y una de la 2 sólo le falta `factions`.
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(FILES_STORE)) db.createObjectStore(FILES_STORE)
      if (!db.objectStoreNames.contains(ICONS_STORE))
        db.createObjectStore(ICONS_STORE, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(FACTIONS_STORE))
        db.createObjectStore(FACTIONS_STORE, { keyPath: 'id' })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function withStore<T>(
  name: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(name, mode).objectStore(name))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}
