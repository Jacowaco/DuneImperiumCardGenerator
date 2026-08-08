/**
 * Medición de texto contra un canvas fuera de pantalla.
 *
 * Dibujamos el texto con un `sceneFunc` propio en vez de usar `Konva.Text`
 * porque necesitamos control exacto de la línea de base y del tamaño por
 * carácter (las versalitas del título llevan la inicial más grande).
 */

export const CARD_FONT = "'Jost Variable', system-ui, sans-serif"
/** El nombre suelto sirve para preguntarle a document.fonts si ya cargó. */
export const CARD_FONT_NAME = 'Jost Variable'

let measuringContext: CanvasRenderingContext2D | null = null

function context() {
  if (!measuringContext) {
    measuringContext = document.createElement('canvas').getContext('2d')!
  }
  return measuringContext
}

export function fontString(size: number, weight = 400) {
  return `${weight} ${size}px ${CARD_FONT}`
}

/** Alto de mayúscula por cada píxel de fontSize, medido de la fuente real. */
function capHeightRatio(weight: number) {
  const context2d = context()
  context2d.font = fontString(100, weight)
  return context2d.measureText('H').actualBoundingBoxAscent / 100
}

/** fontSize necesario para que las mayúsculas midan exactamente `capHeight`. */
export function fontSizeForCapHeight(capHeight: number, weight = 400) {
  return capHeight / capHeightRatio(weight)
}

export function textWidth(text: string, size: number, weight = 400) {
  const context2d = context()
  context2d.font = fontString(size, weight)
  return context2d.measureText(text).width
}

export type Glyph = { char: string; x: number; size: number }

type SmallCapsOptions = {
  /** Alto de la mayúscula inicial de cada palabra. */
  capHeight: number
  /** Proporción del resto de las letras respecto de la inicial. */
  smallCapRatio: number
  letterSpacing: number
  wordSpacing: number
  weight: number
  /** Si el texto no entra, se achica todo proporcionalmente. */
  maxWidth: number
}

/**
 * Versalitas al estilo de las cartas: todo en mayúsculas, con la primera letra
 * de cada palabra más grande. Devuelve la posición de cada carácter respecto
 * del inicio del texto.
 */
export function layoutSmallCaps(text: string, options: SmallCapsOptions) {
  const { capHeight, smallCapRatio, letterSpacing, wordSpacing, weight, maxWidth } = options

  const bigSize = fontSizeForCapHeight(capHeight, weight)
  const smallSize = fontSizeForCapHeight(capHeight * smallCapRatio, weight)

  const glyphs: Glyph[] = []
  let x = 0

  text.trim().split(/\s+/).filter(Boolean).forEach((word, wordIndex) => {
    if (wordIndex > 0) x += wordSpacing
    for (const [index, char] of [...word.toUpperCase()].entries()) {
      const size = index === 0 ? bigSize : smallSize
      glyphs.push({ char, x, size })
      x += textWidth(char, size, weight) + letterSpacing
    }
  })

  // El último letterSpacing no cuenta como ancho del texto.
  let width = glyphs.length ? x - letterSpacing : 0

  // El avance del texto escala linealmente con el tamaño, así que alcanza con
  // multiplicar todo por el mismo factor para que entre.
  if (width > maxWidth && maxWidth > 0) {
    const factor = maxWidth / width
    for (const glyph of glyphs) {
      glyph.x *= factor
      glyph.size *= factor
    }
    width = maxWidth
  }

  return { glyphs, width }
}
