import type { Handle } from './files'

/**
 * El handle del último mazo abierto, guardado entre sesiones.
 *
 * Recargar la página traía el mazo de vuelta (autoguardado) pero no el archivo,
 * así que "Guardar" volvía a preguntar dónde. Los handles son clonables pero no
 * serializables a texto, así que van a IndexedDB y no a localStorage.
 *
 * El permiso de escritura no sobrevive a la recarga: se vuelve a pedir en el
 * primer "Guardar" (ver `saveDeck`), que es un click y por lo tanto puede
 * abrir el diálogo del navegador.
 */

const DB_NAME = 'dune-card-generator'
const STORE = 'files'
const KEY = 'deck'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

/** Recordar (o olvidar, con null) el archivo abierto. */
export async function rememberDeckFile(handle: Handle | null) {
  try {
    if (handle) await withStore('readwrite', (store) => store.put(handle, KEY))
    else await withStore('readwrite', (store) => store.delete(KEY))
  } catch {
    // Sin IndexedDB (modo incógnito, permisos) se pierde la memoria del
    // archivo y nada más: no es motivo para romper la app.
  }
}

export async function recallDeckFile(): Promise<Handle | null> {
  try {
    return (await withStore<Handle | undefined>('readonly', (store) => store.get(KEY))) ?? null
  } catch {
    return null
  }
}
