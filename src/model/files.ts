import type { Card } from './card'
import { downloadDeck, FILE_EXTENSION, fileSafe, parseDeck, serializeDeck } from './storage'

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

/** El usuario cerró el diálogo. No es un error que valga la pena mostrar. */
export const isCancelled = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError'

export type OpenedDeck = { cards: Card[]; handle: Handle | null; name: string }

/**
 * Abre con el diálogo nativo si se puede, para quedarse con el handle. Si no,
 * el llamador tiene que caer en un `<input type=file>`.
 */
export async function openDeck(): Promise<OpenedDeck | null> {
  const show = picker().showOpenFilePicker
  if (!show) return null

  const [handle] = await show({ types: FILE_TYPES })
  const file = await handle.getFile()
  return { cards: parseDeck(await file.text()), handle, name: file.name }
}

export async function openDeckFromFile(file: File): Promise<OpenedDeck> {
  return { cards: parseDeck(await file.text()), handle: null, name: file.name }
}

/** Pide dónde guardar y devuelve el handle nuevo. */
export async function saveDeckAs(
  cards: Card[],
  suggestedName: string,
): Promise<{ handle: Handle | null; name: string }> {
  const show = picker().showSaveFilePicker
  if (!show || writesBlocked) {
    downloadDeck(cards)
    return { handle: null, name: suggestedName }
  }

  const handle = await show({ suggestedName, types: FILE_TYPES })

  try {
    await write(handle, cards)
  } catch (cause) {
    if (!isUnwritable(cause)) throw cause
    // El diálogo lo dio pero la escritura no: este entorno no sirve para
    // sobrescribir. Queda el camino viejo, bajar una copia.
    writesBlocked = true
    downloadDeck(cards)
    return { handle: null, name: suggestedName }
  }
  return { handle, name: handle.name }
}

/**
 * Sobrescribe el archivo abierto. Devuelve false si ya no se puede — permiso
 * denegado, o el archivo se movió o se borró — para caer en "Guardar como" en
 * vez de dejar al usuario sin guardar.
 */
export async function saveDeck(cards: Card[], handle: Handle): Promise<boolean> {
  if (!(await ensureWritable(handle))) return false

  try {
    await write(handle, cards)
  } catch (cause) {
    if (isUnwritable(cause)) return false
    throw cause
  }
  return true
}

/**
 * El archivo abierto ya no sirve para escribir: se movió o se borró
 * (`NotFoundError`), o el navegador no da el permiso en este momento
 * (`NotAllowedError`, `SecurityError`). Ninguno es un error para mostrar: hay
 * que volver a preguntar dónde guardar.
 */
const isUnwritable = (cause: unknown) =>
  cause instanceof DOMException &&
  ['NotFoundError', 'NotAllowedError', 'SecurityError'].includes(cause.name)

/**
 * El permiso de escritura se pide aparte del de lectura, y no sobrevive a
 * recargar la página. Se consulta primero para no abrir el diálogo cuando ya
 * está dado; pedirlo necesita un click reciente, así que esto sólo se llama
 * desde el botón de guardar.
 */
async function ensureWritable(handle: Handle) {
  const current = (await handle.queryPermission?.({ mode: 'readwrite' })) ?? 'granted'
  if (current === 'granted') return true

  const asked = (await handle.requestPermission?.({ mode: 'readwrite' })) ?? 'granted'
  return asked === 'granted'
}

async function write(handle: Handle, cards: Card[]) {
  const writable = await handle.createWritable()
  await writable.write(serializeDeck(cards))
  await writable.close()
}

/** Nombre por defecto: el de la carta si hay una sola, si no algo genérico. */
export const suggestedName = (cards: Card[]) =>
  `${fileSafe(cards.length === 1 ? cards[0].title.trim() || 'carta' : 'mazo')}${FILE_EXTENSION}`
