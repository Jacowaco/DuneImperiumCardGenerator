import { useEffect, useRef, useState } from 'react'

import { useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { TITLE } from '../render/constants'
import { CARD_FONT, fontSizeForCapHeight } from '../render/text'

/**
 * Escribir el nombre **sobre la carta**, además de en el panel de identidad.
 *
 * Es el mismo camino que el arrastre de contenido de `CardDropZones`: tocar la
 * cosa donde se la ve. La zona no es el ancho del texto sino el de la placa
 * —de `TITLE.x` al límite derecho, que se corre cuando hay rombo de costo—,
 * porque una carta sin nombre no tiene texto que agarrar y es justo cuando más
 * se lo quiere escribir.
 *
 * Mientras se edita, el campo **tapa** el título dibujado en vez de dejarlo
 * ver: las versalitas no se pueden imitar con un `<input>` (la inicial de cada
 * palabra es más grande y el texto se achica solo cuando no entra), así que un
 * cursor de HTML puesto encima caería en cualquier lado menos donde se está
 * escribiendo. Al salir se ve el título de verdad.
 */
export function CardNameField({
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
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Con qué nombre se entró a editar, para que Escape lo devuelva.
  const before = useRef(card.title)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  // Las mismas dos medidas que usa `CardTitle` para dibujarlo.
  const x = card.starting ? TITLE.startingX : TITLE.x
  const right = card.cost !== null ? TITLE.costRight : TITLE.right

  // Alto de la mayúscula más un margen parejo arriba y abajo. Termina en y=82,
  // justo por encima del hueco del arte (84), así que no le roba el clic.
  const padding = 8
  const box = {
    left: x * scale,
    top: (TITLE.baseline - TITLE.capHeight - padding) * scale,
    width: (right - x) * scale,
    height: (TITLE.capHeight + padding * 2) * scale,
  }

  const close = () => {
    setEditing(false)
    // El título se dibuja trimmeado igual; esto es para que no queden espacios
    // guardados en el mazo. Si no sobra nada, no se toca la carta: un patch de
    // más abriría un paso de deshacer que no cambia nada.
    const trimmed = card.title.trim()
    if (trimmed !== card.title) onChange({ title: trimmed })
  }

  if (!editing) {
    return (
      <button
        type="button"
        title={t.cardPanel.editOnCard}
        onClick={() => {
          before.current = card.title
          setEditing(true)
        }}
        style={box}
        className="absolute cursor-text rounded transition-shadow hover:ring-2 hover:ring-sand-300"
      />
    )
  }

  return (
    <input
      ref={inputRef}
      autoFocus
      value={card.title}
      placeholder={t.cardPanel.namePlaceholder}
      aria-label={t.cardPanel.name}
      onChange={(event) => onChange({ title: event.target.value })}
      onBlur={close}
      onKeyDown={(event) => {
        if (event.key === 'Enter') close()
        if (event.key === 'Escape') {
          onChange({ title: before.current })
          setEditing(false)
        }
      }}
      style={{
        ...box,
        fontFamily: CARD_FONT,
        // El tamaño de las versalitas —no el de la inicial—, que es el de casi
        // todas las letras: así lo que se escribe ocupa más o menos el lugar
        // que va a ocupar dibujado.
        fontSize: fontSizeForCapHeight(TITLE.capHeight * TITLE.smallCapRatio, TITLE.weight) * scale,
        letterSpacing: TITLE.letterSpacing * scale,
        color: TITLE.color,
      }}
      // Fondo opaco: el título dibujado sigue abajo y actualizándose, y verlo
      // asomar detrás de lo que se escribe se lee como un error de dibujo.
      className="absolute rounded bg-zinc-950 px-1.5 uppercase ring-2 ring-sand-500 outline-none placeholder:text-zinc-600"
    />
  )
}
