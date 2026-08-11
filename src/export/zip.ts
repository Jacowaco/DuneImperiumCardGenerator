/**
 * Escritor de ZIP mínimo, sin compresión (`STORE`).
 *
 * Es a mano y no con una librería por el mismo motivo que el PDF de las hojas
 * de impresión (`pdf.ts`): lo que hace falta es muy poco. Sin compresión
 * porque lo que entra son PNG, que ya vienen comprimidos — deflatearlos de
 * nuevo apenas los achica y complica el escritor con muy poco a cambio.
 */

const LOCAL_SIGNATURE = 0x04034b50
const CENTRAL_SIGNATURE = 0x02014b50
const END_SIGNATURE = 0x06054b50

const encoder = new TextEncoder()

export type ZipWriter = {
  addFile: (name: string, data: Uint8Array) => void
  finish: () => Blob
}

export function createZip(): ZipWriter {
  const fileParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0
  let count = 0

  return {
    addFile(name, data) {
      const nameBytes = encoder.encode(name)
      const crc = crc32(data)
      const { time, date } = dosDateTime(new Date())

      const local = new Uint8Array(30 + nameBytes.length)
      const view = new DataView(local.buffer)
      view.setUint32(0, LOCAL_SIGNATURE, true)
      view.setUint16(4, 20, true) // versión mínima para leerlo
      view.setUint16(6, 0, true) // flags
      view.setUint16(8, 0, true) // método: sin comprimir
      view.setUint16(10, time, true)
      view.setUint16(12, date, true)
      view.setUint32(14, crc, true)
      view.setUint32(18, data.length, true) // tamaño comprimido == real
      view.setUint32(22, data.length, true)
      view.setUint16(26, nameBytes.length, true)
      view.setUint16(28, 0, true) // extra
      local.set(nameBytes, 30)

      fileParts.push(local, data)

      const central = new Uint8Array(46 + nameBytes.length)
      const cview = new DataView(central.buffer)
      cview.setUint32(0, CENTRAL_SIGNATURE, true)
      cview.setUint16(4, 20, true) // versión que lo escribió
      cview.setUint16(6, 20, true)
      cview.setUint16(8, 0, true)
      cview.setUint16(10, 0, true)
      cview.setUint16(12, time, true)
      cview.setUint16(14, date, true)
      cview.setUint32(16, crc, true)
      cview.setUint32(20, data.length, true)
      cview.setUint32(24, data.length, true)
      cview.setUint16(28, nameBytes.length, true)
      cview.setUint16(30, 0, true) // extra
      cview.setUint16(32, 0, true) // comentario
      cview.setUint16(34, 0, true) // disco
      cview.setUint16(36, 0, true) // atributos internos
      cview.setUint32(38, 0, true) // atributos externos
      cview.setUint32(42, offset, true) // dónde arranca el header local
      central.set(nameBytes, 46)

      centralParts.push(central)

      offset += local.length + data.length
      count++
    },

    finish() {
      const centralStart = offset
      const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)

      const end = new Uint8Array(22)
      const view = new DataView(end.buffer)
      view.setUint32(0, END_SIGNATURE, true)
      view.setUint16(4, 0, true)
      view.setUint16(6, 0, true)
      view.setUint16(8, count, true)
      view.setUint16(10, count, true)
      view.setUint32(12, centralSize, true)
      view.setUint32(16, centralStart, true)
      view.setUint16(20, 0, true) // sin comentario

      return new Blob([...fileParts, ...centralParts, end] as BlobPart[], {
        type: 'application/zip',
      })
    },
  }
}

/** Fecha/hora en el formato de 16 bits que usa el ZIP (DOS), no ISO. */
function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() >> 1) & 0x1f)
  const dosDate =
    (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f)
  return { time, date: dosDate }
}

let crcTable: Uint32Array | null = null

function crc32(data: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }

  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
