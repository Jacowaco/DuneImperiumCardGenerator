import { AppError } from '../model/errors'

/**
 * Bajar un archivo generado en el navegador. Es un `<a download>` porque no
 * hay otra forma: el diálogo nativo de guardar sólo lo abre el usuario, y
 * pedirlo una vez por hoja sería peor que dejar que se bajen todas juntas.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new AppError('png-failed'))
    }, 'image/png')
  })
}

/**
 * Un canvas de hoja A4 son ~35 MB de píxeles. El recolector los suelta solo,
 * pero recién cuando le pinta: llevarlo a 0 × 0 los libera ya, y exportar un
 * mazo largo deja de acumular una hoja atrás de otra.
 */
export function release(canvas: HTMLCanvasElement) {
  canvas.width = 0
  canvas.height = 0
}
