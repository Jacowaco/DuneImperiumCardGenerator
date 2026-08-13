import type { CustomFaction } from './customFaction'
import type { CustomIcon } from './customIcon'
import { LIBRARY_EXTENSION } from './libraryFile'
import {
  downloadDeck,
  downloadText,
  FILE_EXTENSION,
  fileSafe,
  parseDeck,
  serializeDeck,
  type Deck,
} from './storage'

/**
 * Guardar sobre el archivo abierto.
 *
 * El navegador no puede sobrescribir un archivo salvo que el usuario lo haya
 * elegido con un diálogo nativo: de ahí sale un "handle" que la app se guarda
 * y reusa. Eso es lo que separa "Guardar" de "Guardar como".
 *
 * La API existe en Chrome y Edge. Donde no está (Firefox, Safari) las dos
 * opciones caen en bajar el archivo, que es lo que se hacía antes.
 */

type FilePickerOptions = {
  suggestedName?: string
  types?: { description: string; accept: Record<string, string[]> }[]
}

type PermissionState = 'granted' | 'denied' | 'prompt'

export type Handle = FileSystemFileHandle & {
  queryPermission?: (options: { mode: string }) => Promise<PermissionState>
  requestPermission?: (options: { mode: string }) => Promise<PermissionState>
}

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: FilePickerOptions) => Promise<Handle[]>
  showSaveFilePicker?: (options?: FilePickerOptions) => Promise<Handle>
}

const picker = () => window as PickerWindow

/**
 * Hay entornos —la vista previa embebida de VSCode, por ejemplo— que exponen
 * `showSaveFilePicker` pero después no dejan escribir: el `createWritable` de
 * un handle recién elegido en el diálogo falla igual. No se puede saber antes
 * de intentarlo, así que se anota al primer fallo y de ahí en más la app se
 * comporta como en Firefox: baja una copia y lo avisa en el panel.
 *
 * (Elegir una carpeta que el navegador protege da el mismo error; ahí la app
 * se queda bajando copias hasta recargar, que es preferible a no guardar.)
 */
let writesBlocked = false

export const supportsFileSystem = () =>
  typeof picker().showSaveFilePicker === 'function' && !writesBlocked

const FILE_TYPES = [
  {
    description: 'Mazo de Dune: Imperium',
    accept: { 'application/json': [FILE_EXTENSION, '.json'] },
  },
]

const LIBRARY_TYPES = [
  {
    description: 'Biblioteca de Dune: Imperium',
    accept: { 'application/json': [LIBRARY_EXTENSION, '.json'] },
  },
]

/**
 * Guardar texto en un archivo nuevo, sin quedarse con el handle: es para lo
 * que se exporta de a una vez —la biblioteca— y no para lo que se sobrescribe
 * seguido, que es el mazo y por eso tiene su propio camino con handle.
 */
export async function saveTextAs(
  text: string,
  suggestedName: string,
  types = LIBRARY_TYPES,
): Promise<void> {
  const show = picker().showSaveFilePicker
  if (!show || writesBlocked) return downloadText(text, suggestedName)

  const handle = await show({ suggestedName, types })

  try {
    const writable = await handle.createWritable()
    await writable.write(text)
    await writable.close()
  } catch (cause) {
    if (!isUnwritable(cause)) throw cause
    writesBlocked = true
    downloadText(text, suggestedName)
  }
}

/**
 * Leer un archivo de texto con el diálogo nativo. `null` cuando el navegador
 * no tiene la API: ahí el llamador cae en un `<input type=file>`, igual que
 * para abrir un mazo.
 */
export async function openText(types = LIBRARY_TYPES): Promise<string | null> {
  const show = picker().showOpenFilePicker
  if (!show) return null

  const [handle] = await show({ types })
  return (await handle.getFile()).text()
}

/** El usuario cerró el diálogo. No es un error que valga la pena mostrar. */
export const isCancelled = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError'

export type OpenedDeck = {
  deck: Deck
  library: CustomIcon[]
  factionLibrary: CustomFaction[]
  handle: Handle | null
  name: string
}

/**
 * Abre con el diálogo nativo si se puede, para quedarse con el handle. Si no,
 * el llamador tiene que caer en un `<input type=file>`.
 */
