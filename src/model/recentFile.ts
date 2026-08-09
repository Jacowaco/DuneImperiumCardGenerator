import { FILES_STORE, withStore } from './db'
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

const KEY = 'deck'

/** Recordar (o olvidar, con null) el archivo abierto. */
export async function rememberDeckFile(handle: Handle | null) {
  try {
    if (handle) await withStore(FILES_STORE, 'readwrite', (store) => store.put(handle, KEY))
    else await withStore(FILES_STORE, 'readwrite', (store) => store.delete(KEY))
  } catch {
    // Sin IndexedDB (modo incógnito, permisos) se pierde la memoria del
    // archivo y nada más: no es motivo para romper la app.
  }
}

export async function recallDeckFile(): Promise<Handle | null> {
  try {
    return (
      (await withStore<Handle | undefined>(FILES_STORE, 'readonly', (store) =>
        store.get(KEY),
      )) ?? null
    )
  } catch {
    return null
  }
}
