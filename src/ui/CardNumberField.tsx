import { useEffect, useRef, useState } from 'react'

import { CARD_FONT } from '../render/text'

/** Una caja en píxeles de pantalla, ya multiplicada por la escala del preview. */
export type ScreenBox = { left: number; top: number; width: number; height: number }

/** El mismo tope que los campos del panel. */
const MAX = 99

/**
 * Cambiar un número **sobre la carta**: el costo del rombo y la cantidad de los
 * iconos que la llevan encima.
 *
 * A diferencia del campo del nombre y de los de texto, éste **no tapa** lo
 * dibujado: un número no lleva versalitas ni se achica solo, así que el
 * `<input>` puede usar la misma fuente y el mismo tamaño con que la carta lo
 * dibuja y caer justo encima. Va con el texto transparente y sólo se ve el
 * cursor, así que el número que se lee sigue siendo el de la carta, redibujado
 * tecla por tecla, y no hay dos números pintados uno sobre el otro. La
 * selección va traslúcida por lo mismo.
 *
 * `mark` es lo que se recuadra —el rombo, el icono— y el campo se centra ahí
 * encima. `width` va aparte porque el campo suele necesitar más lugar que lo
 * recuadrado: con dos cifras el texto no entra, y un input que scrollea deja el
 * cursor lejos del número. Como es transparente, ese ancho de más no se ve.
 *
 * Se monta recién al empezar a editar: toma el valor de entrada al montarse
 * —para que Escape lo devuelva— y se selecciona solo, así una cifra nueva pisa
 * a la que había.
 */
export function CardNumberField({
  mark,
  width,
  fontSize,
  weight,
  color,
  label,
  value,
  onChange,
  onClose,
}: {
  mark: ScreenBox
  width: number
  fontSize: number
  weight: number
  /** El del número dibujado: es el color del cursor. */
  color: string
  label: string
  value: number
  onChange: (value: number) => void
  onClose: () => void
}) {
  // Lo tecleado, que puede quedar vacío un momento mientras se corrige. La
  // carta no puede quedar sin número, así que vacío se dibuja como 0.
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement | null>(null)
  const before = useRef(value)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  const commit = (text: string) => {
    setDraft(text)
    onChange(text === '' ? 0 : Number(text))
  }

  const step = (delta: number) => commit(String(Math.max(0, Math.min(MAX, value + delta))))

  return (
    <>
      {/* La marca de que se está escribiendo va aparte del `<input>`: el campo
          es más ancho que lo que se edita, así que un recuadro suyo asomaría
          sobre el arte. */}
      <div
        style={mark}
        className="pointer-events-none absolute rounded-lg ring-2 ring-sand-500"
      />

      <input
        ref={inputRef}
        autoFocus
        inputMode="numeric"
        value={draft}
        aria-label={label}
        onChange={(event) => commit(event.target.value.replace(/\D/g, '').slice(0, 2))}
        onBlur={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onClose()
          if (event.key === 'Escape') {
            onChange(before.current)
            onClose()
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
          left: mark.left + mark.width / 2 - width / 2,
          top: mark.top,
          width,
          height: mark.height,
          fontFamily: CARD_FONT,
          fontWeight: weight,
          fontSize,
          caretColor: color,
        }}
        className="pointer-events-auto absolute bg-transparent text-center leading-none text-transparent outline-none selection:bg-sand-500/40"
      />
    </>
  )
}