export async function openDeck(): Promise<OpenedDeck | null> {
  const show = picker().showOpenFilePicker
  if (!show) return null

  const [handle] = await show({ types: FILE_TYPES })
  const file = await handle.getFile()
  const { deck, library, factionLibrary } = parseDeck(await file.text())
  return { deck, library, factionLibrary, handle, name: file.name }
}

export async function openDeckFromFile(file: File): Promise<OpenedDeck> {
  const { deck, library, factionLibrary } = parseDeck(await file.text())
  return { deck, library, factionLibrary, handle: null, name: file.name }
}

/** Pide dónde guardar y devuelve el handle nuevo. */
export async function saveDeckAs(
  deck: Deck,
  suggestedName: string,
  library?: CustomIcon[],
  factionLibrary?: CustomFaction[],
): Promise<{ handle: Handle | null; name: string }> {
  const show = picker().showSaveFilePicker
  if (!show || writesBlocked) {
    downloadDeck(deck, library, factionLibrary)
    return { handle: null, name: suggestedName }
  }

  const handle = await show({ suggestedName, types: FILE_TYPES })

  try {
    await write(handle, deck, library, factionLibrary)
  } catch (cause) {
    if (!isUnwritable(cause)) throw cause
    // El diálogo lo dio pero la escritura no: este entorno no sirve para
    // sobrescribir. Queda el camino viejo, bajar una copia.
    writesBlocked = true
    downloadDeck(deck, library, factionLibrary)
    return { handle: null, name: suggestedName }
  }
  return { handle, name: handle.name }
}

/**
 * Sobrescribe el archivo abierto. Los dos fracasos posibles no se tratan
 * igual: si el archivo ya no está, lo único que queda es preguntar dónde
 * guardar; pero si lo que falta es el permiso hay que decirlo, porque abrir el
 * diálogo en silencio parece que el botón hubiera ignorado el archivo abierto.
 */
export type SaveResult = 'saved' | 'denied' | 'missing'

export async function saveDeck(
  deck: Deck,
  handle: Handle,
  library?: CustomIcon[],
  factionLibrary?: CustomFaction[],
): Promise<SaveResult> {
  if (!(await ensureWritable(handle))) return 'denied'

  try {
    await write(handle, deck, library, factionLibrary)
  } catch (cause) {
    if (!isUnwritable(cause)) throw cause
    return (cause as DOMException).name === 'NotFoundError' ? 'missing' : 'denied'
  }
  return 'saved'
}

/**
 * El archivo abierto ya no sirve para escribir: se movió o se borró
 * (`NotFoundError`), o el navegador no da el permiso en este momento
 * (`NotAllowedError`, `SecurityError`).
 */
const isUnwritable = (cause: unknown) =>
  cause instanceof DOMException &&
  ['NotFoundError', 'NotAllowedError', 'SecurityError'].includes(cause.name)

/**
 * El permiso de escritura va aparte del de lectura, y abrir un archivo lo da
 * sólo para leer: `showOpenFilePicker` no tiene forma de pedir escritura. Por
 * eso el primer "Guardar" sobre un mazo abierto siempre pasa por el cartel de
 * Chrome, y aceptarlo una vez alcanza para el resto de la sesión.
 *
 * Se consulta primero para no molestar cuando ya está dado. Pedirlo necesita
 * un click reciente, así que cuelga del botón de guardar y no de la apertura,
 * donde el click ya se lo consumió el diálogo.
 */
async function ensureWritable(handle: Handle) {
  try {
    const current = (await handle.queryPermission?.({ mode: 'readwrite' })) ?? 'granted'
    if (current === 'granted') return true

    const asked = (await handle.requestPermission?.({ mode: 'readwrite' })) ?? 'granted'
    return asked === 'granted'
  } catch {
    // Sin click reciente Chrome ni siquiera deja preguntar.
    return false
  }
}

async function write(
  handle: Handle,
  deck: Deck,
  library?: CustomIcon[],
  factionLibrary?: CustomFaction[],
) {
  const writable = await handle.createWritable()
  await writable.write(serializeDeck(deck, { library, factionLibrary }))
  await writable.close()
}

/** Nombre por defecto: el de la carta si hay una sola, si no algo genérico. */
export const suggestedName = ({ cards }: Deck) =>
  `${fileSafe(cards.length === 1 ? cards[0].title.trim() || 'carta' : 'mazo')}${FILE_EXTENSION}`
