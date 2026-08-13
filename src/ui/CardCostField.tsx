import { useEffect, useRef, useState } from 'react'

import { useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { COST } from '../render/constants'
import { CARD_FONT, fontSizeForCapHeight } from '../render/text'

/** El mismo tope que el campo del panel: el rombo tiene lugar para dos cifras. */
const MAX_COST = 99

/**
 * Cambiar el costo de compra **sobre la carta**, tocando el número del rombo.
 *
 * Es el mismo camino que `CardNameField`: la cosa se toca donde se la ve. La
 * zona es el rectángulo que entra dentro del rombo (`COST.hit`), no el ancho
 * del número, así que un costo de una cifra se agarra igual de fácil que uno
 * de dos.
 *
 * A diferencia del título, acá el campo **no tapa** lo dibujado: un número no
 * tiene versalitas ni se achica solo, así que el `<input>` puede usar la misma
 * fuente y el mismo tamaño que `CostBadge` y caer justo encima. Por eso va con
 * el texto transparente y sólo se ve el cursor: el número que se lee sigue
 * siendo el de la carta, redibujado tecla por tecla, y no hay dos números
 * pintados uno sobre el otro.
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
  const [editing, setEditing] = useState(false)
  // Lo tecleado, que puede estar vacío un momento mientras se corrige. La carta
  // no puede quedar sin número, así que vacío se dibuja como 0.
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Con qué costo se entró a editar, para que Escape lo devuelva.
  const before = useRef(card.cost)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  // Si el rombo se apaga desde el panel mientras se escribe, el campo se cierra
  // con él: si no, volver a prenderlo lo abriría de nuevo con lo de antes.
  useEffect(() => {
    if (card.cost === null) setEditing(false)
  }, [card.cost])

  // Sin rombo no hay número que tocar. El interruptor de "tiene costo" está en
  // el panel: acá sólo se cambia el valor de lo que ya se ve.
  if (card.cost === null) return null

  const open = () => {
    before.current = card.cost
    setDraft(String(card.cost))
    setEditing(true)
  }

  const box = (width: number, height: number) => ({
    left: (COST.x - width / 2) * scale,
    top: (COST.y - height / 2) * scale,
    width: width * scale,
    height: height * scale,
  })

  if (!editing) {
    return (
      <button
        type="button"
        title={t.cardPanel.costOnCard}
        aria-label={t.cardPanel.costOnCard}
        onClick={open}
        style={box(COST.hit.width, COST.hit.height)}
        className="absolute cursor-text rounded-lg transition-shadow hover:ring-2 hover:ring-sand-300"
      />
    )
  }

  const commit = (text: string) => {
    setDraft(text)
    onChange({ cost: text === '' ? 0 : Number(text) })
  }

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(MAX_COST, (card.cost ?? 0) + delta))
    commit(String(next))
  }

  return (
    <>
      {/* La marca de que se está escribiendo va acá y no en el `<input>`: el
          campo es más ancho que el rombo para que quepan dos cifras, así que
          un recuadro suyo asomaría sobre el arte. */}
      <div
        style={box(COST.hit.width, COST.hit.height)}
        className="pointer-events-none absolute rounded-lg ring-2 ring-sand-500"
      />

      <input
        ref={inputRef}
        autoFocus
        inputMode="numeric"
        value={draft}
        aria-label={t.cardPanel.persuasion}
        onChange={(event) => commit(event.target.value.replace(/\D/g, '').slice(0, 2))}
        onBlur={() => setEditing(false)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') setEditing(false)
          if (event.key === 'Escape') {
            onChange({ cost: before.current })
            setEditing(false)
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            step(1)
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            step(-1)
          }
        }}
        style={{
          // Más ancho que la zona de tocar: con dos cifras el texto no entra en
          // el rectángulo del rombo, y un input que scrollea deja el cursor
          // lejos del número. Como el campo es transparente, no se ve.
          ...box(COST.hit.width * 2, COST.hit.height),
          fontFamily: CARD_FONT,
          fontWeight: COST.weight,
          fontSize: fontSizeForCapHeight(COST.digitHeight, COST.weight) * scale,
          caretColor: COST.color,
        }}
        // Texto transparente: el número de verdad es el que dibuja la carta,
        // justo abajo y en la misma posición. La selección va traslúcida para
        // que se siga leyendo el número mientras está resaltado.
        className="absolute bg-transparent text-center leading-none text-transparent outline-none selection:bg-sand-500/40"
      />
    </>
  )
}
