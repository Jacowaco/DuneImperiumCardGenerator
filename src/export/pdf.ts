/**
 * Escritor de PDF mínimo: una imagen por página, a tamaño real.
 *
 * Es a mano y no con una librería porque lo que hace falta es muy poco —una
 * página, una imagen, sin texto ni fuentes— y una dependencia de PDF pesa más
 * que todo el resto de la app junta.
 *
 * Lo que aporta el PDF sobre el PNG es el **tamaño físico**: la hoja viaja
 * declarada en puntos, así que la imprenta la imprime a escala 1:1 y nadie
 * puede arruinarla con un "ajustar a la página", que es la forma más común de
 * que las cartas salgan del tamaño equivocado.
 *
 * La imagen va con `FlateDecode` —sin pérdida— y no como JPEG: el texto y las
 * líneas de la carta son justo lo que peor le sienta a la compresión con
 * pérdida.
 */

import { AppError } from '../model/errors'

const encoder = new TextEncoder()

/** 1 punto = 1/72 de pulgada, que es la unidad en la que el PDF mide la hoja. */
const POINTS_PER_MM = 72 / 25.4

/**
 * El canvas se lee por bandas en vez de entero: una hoja SRA3 son 60 MB de
 * píxeles y comprimirla de a pedazos evita tenerlos todos juntos en memoria.
 */
const BAND_HEIGHT = 256

/**
 * Los dos objetos que sólo se pueden escribir al final —el catálogo necesita
 * saber cuántas páginas hay— se reservan al principio, así los objetos de
 * página pueden nombrar a su padre sin tener que volver atrás.
 */
const CATALOG = 1
const PAGES = 2
const FIRST_FREE = 3

export type PdfWriter = {
  addPage: (canvas: HTMLCanvasElement) => Promise<void>
  finish: () => Blob
}

export function createPdf(widthMm: number, heightMm: number): PdfWriter {
  const parts: Uint8Array[] = []
  /** Offset en bytes de cada objeto, indexado por número de objeto. */
  const offsets: number[] = []
  const pageObjects: number[] = []
  let next = FIRST_FREE
  let length = 0

  const push = (data: Uint8Array | string) => {
    const bytes = typeof data === 'string' ? encoder.encode(data) : data
    parts.push(bytes)
    length += bytes.length
  }

  /** Abre un objeto con el número dado (o el siguiente libre) y anota dónde arranca. */
  const open = (number = next++) => {
    offsets[number] = length
    push(`${number} 0 obj\n`)
    return number
  }

  const close = () => push('endobj\n')

  // El comentario binario le avisa a las herramientas que el archivo no es texto.
  push('%PDF-1.7\n')
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  const width = round(widthMm * POINTS_PER_MM)
  const height = round(heightMm * POINTS_PER_MM)

  return {
    async addPage(canvas) {
      const data = await deflate(canvas)

      const image = open()
      push(
        `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode ` +
          `/Length ${data.length} >>\nstream\n`,
      )
      push(data)
      push('\nendstream\n')
      close()

      // `cm` estira la imagen —que mide 1 × 1 por definición— a la hoja entera.
      const stream = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q\n`
      const contents = open()
      push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream\n`)
      close()

      pageObjects.push(open())
      push(
        `<< /Type /Page /Parent ${PAGES} 0 R /MediaBox [0 0 ${width} ${height}] ` +
          `/Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${contents} 0 R >>\n`,
      )
      close()
    },

    finish() {
      open(PAGES)
      push(
        `<< /Type /Pages /Count ${pageObjects.length} /Kids [` +
          `${pageObjects.map((number) => `${number} 0 R`).join(' ')}] >>\n`,
      )
      close()

      open(CATALOG)
      push(`<< /Type /Catalog /Pages ${PAGES} 0 R >>\n`)
      close()

      // Tabla de referencias cruzadas: cada entrada mide exactamente 20 bytes,
      // y van en orden de número de objeto, no en el orden en que se escribieron.
      const startxref = length
      const total = next

      push(`xref\n0 ${total}\n`)
      push('0000000000 65535 f \n')
      for (let number = 1; number < total; number++) {
        push(`${String(offsets[number]).padStart(10, '0')} 00000 n \n`)
      }

      push(
        `trailer\n<< /Size ${total} /Root ${CATALOG} 0 R >>\n` +
          `startxref\n${startxref}\n%%EOF\n`,
      )

      return new Blob(parts as BlobPart[], { type: 'application/pdf' })
    },
  }
}

/** Sin decimales de más: el PDF no los necesita y ensucian el archivo. */
const round = (value: number) => Math.round(value * 100) / 100

/**
 * Píxeles del canvas a RGB comprimido con zlib, que es lo que `FlateDecode`
 * espera. El alpha se descarta: la hoja se dibuja sobre blanco y es opaca.
 */
async function deflate(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const context = canvas.getContext('2d')
  if (!context) throw new AppError('sheet-read-failed')

  const stream = new CompressionStream('deflate')
  const writer = stream.writable.getWriter()
  const reader = stream.readable.getReader()

  const chunks: Uint8Array[] = []
  const collect = (async () => {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value as Uint8Array)
    }
  })()

  for (let y = 0; y < canvas.height; y += BAND_HEIGHT) {
    const band = context.getImageData(0, y, canvas.width, Math.min(BAND_HEIGHT, canvas.height - y))
    await writer.write(toRgb(band.data))
  }

  await writer.close()
  await collect

  return concat(chunks)
}

function toRgb(rgba: Uint8ClampedArray): Uint8Array<ArrayBuffer> {
  const rgb = new Uint8Array((rgba.length / 4) * 3)
  for (let pixel = 0, out = 0; pixel < rgba.length; pixel += 4) {
    rgb[out++] = rgba[pixel]
    rgb[out++] = rgba[pixel + 1]
    rgb[out++] = rgba[pixel + 2]
  }
  return rgb
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}
