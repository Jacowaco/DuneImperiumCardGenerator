import { Shape } from 'react-konva'
import { fontString, type Glyph } from '../text'

/**
 * Dibuja una lista de glifos ya posicionados, cada uno con su propio tamaño.
 *
 * Usamos un `sceneFunc` en vez de `Konva.Text` para controlar exactamente la
 * línea de base y poder mezclar tamaños dentro de una misma línea.
 */
export function TextShape({
  glyphs,
  x,
  baseline,
  fill,
  weight,
  opacity,
}: {
  glyphs: Glyph[]
  x: number
  baseline: number
  fill: string
  weight: number
  opacity?: number
}) {
  return (
    <Shape
      listening={false}
      opacity={opacity}
      sceneFunc={(context) => {
        context.setAttr('textBaseline', 'alphabetic')
        context.setAttr('fillStyle', fill)
        for (const glyph of glyphs) {
          context.setAttr('font', fontString(glyph.size, weight))
          context.fillText(glyph.char, x + glyph.x, baseline)
        }
      }}
    />
  )
}
