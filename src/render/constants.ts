/**
 * Medidas del template. Todas las capas exportadas del PSD comparten este
 * lienzo, así que se dibujan siempre en (0, 0) sin cálculos de posición.
 *
 * 750 x 1039 px = 63.5 x 88 mm a 300 DPI (carta póker estándar).
 */
export const CARD_WIDTH = 750
export const CARD_HEIGHT = 1039

/**
 * Recorte útil de la capa "Card Art Container": el rectángulo gris donde
 * el jugador encuadra su imagen. Medido del alpha del PNG exportado.
 */
export const ART_RECT = {
  x: 23,
  y: 84,
  width: 704,
  height: 626,
} as const
