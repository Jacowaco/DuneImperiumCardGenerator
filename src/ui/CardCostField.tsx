import { useEffect, useState } from 'react'

import { useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { COST } from '../render/constants'
import { fontSizeForCapHeight } from '../render/text'
import { CardNumberField, type ScreenBox } from './CardNumberField'

/** Qué número del rombo se está escribiendo. */
type Editing = 'cost' | 'benefit'

/**
 * Los dos números del rombo de costo, tocados **sobre la carta**: la cifra de
 * compra y la cantidad del beneficio, si el icono la lleva encima.
 *
 * Es el mismo camino que `CardNameField`: la cosa se toca donde se la ve. La
 * zona del costo es el rectángulo que entra dentro del rombo (`COST.hit`) y no
 * el ancho del número, así que un costo de una cifra se agarra igual de fácil
 * que uno de dos. Prender y apagar el rombo sigue siendo del panel: sin número
 * no hay qué tocar.
 */
export function CardCostField({
  card,
  scale,
  onChange,
}: {
  card: Card
  scale: number
  onChange: (patch: Partial<Card>) => void
}) {
  const t = useT()
  const library = useIconLibrary()
  const [editing, setEditing] = useState<Editing | null>(null)

  // Si el rombo se apaga desde el panel mientras se escribe, el campo se cierra
  // con él: si no, volver a prenderlo lo abriría de nuevo con lo de antes.
  useEffect(() => {
    if (card.cost === null) setEditing(null)
  }, [card.cost])

  // Sin rombo no hay número que tocar.
  if (card.cost === null) return null

  // La misma cuenta que `CostBadge`: la cinta con el icono sale sólo si el
  // icono está, y el número sólo si es de los que lo llevan encima.
  const benefit = card.purchaseBenefit ? library[card.purchaseBenefit] : undefined
  const benefitNumber = benefit?.numberColor

  const box = (x: number, y: number, width: number, height: number): ScreenBox => ({
    left: (x - width / 2) * scale,
    top: (y - height / 2) * scale,
    width: width * scale,
    height: height * scale,
  })

  const costBox = box(COST.x, COST.y, COST.hit.width, COST.hit.height)
  const benefitBox = box(COST.benefit.x, COST.benefit.y, COST.benefit.size, COST.benefit.size)

  return (
    <>
      {editing === 'cost' ? (
        <CardNumberField
          mark={costBox}
          // Más ancho que el rombo, que con dos cifras se queda corto.
          width={costBox.width * 2}
          fontSize={fontSizeForCapHeight(COST.digitHeight, COST.weight) * scale}
          weight={COST.weight}
          color={COST.color}
          label={t.cardPanel.persuasion}
          value={card.cost}
          onChange={(cost) => onChange({ cost })}
          onClose={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          title={t.cardPanel.costOnCard}
          aria-label={t.cardPanel.costOnCard}
          onClick={() => setEditing('cost')}
          style={costBox}
          className="absolute cursor-text rounded-lg transition-shadow hover:ring-2 hover:ring-sand-300"
        />
      )}

      {benefitNumber &&
        (editing === 'benefit' ? (
          <CardNumberField
            mark={benefitBox}
            width={benefitBox.width * 1.5}
            fontSize={fontSizeForCapHeight(COST.benefit.digitHeight, COST.weight) * scale}
            weight={COST.weight}
            color={benefitNumber}
            label={t.cardPanel.amount}
            value={card.purchaseBenefitAmount}
            onChange={(purchaseBenefitAmount) => onChange({ purchaseBenefitAmount })}
            onClose={() => setEditing(null)}
          />
        ) : (
          <button
            type="button"
            title={t.contentEditor.amountOnCard}
            aria-label={t.contentEditor.amountOnCard}
            onClick={() => setEditing('benefit')}
            style={benefitBox}
            className="absolute cursor-text rounded-lg transition-shadow hover:ring-2 hover:ring-sand-300"
          />
        ))}
    </>
  )
}
