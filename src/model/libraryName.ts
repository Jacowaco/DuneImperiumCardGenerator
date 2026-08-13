import { LIBRARY_STORE, withStore } from './db'

/**
 * El nombre de tu biblioteca.
 *
 * La biblioteca es una sola por navegador, así que el nombre no está para
 * distinguirla de otra: está para **reconocerla**, sobre todo cuando el
 * archivo exportado viaja a otra máquina o cuando abrís la app en la
 * computadora del laburo y querés saber cuál de tus dos bibliotecas es ésta.
 * Por eso lo escribe el usuario y no sale del archivo importado.
 *
 * Vive en IndexedDB y no en localStorage —donde sí vive el idioma— para que
 * sea parte de la misma cosa que nombra: borrar los datos del sitio se lleva
 * la biblioteca y el nombre juntos. Con el nombre en localStorage quedaría una
 * biblioteca vacía pero bautizada, que es peor que no tener nombre.
 */

const KEY = 'name'

/** Sin IndexedDB (incógnito, permisos) la biblioteca no tiene nombre y la app anda igual. */
export async function loadLibraryName(): Promise<string | null> {
  try {
    const name = await withStore<string | undefined>(LIBRARY_STORE, 'readonly', (store) =>
      store.get(KEY),
    )
    return name ?? null
  } catch {
    return null
  }
}

/** Un nombre vacío borra la clave: «sin nombre» es no tener el dato, no tener `''`. */
export async function saveLibraryName(name: string): Promise<void> {
  try {
    if (name) await withStore(LIBRARY_STORE, 'readwrite', (store) => store.put(name, KEY))
    else await withStore(LIBRARY_STORE, 'readwrite', (store) => store.delete(KEY))
  } catch {
    // Igual que en `iconStore`: que no se pueda guardar el nombre no puede
    // costarte la sesión, y lo que nombra sigue estando.
  }
}
