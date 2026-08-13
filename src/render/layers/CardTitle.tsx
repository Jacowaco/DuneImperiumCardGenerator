import { Image as KonvaImage } from 'react-konva'

import nameBandUrl from '../../assets/layers/card-name.png'
import nameBandStartingUrl from '../../assets/layers/card-name-starting.png'
import type { Card } from '../../model/card'
import { TITLE } from '../constants'
import { useCardImage } from '../imageCache'
import { layoutSmallCaps } from '../text'
import { TextShape } from './TextShape'

/**
 * `placeholder` es la ayuda del editor para una carta sin nombre: la placa
 * vacía no dice que se pueda escribir ahí. Lo pide sólo el preview editable —
 * la galería, las hojas y los PNG no lo pasan, así que ven la carta terminada.
 */
export function CardTitle({ card, placeholder }: { card: Card; placeholder?: string }) {
  const band = useCardImage(card.starting ? nameBandStartingUrl : nameBandUrl)

  const empty = card.title.trim() === ''
  const text = empty && placeholder ? placeholder : card.title

  const x = card.starting ? TITLE.startingX : TITLE.x
  const right = card.cost !== null ? TITLE.costRight : TITLE.right
  const { glyphs } = layoutSmallCaps(text, {
    capHeight: TITLE.capHeight,
    smallCapRatio: TITLE.smallCapRatio,
    letterSpacing: TITLE.letterSpacing,
    wordSpacing: TITLE.wordSpacing,
    weight: TITLE.weight,
    maxWidth: right - x,
  })

  return (
    <>
      <KonvaImage image={band} listening={false} />
      <TextShape
        glyphs={glyphs}
        x={x}
        baseline={TITLE.baseline}
        fill={TITLE.color}
        weight={TITLE.weight}
        opacity={empty ? 0.35 : undefined}
      />
    </>
  )
}
