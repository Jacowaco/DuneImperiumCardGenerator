import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import { ICON_NUMBER_COLORS, ICONS } from '../../assets/icons'
import type { Card } from '../../model/card'
import { CONTENT } from '../constants'
import { layoutIconRow, playBox, revealBox, type IconPlacement } from '../iconRow'
import { fontSizeForCapHeight, textWidth } from '../text'
import { TextShape } from './TextShape'

/** Las filas de iconos de las dos cajas de contenido. */
export function ContentIcons({ card }: { card: Card }) {
  const play = card.playRows > 0 ? layoutIconRow(card.playIcons, playBox(card.playRows)) : []
  const reveal = card.revealBox ? layoutIconRow(card.revealIcons, revealBox(card.playRows)) : []

  return (
    <>
      {[...play, ...reveal].map((placement, index) => (
        <ContentIcon key={`${placement.entry.icon}-${index}`} placement={placement} />
      ))}
    </>
  )
}

function ContentIcon({ placement }: { placement: IconPlacement }) {
  const { entry, x, y, width, height } = placement
  const [image] = useImage(ICONS[entry.icon].url)

  const numberColor = ICON_NUMBER_COLORS[entry.icon]
  const digitHeight = height * CONTENT.numberHeightRatio
  const size = fontSizeForCapHeight(digitHeight, CONTENT.numberWeight)
  const text = String(entry.amount)

  return (
    <>
      <KonvaImage image={image} x={x} y={y} width={width} height={height} listening={false} />

      {numberColor && (
        <TextShape
          glyphs={[{ char: text, x: 0, size }]}
          x={x + width / 2 - textWidth(text, size, CONTENT.numberWeight) / 2}
          baseline={y + height / 2 + digitHeight / 2}
          fill={numberColor}
          weight={CONTENT.numberWeight}
        />
      )}
    </>
  )
}
