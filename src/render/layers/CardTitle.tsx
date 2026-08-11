import { Image as KonvaImage } from 'react-konva'

import nameBandUrl from '../../assets/layers/card-name.png'
import nameBandStartingUrl from '../../assets/layers/card-name-starting.png'
import type { Card } from '../../model/card'
import { TITLE } from '../constants'
import { useCardImage } from '../imageCache'
import { layoutSmallCaps } from '../text'
import { TextShape } from './TextShape'

export function CardTitle({ card }: { card: Card }) {
  const band = useCardImage(card.starting ? nameBandStartingUrl : nameBandUrl)

  const x = card.starting ? TITLE.startingX : TITLE.x
  const right = card.cost !== null ? TITLE.costRight : TITLE.right
  const { glyphs } = layoutSmallCaps(card.title, {
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
      />
    </>
  )
}
