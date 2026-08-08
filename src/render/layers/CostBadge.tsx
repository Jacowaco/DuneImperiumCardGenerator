import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import { ICONS, type IconId } from '../../assets/icons'
import costBenefitUrl from '../../assets/layers/card-cost-benefit.png'
import costUrl from '../../assets/layers/card-cost.png'
import type { Card } from '../../model/card'
import { COST } from '../constants'
import { fontSizeForCapHeight, textWidth } from '../text'
import { TextShape } from './TextShape'

export function CostBadge({ card }: { card: Card }) {
  const [plain] = useImage(costUrl)
  const [withBenefit] = useImage(costBenefitUrl)

  if (card.cost === null) return null

  const text = String(card.cost)
  const size = fontSizeForCapHeight(COST.digitHeight, COST.weight)
  const width = textWidth(text, size, COST.weight)

  return (
    <>
      <KonvaImage image={card.purchaseBenefit ? withBenefit : plain} listening={false} />

      {card.purchaseBenefit && <BenefitIcon icon={card.purchaseBenefit} />}

      <TextShape
        glyphs={[{ char: text, x: 0, size }]}
        x={COST.x - width / 2}
        baseline={COST.y + COST.digitHeight / 2}
        fill={COST.color}
        weight={COST.weight}
      />
    </>
  )
}

/** Encaja el icono en el hueco de la cinta sin deformarlo. */
function BenefitIcon({ icon }: { icon: IconId }) {
  const [image] = useImage(ICONS[icon].url)
  if (!image) return null

  const scale = Math.min(
    COST.benefit.size / image.width,
    COST.benefit.size / image.height,
  )
  const width = image.width * scale
  const height = image.height * scale

  return (
    <KonvaImage
      image={image}
      x={COST.benefit.x - width / 2}
      y={COST.benefit.y - height / 2}
      width={width}
      height={height}
      listening={false}
    />
  )
}
