/**
 * Errores que hay que mostrarle al usuario, en su idioma.
 *
 * Los lugares que fallan —parsear un archivo, leer una imagen, preparar un
 * canvas— no saben qué idioma está eligiendo la UI, así que en vez de tirar el
 * texto ya armado tiran un código y sus parámetros; quien atrapa el error
 * (siempre en un componente, que sí tiene el idioma a mano) lo traduce con
 * `describeError` de `src/i18n/strings.ts`.
 */
export type ErrorCode =
  | 'not-a-card'
  | 'no-cards'
  | 'not-a-library'
  | 'empty-library'
  | 'empty-image'
  | 'read-failed'
  | 'invalid-image'
  | 'canvas-failed'
  | 'png-failed'
  | 'sheet-canvas-failed'
  | 'sheet-read-failed'
  | 'card-canvas-failed'

export class AppError extends Error {
  code: ErrorCode
  params: Record<string, string>

  constructor(code: ErrorCode, params: Record<string, string> = {}) {
    super(code)
    this.code = code
    this.params = params
  }
}
