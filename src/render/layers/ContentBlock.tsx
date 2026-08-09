import { Image as KonvaImage } from 'react-konva'

import type { Card } from '../../model/card'
import { useIconLibrary, type IconEntry } from '../../model/iconLibrary'
import { CONTENT } from '../constants'
import { effectivePlayRows, layoutContent, playBox, revealBox, type Placement } from '../contentLayout'
import { useCardImage } from '../imageCache'
import { fontSizeForCapHeight, textWidth } from '../text'
import { TextShape } from './TextShape'

/** El contenido de las dos cajas: iconos y texto mezclados. */
export function ContentBlock({ card }: { card: Card }) {
  const library = useIconLibrary()
  const rows = effectivePlayRows(card, library)

  return (
    <>
      <Block
        library={library}
        placements={layoutContent(card.playContent, playBox(rows), library)}
        textColor={CONTENT.text.playColor}
      />
      <Block
        library={library}
        placements={layoutContent(card.revealContent, revealBox(rows), library)}
        textColor={CONTENT.text.revealColor}
      />
    </>
  )
}

function Block({
  library,
  placements,
  textColor,
}: {
  library: ReturnType<typeof useIconLibrary>
  placements: Placement[]
  textColor: string
}) {
  return (
    <>
      {placements.map((placement, index) =>
        placement.kind === 'icon' ? (
          <ContentIcon key={index} placement={placement} entry={library[placement.icon]} />
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
  entry,
}: {
  placement: Extract<Placement, { kind: 'icon' }>
  entry: IconEntry
}) {
  const image = useCardImage(entry.url)

  const numberColor = entry.numberColor
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
