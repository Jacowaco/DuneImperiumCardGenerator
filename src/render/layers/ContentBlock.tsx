import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import { ICON_NUMBER_COLORS, ICONS, type IconId } from '../../assets/icons'
import type { Card } from '../../model/card'
import { CONTENT } from '../constants'
import { layoutContent, playBox, revealBox, type Placement } from '../contentLayout'
import { fontSizeForCapHeight, textWidth } from '../text'
import { TextShape } from './TextShape'

/** El contenido de las dos cajas: iconos y texto mezclados. */
export function ContentBlock({ card }: { card: Card }) {
  return (
    <>
      <Block
        placements={layoutContent(card.playContent, playBox(card.playRows))}
        textColor={CONTENT.text.playColor}
      />
      <Block
        placements={layoutContent(card.revealContent, revealBox(card.playRows))}
        textColor={CONTENT.text.revealColor}
      />
    </>
  )
}

function Block({
  placements,
  textColor,
}: {
  placements: Placement[]
  textColor: string
}) {
  return (
    <>
      {placements.map((placement, index) =>
        placement.kind === 'icon' ? (
          <ContentIcon key={index} placement={placement} />
        ) : (
          <TextShape
            key={index}
            glyphs={[{ char: placement.text, x: 0, size: placement.size }]}
            x={placement.x}
            baseline={placement.baseline}
            fill={textColor}
            weight={CONTENT.text.weight}
          />
        ),
      )}
    </>
  )
}

function ContentIcon({
  placement,
}: {
  placement: Extract<Placement, { kind: 'icon' }>
}) {
  const icon = placement.icon as IconId
  const [image] = useImage(ICONS[icon].url)

  const numberColor = ICON_NUMBER_COLORS[icon]
  const digitHeight = placement.height * CONTENT.numberHeightRatio
  const size = fontSizeForCapHeight(digitHeight, CONTENT.numberWeight)
  const text = String(placement.amount)

  return (
    <>
      <KonvaImage
        image={image}
        x={placement.x}
        y={placement.y}
        width={placement.width}
        height={placement.height}
        listening={false}
      />

      {numberColor && (
        <TextShape
          glyphs={[{ char: text, x: 0, size }]}
          x={placement.x + placement.width / 2 - textWidth(text, size, CONTENT.numberWeight) / 2}
          baseline={placement.y + placement.height / 2 + digitHeight / 2}
          fill={numberColor}
          weight={CONTENT.numberWeight}
        />
      )}
    </>
  )
}
