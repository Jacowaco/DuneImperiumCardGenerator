/**
 * Medidas del template. Todas las capas exportadas del PSD comparten este
 * lienzo, así que se dibujan siempre en (0, 0) sin cálculos de posición.
 *
 * 750 x 1039 px = 63.5 x 88 mm a 300 DPI (carta póker estándar).
 *
 * Los números de abajo salen de medir los PNG del PSD y el render de
 * referencia, no de estimar a ojo. Si cambia el template, se remiden.
 */
export const CARD_WIDTH = 750
export const CARD_HEIGHT = 1039

/**
 * Recorte útil de la capa "Card Art Container": el rectángulo gris donde
 * el jugador encuadra su imagen.
 */
export const ART_RECT = {
  x: 23,
  y: 84,
  width: 704,
  height: 626,
} as const

/**
 * Título de la carta. La banda va de y=23 a y=91; el texto se apoya en la
 * línea de base 76, con la inicial de cada palabra a 37 px de alto y el resto
 * a 26. En las cartas de mazo inicial el texto arranca más a la derecha para
 * dejar lugar al rombo.
 */
export const TITLE = {
  x: 38,
  startingX: 83,
  right: 706,
  baseline: 76,
  capHeight: 37,
  smallCapRatio: 26 / 37,
  letterSpacing: 2,
  wordSpacing: 16,
  weight: 400,
  color: '#d9dad8',
} as const

/**
 * Columna de iconos de agente, arriba a la izquierda debajo de la banda de
 * facción. Los iconos elegidos se apilan desde arriba con este paso; el resto
 * de la columna queda vacío. Cada estilo tiene su propio origen porque los
 * recortes del PSD tienen bordes distintos.
 */
export const AGENT_COLUMN = {
  locations: { x: 29, top: 143, pitch: 78.8 },
  infiltrate: { x: 25, top: 141, pitch: 78.8 },
} as const

/**
 * Filas de iconos dentro de las cajas de contenido.
 *
 * `play.top` y `play.bottoms` son el borde interior de cada caja (la línea
 * clara de adentro), no el exterior. La fila de reveal no tiene caja propia
 * con borde: ocupa lo que queda entre el pie de la caja de play y el pie de
 * la banda, así que su centro se calcula en tiempo de dibujo.
 */
export const CONTENT = {
  left: 38,
  right: 711,
  play: {
    top: 705,
    bottoms: { 1: 804, 2: 843, 3: 878 } as Record<number, number>,
  },
  reveal: { top: 810, bottom: 1007 },
  /** Alto de referencia de los iconos de las hojas del PSD. */
  nominalIconHeight: 99,
  padding: 8,
  gap: 12,
  /** Alto del número respecto del icono, para los que salen vacíos. */
  numberHeightRatio: 0.48,
  numberWeight: 500,
} as const

/**
 * Costo de compra. El rombo está centrado en (676, 93) y el número mide 71 px
 * de alto. La variante con beneficio de compra suma una cinta hacia abajo con
 * un hueco para un icono.
 */
export const COST = {
  x: 676,
  y: 93,
  digitHeight: 71,
  weight: 500,
  color: '#e3eaef',
  /**
   * Hueco del icono de beneficio en la cinta. `digitHeight` es el alto del
   * número que la app dibuja centrado encima de los iconos que salen vacíos
   * del PSD (solari, especia, persuasión).
   */
  benefit: { x: 679, y: 280, size: 70, digitHeight: 34 },
} as const
