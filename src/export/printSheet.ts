import { AppError } from '../model/errors'
import { buildFactionLibrary } from '../model/factionLibrary'
import { buildIconLibrary } from '../model/iconLibrary'
import type { Language } from '../model/language'
import type { Deck } from '../model/storage'
import { downloadBlob, release } from './download'
import {
  BLEED,
  cardPosition,
  impose,
  layoutPage,
  MARK_GAP,
  MARK_WIDTH,
  PAPERS,
  sheetCount,
  type Imposition,
  type PageLayout,
  type PaperId,
} from './paper'
import { createPdf } from './pdf'
import { createCardRenderer, prepare } from './renderCard'

/**
 * Hojas de impresión: la grilla de cartas que entra en el papel elegido, con
 * marcas de corte, en un PDF a tamaño real.
 *
 * Todo se dibuja a **300 DPI**, no al doble como el export de una carta suelta.
 * A 300 DPI el template se dibuja píxel a píxel —los PNG del PSD son de esa
 * resolución—, así que subir la escala no agrega detalle: sólo cuadruplica el
 * archivo.
 *
 * Los dos modos responden a dos destinos distintos:
 *
 * - **Pegadas** (casa): las cartas se tocan y comparten el corte, así que un
 *   corte de guillotina sirve para dos cartas. Entran más por hoja y no se
 *   desperdicia papel, pero no perdona el desalineado.
 * - **Con sangrado** (imprenta): cada carta se dibuja 3 mm más grande de negro
 *   por lado y se corta sola. Entran menos, pero un corte corrido deja negro
 *   en vez de un filo blanco.
 */

/**
 * Compone una página sobre un canvas del tamaño de la hoja.
 *
 * Con sangrado se pinta el negro de la carta antes de dibujarla: el borde de
 * la carta ya es negro sólido, así que la unión es invisible y el sangrado no
 * inventa ningún píxel.
 */
export function drawSheet(cards: HTMLCanvasElement[], imposition: Imposition): HTMLCanvasElement {
  const layout = layoutPage(cards.length, imposition)

  const sheet = document.createElement('canvas')
  sheet.width = imposition.width
  sheet.height = imposition.height

  const context = sheet.getContext('2d')
  if (!context) throw new AppError('sheet-canvas-failed')

  // Blanco y no transparente: esto va a una impresora.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, sheet.width, sheet.height)

  cards.forEach((card, index) => {
    const { x, y } = cardPosition(index, layout, imposition)

    if (imposition.bleed) {
      context.fillStyle = '#000000'
      context.fillRect(x, y, imposition.pitchX, imposition.pitchY)
    }

    context.drawImage(card, x + (imposition.bleed ? BLEED : 0), y + (imposition.bleed ? BLEED : 0))
  })

  drawCropMarks(context, layout)
  return sheet
}

/**
 * Una marca por cada línea de corte, en los cuatro márgenes.
 *
 * Van afuera del bloque y no entre las cartas porque entre las cartas no hay
 * lugar: pegadas se tocan, y con sangrado el hueco entre dos es todo tinta.
 * Como la grilla es regular, alcanza con marcarla en los bordes.
 *
 * Se dibujan con `fillRect` y no con `stroke`: una línea de 2 px sobre una
 * coordenada entera sale nítida, y un `stroke` la repartiría entre dos píxeles.
 */
function drawCropMarks(context: CanvasRenderingContext2D, layout: PageLayout) {
  const { left, top, right, bottom, trimX, trimY, markX, markY } = layout

  context.fillStyle = '#000000'

  if (markX > 0) {
    for (const x of trimX) {
      context.fillRect(x - MARK_WIDTH / 2, top - MARK_GAP - markX, MARK_WIDTH, markX)
      context.fillRect(x - MARK_WIDTH / 2, bottom + MARK_GAP, MARK_WIDTH, markX)
    }
  }

  if (markY > 0) {
    for (const y of trimY) {
      context.fillRect(left - MARK_GAP - markY, y - MARK_WIDTH / 2, markY, MARK_WIDTH)
      context.fillRect(right + MARK_GAP, y - MARK_WIDTH / 2, markY, MARK_WIDTH)
    }
  }
}

/**
 * Arma el PDF entero y lo baja.
 *
 * Las páginas se hacen de a una y se sueltan enseguida: una hoja SRA3 con sus
 * cartas son más de 100 MB de canvas, y acumularlas por un mazo largo no
 * termina bien. Al PDF ya comprimido no le pesa.
 */
export type SheetOptions = {
  paper: PaperId
  bleed: boolean
  language: Language
  onProgress?: (done: number, total: number) => void
}

export async function exportPrintSheets(
  deck: Deck,
  { paper, bleed, language, onProgress }: SheetOptions,
): Promise<void> {
  await prepare(deck)

  const imposition = impose(paper, bleed)
  const { cards } = deck
  const pages = sheetCount(cards.length, imposition)

  const pdf = createPdf(PAPERS[paper].widthMm, PAPERS[paper].heightMm)
  const renderer = createCardRenderer(
    buildIconLibrary(deck.icons, deck.factions, language),
    buildFactionLibrary(deck.factions, language),
    language,
  )

  try {
    for (let page = 0; page < pages; page++) {
      const slice = cards.slice(page * imposition.perSheet, (page + 1) * imposition.perSheet)
      const drawn = slice.map((card) => renderer.draw(card))
      const sheet = drawSheet(drawn, imposition)

      await pdf.addPage(sheet)

      drawn.forEach(release)
      release(sheet)
      onProgress?.(page + 1, pages)
    }
  } finally {
    renderer.dispose()
  }

  downloadBlob(pdf.finish(), `cartas-${paper}${bleed ? '-sangrado' : ''}.pdf`)
}
