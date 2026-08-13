import { buildFactionLibrary } from '../model/factionLibrary'
import { buildIconLibrary } from '../model/iconLibrary'
import type { Language } from '../model/language'
import { fileSafe, type Deck } from '../model/storage'
import { downloadBlob, release, toBlob } from './download'
import { EXPORT_SCALE } from './exportPng'
import { createCardRenderer, prepare } from './renderCard'
import { createZip } from './zip'

/**
 * Todas las cartas del mazo, cada una como PNG suelto, en un único `.zip`.
 *
 * Un archivo por carta bajado uno a uno abriría un diálogo de descarga por
 * cada uno —o el navegador los bloquearía después del primero—, así que salen
 * empaquetados juntos, igual que la hoja de impresión sale en un solo PDF.
 *
 * A 2× (600 DPI), la misma escala que exportar la carta abierta desde arriba:
 * acá no hay una hoja física que fije la resolución, así que se mantiene la
 * de un PNG suelto y no la de la hoja de impresión (1×, 300 DPI).
 */
export type BatchExportOptions = {
  language: Language
  onProgress?: (done: number, total: number) => void
}

export async function exportCardsPng(
  deck: Deck,
  { language, onProgress }: BatchExportOptions,
): Promise<void> {
  await prepare(deck, language)

  const renderer = createCardRenderer(
    buildIconLibrary(deck.icons, deck.factions, language),
    buildFactionLibrary(deck.factions, language),
    language,
    EXPORT_SCALE,
  )
  const zip = createZip()
  const usedNames = new Set<string>()

  try {
    for (let index = 0; index < deck.cards.length; index++) {
      const canvas = renderer.draw(deck.cards[index])
      const blob = await toBlob(canvas)
      release(canvas)

      zip.addFile(uniqueName(usedNames, deck.cards[index].title, index), new Uint8Array(await blob.arrayBuffer()))
      onProgress?.(index + 1, deck.cards.length)
    }
  } finally {
    renderer.dispose()
  }

  downloadBlob(zip.finish(), 'cartas.zip')
}

/** Dos cartas sin nombre —o el mismo nombre— no pueden pisarse en el zip. */
function uniqueName(used: Set<string>, title: string, index: number): string {
  const base = fileSafe(title.trim() || `carta-${index + 1}`)
  let name = `${base}.png`
  for (let n = 2; used.has(name); n++) name = `${base}-${n}.png`
  used.add(name)
  return name
}
