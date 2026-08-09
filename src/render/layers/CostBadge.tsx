import { Image as KonvaImage } from 'react-konva'

import costBenefitUrl from '../../assets/layers/card-cost-benefit.png'
import costUrl from '../../assets/layers/card-cost.png'
import type { AnyIconId, Card } from '../../model/card'
import { useIconLibrary } from '../../model/iconLibrary'
import { COST } from '../constants'
import { useCardImage } from '../imageCache'
import { fontSizeForCapHeight, textWidth } from '../text'
import { TextShape } from './TextShape'

export function CostBadge({ card }: { card: Card }) {
  const plain = useCardImage(costUrl)
  const withBenefit = useCardImage(costBenefitUrl)
  const library = useIconLibrary()

  if (card.cost === null) return null

  // La cinta larga existe para alojar el icono: si el icono ya no está —era uno
  // propio y se borró del mazo— la cinta vacía se lee como un error de dibujo,
  // así que la carta vuelve al rombo solo, que es lo que muestra el panel.
  const benefit = card.purchaseBenefit && library[card.purchaseBenefit] ? card.purchaseBenefit : null

  const text = String(card.cost)
  const size = fontSizeForCapHeight(COST.digitHeight, COST.weight)
  const width = textWidth(text, size, COST.weight)

  return (
    <>
      <KonvaImage image={benefit ? withBenefit : plain} listening={false} />

      {benefit && <BenefitIcon icon={benefit} amount={card.purchaseBenefitAmount} />}

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

/**
 * Encaja el icono en el hueco de la cinta sin deformarlo, y le dibuja la
 * cantidad centrada encima si es de los que salen vacíos del PSD.
 */
function BenefitIcon({ icon, amount }: { icon: AnyIconId; amount: number }) {
  const entry = useIconLibrary()[icon]
  const image = useCardImage(entry?.url)
  if (!entry || !image) return null

  const scale = Math.min(
    COST.benefit.size / image.width,
    COST.benefit.size / image.height,
  )
  const width = image.width * scale
  const height = image.height * scale

  const numberColor = entry.numberColor
  const text = String(amount)
  const size = fontSizeForCapHeight(COST.benefit.digitHeight, COST.weight)

  return (
    <>
      <KonvaImage
        image={image}
        x={COST.benefit.x - width / 2}
        y={COST.benefit.y - height / 2}
        width={width}
        height={height}
        listening={false}
      />

      {numberColor && (
        <TextShape
          glyphs={[{ char: text, x: 0, size }]}
          x={COST.benefit.x - textWidth(text, size, COST.weight) / 2}
          baseline={COST.benefit.y + COST.benefit.digitHeight / 2}
          fill={numberColor}
          weight={COST.weight}
        />
      )}
    </>
  )
}
