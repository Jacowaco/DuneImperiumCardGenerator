import cardBackUrl from '../assets/card-back.png'
import { AppError } from '../model/errors'
import { buildFactionLibrary } from '../model/factionLibrary'
import { buildIconLibrary } from '../model/iconLibrary'
import type { Language } from '../model/language'
import type { Deck } from '../model/storage'
import { cachedImage, loadImage } from '../render/imageCache'
import { downloadBlob, release } from './download'
import {
  BLEED,
  cardPosition,
  impose,
  layoutPage,
  MARK_GAP,
  MARK_WIDTH,
  mirrorIndex,
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
 *
 * Con los reversos prendidos, cada hoja de frentes lleva atrás su hoja de
 * dorsos: son las mismas hojas de papel, con el doble de páginas en el PDF.
 */

/**
 * Compone una página sobre un canvas del tamaño de la hoja.
 *
 * Con sangrado se pinta el negro de la carta antes de dibujarla: el borde de
 * la carta ya es negro sólido, así que la unión es invisible y el sangrado no
 * inventa ningún píxel. El dorso también tiene su borde negro, así que la
 * cuenta le sirve igual.
 */
export function drawSheet(
  cards: CanvasImageSource[],
  imposition: Imposition,
  /**
   * Espeja la grilla para la cara de atrás. **Se espeja el acomodo, no la
   * imagen**: el dorso se imprime como es y es el papel el que se da vuelta.
   */
  mirror = false,
): HTMLCanvasElement {
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
    const cell = mirror ? mirrorIndex(index, layout, imposition) : index
    const { x, y } = cardPosition(cell, layout, imposition)

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
  /** Cuántas veces se imprime el mazo entero, además de las copias de cada carta. */
  copies: number
  /** Intercalar la hoja de dorsos detrás de cada hoja de frentes. */
  backs: boolean
  language: Language
  onProgress?: (done: number, total: number) => void
}

/**
 * Las cartas que van a la hoja, ya repetidas: cada una tantas veces como
 * ejemplares tenga en el mazo (`card.copies`) por las veces que se pidió el
 * mazo entero.
 *
 * Las copias de una carta salen juntas, una al lado de la otra, y no
 * desparramadas por la hoja: así se cortan de una y no hay que ir a buscarlas
 * entre el resto del mazo.
 */
export const sheetCards = <T extends { copies: number }>(cards: T[], copies: number): T[] =>
  cards.flatMap((card) => Array<T>(card.copies * copies).fill(card))

/**
 * El dorso del mazo, uno solo para todas las cartas: en Dune: Imperium el
 * reverso no distingue una carta de otra, así que no es un campo de `Card` —
 * es una capa más del template, como el fondo negro.
 *
 * Se dibuja con `drawImage` a mano y no montando un `CardStage`, que es lo que
 * hace el frente, porque no hay nada que componer: es el PNG tal cual, del
 * tamaño exacto de la carta.
 *
 * Por eso tampoco vive en `assets/layers/` ni lo precarga `prepare()`: son más
 * de 1 MB que la mayoría de las exportaciones no necesita. Se carga acá, sólo
 * cuando se piden los reversos, y la caché lo deja listo para las páginas que
 * siguen.
 */
async function loadCardBack(): Promise<HTMLImageElement> {
  await loadImage(cardBackUrl)
  const back = cachedImage(cardBackUrl)
  // La caché resuelve igual las imágenes que no cargan, para no dejar colgado
  // un export por un icono. Acá sí hay que cortar: sin dorso, la hoja de atrás
  // saldría en blanco y el papel ya estaría gastado.
  if (!back) throw new AppError('sheet-canvas-failed')
  return back
}

export async function exportPrintSheets(
  deck: Deck,
  { paper, bleed, copies, backs, language, onProgress }: SheetOptions,
): Promise<void> {
  await prepare(deck, language)
  const back = backs ? await loadCardBack() : null

  const imposition = impose(paper, bleed)
  const cards = sheetCards(deck.cards, copies)
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

      // El dorso va enseguida del frente que le toca, no todos al final: así
      // el PDF sale en el orden que espera el dúplex de la impresora.
      if (back) {
        const cells = Array<HTMLImageElement>(slice.length).fill(back)
        const backSheet = drawSheet(cells, imposition, true)
        await pdf.addPage(backSheet)
        release(backSheet)
      }

      onProgress?.(page + 1, pages)
    }
  } finally {
    renderer.dispose()
  }

  const suffix = `${bleed ? '-sangrado' : ''}${backs ? '-doble-faz' : ''}`
  downloadBlob(pdf.finish(), `cartas-${paper}${suffix}.pdf`)
}
