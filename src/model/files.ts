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

type Handle = FileSystemFileHandle & {
  queryPermission?: (options: { mode: string }) => Promise<PermissionState>
  requestPermission?: (options: { mode: string }) => Promise<PermissionState>
}

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: FilePickerOptions) => Promise<Handle[]>
  showSaveFilePicker?: (options?: FilePickerOptions) => Promise<Handle>
}

const picker = () => window as PickerWindow

export const supportsFileSystem = () =>
  typeof picker().showSaveFilePicker === 'function'

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
  if (!show) {
    downloadDeck(cards)
    return { handle: null, name: suggestedName }
  }

  const handle = await show({ suggestedName, types: FILE_TYPES })
  await write(handle, cards)
  return { handle, name: handle.name }
}

/** Sobrescribe el archivo abierto. */
export async function saveDeck(cards: Card[], handle: Handle) {
  await write(handle, cards)
}

async function write(handle: Handle, cards: Card[]) {
  // El permiso de escritura se pide aparte del de lectura, y puede haber
  // caducado si el handle viene de antes.
  if (handle.requestPermission) {
    const granted = await handle.requestPermission({ mode: 'readwrite' })
    if (granted !== 'granted') throw new Error('No se dio permiso para escribir el archivo.')
  }

  const writable = await handle.createWritable()
  await writable.write(serializeDeck(cards))
  await writable.close()
}

/** Nombre por defecto: el de la carta si hay una sola, si no algo genérico. */
export const suggestedName = (cards: Card[]) =>
  `${fileSafe(cards.length === 1 ? cards[0].title.trim() || 'carta' : 'mazo')}${FILE_EXTENSION}`
