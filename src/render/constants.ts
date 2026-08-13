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
  x: 42,
  startingX: 83,
  right: 706,
  /**
   * Límite derecho cuando hay costo de compra: el rombo mide su ancho por
   * partida, y a la altura de la línea de base (74) su borde izquierdo cae en
   * x=616 (medido en `card-cost.png`, alpha > 10). Se deja un margen para que
   * el texto no roce el rombo.
   */
  costRight: 600,
  baseline: 74,
  capHeight: 37,
  smallCapRatio: 26 / 37,
  letterSpacing: 2,
  wordSpacing: 16,
  weight: 400,
  color: '#d9dad8',
} as const

/**
 * Banda de facción. A diferencia del resto de las capas, no tiene un PNG por
 * facción: tiene uno por posición en la pila (la de arriba es la más ancha,
 * `widths[1]`), y el código la tiñe con el color de la facción que le toca y
 * le dibuja el nombre encima.
 *
 * Las cuatro posiciones **no** miden lo mismo de alto: 43, 43, 42 y 43 px
 * (medido del alpha de `faction-bands/*.png`, borde a borde). Apilarlas con
 * un paso fijo promedio (42,75) deja una línea de fondo de 1 px entre un par
 * cualquiera, porque el redondeo se acumula. `offsets` es la suma acumulada
 * de los altos reales de las posiciones anteriores, así que cada banda se
 * apoya justo donde termina la de arriba, sea cual sea la combinación.
 *
 * `widths` es el ancho en el borde superior de cada posición; el corte
 * diagonal lo va angostando hacia abajo a razón de casi `height` px por banda,
 * así que el nombre no puede usar todo ese ancho — ver `text.rightPadding`.
 */
export const FACTION_BAND = {
  top: 90,
  height: 42.75,
  offsets: { 1: 0, 2: 43, 3: 86, 4: 128 } as Record<number, number>,
  widths: { 1: 350, 2: 311, 3: 270, 4: 229 } as Record<number, number>,
  text: {
    x: 37,
    capHeight: 19,
    weight: 600,
    color: '#d9dad8',
    rightPadding: 50,
  },
} as const

/**
 * Columna de iconos de agente, sobre el borde izquierdo del arte. `top` es la
 * primera de las siete ranuras del reglamento, pero la columna se llena desde
 * la última hacia arriba: los iconos terminan pegados a la caja de contenido y
 * lo que sobra queda vacío del lado del arte. Cada estilo tiene su propio
 * origen porque los recortes del PSD tienen bordes distintos.
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
    /**
     * Color del interior de la caja, muestreado de `layers/play-box-1.png`.
     * Es plano: el mismo píxel en todo el ancho y el alto. En la carta lo
     * dibuja el PNG; esto es para que la UI pueda mostrar un icono sobre el
     * fondo que va a tener de verdad.
     */
    surface: '#8e867a',
  },
  reveal: {
    top: 810,
    bottom: 1007,
    /**
     * Borde izquierdo del contenido cuando la banda lleva la banderola de
     * Unload: la placa roja ocupa el arranque de la banda. 213 es la punta del
     * chevrón, que es lo más ancho que llega (medido sobre `unload.png`, píxel
     * rojo más a la derecha en el alto donde cae la fila de iconos; el cuerpo
     * de la placa termina antes, en 189).
     */
    unloadLeft: 213,
  },
  /** Alto de referencia de los iconos de las hojas del PSD. */
  nominalIconHeight: 99,
  /**
   * Texto mezclado con los iconos. Las tres medidas están en la misma escala
   * que `nominalIconHeight` y se achican juntas cuando el contenido no entra.
   *
   * Salen de medir una carta impresa (`reference/cards/appropriate.png`): ahí
   * el bloque está al 66% porque tiene tres renglones, y a tamaño completo dan
   * icono 99 / mayúscula 33 / interlineado 62.
   */
  text: {
    capHeight: 33,
    lineHeight: 62,
    weight: 400,
    /** La caja de play es clara y la banda de reveal oscura. */
    playColor: '#26241f',
    revealColor: '#d9dad8',
  },
  padding: 8,
  /**
   * Margen a los costados. El borde interior de la caja es el límite duro,
   * pero el texto pegado a la línea se lee mal, así que corta antes.
   */
  paddingX: 24,
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
