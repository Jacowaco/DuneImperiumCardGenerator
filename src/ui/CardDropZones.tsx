import { useMemo, useState } from 'react'

import { useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { CONTENT } from '../render/constants'
import {
  effectivePlayRows,
  layoutContent,
  playBox,
  revealBox,
  type Box,
  type Placement,
} from '../render/contentLayout'
import { useContentDrag, type ContentBox } from './contentDrag'

/**
 * Manipular el contenido **sobre la carta**: agarrar una pieza donde se la ve
 * y soltarla en el lugar donde se la quiere.
 *
 * Es el mismo arrastre que el de las listas del panel, con otro destino. Lo
 * que lo hace posible es que `layoutContent` diga de qué pieza salió cada cosa
 * que dibujó (`from`/`to`): con eso, un icono de la carta se puede arrastrar
 * como si fuera su fila del panel, y el punto donde cae el puntero se traduce
 * a una posición de la lista.
 *
 * El cursor cae entre piezas, no entre palabras: una pieza de texto es una
 * sola cosa aunque se dibuje en varias palabras, así que soltando en el medio
 * de una frase la pieza entra antes o después de esa frase, según de qué lado
 * quedó el puntero.
 */
export function CardDropZones({ card, scale }: { card: Card; scale: number }) {
  const t = useT()
  const library = useIconLibrary()
  const { dragSource, setDragSource, drop, parts } = useContentDrag()
  const [caret, setCaret] = useState<Caret | null>(null)

  // Acomodar el contenido cuesta medir texto contra un canvas, y acá se
  // redibuja en cada `dragover` —o sea, muchas veces por segundo mientras se
  // arrastra— aunque el contenido no cambió.
  const rows = effectivePlayRows(card, library)
  // La misma palabra de relleno que dibuja `CardStage` mientras la carta se
  // puede editar. Las dos cuentas tienen que dar igual: si acá faltara, los
  // tiradores y el cursor de inserción quedarían corridos de lo que se ve.
  const placeholder = card.done ? undefined : t.contentEditor.emptyText
  const boxes: { box: ContentBox; label: string; area: Box; placements: Placement[] }[] = useMemo(
    () => [
      {
        box: 'play',
        label: t.rulesPanel.playTurn,
        area: playBox(rows),
        placements: layoutContent(card.playContent, playBox(rows), library, placeholder),
      },
      {
        box: 'reveal',
        label: t.rulesPanel.reveal,
        area: revealBox(rows),
        placements: layoutContent(card.revealContent, revealBox(rows), library, placeholder),
      },
    ],
    [card.playContent, card.revealContent, rows, library, placeholder, t],
  )

  const dragging = dragSource !== null

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Los tiradores van primero y las zonas después, para que mientras se
          arrastra sea la zona la que reciba el puntero — lo que se pisa gana
          por orden de documento. Quitarles el puntero a los tiradores sería lo
          mismo, pero tocarle nada al elemento que se está arrastrando es lo
          que deja el arrastre andando. */}
      {!card.done &&
        boxes.map(({ box, placements }) =>
          placements
            // Un renglón puede juntar palabras de varias piezas seguidas en
            // una sola corrida; ahí no hay una pieza que agarrar, así que sólo
            // se puede tirar de las que se dibujaron solas.
            .filter((placement) => placement.kind === 'icon' || placement.from === placement.to)
            .map((placement) => (
              <div
                key={`${box}-${placement.from}-${placement.x}`}
                draggable
                title={
                  placement.kind === 'icon' ? library[placement.icon]?.label : placement.text
                }
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move'
                  // Un tick después y no acá mismo: si el estado cambia
                  // adentro del propio `dragstart`, React redibuja el overlay
                  // mientras el navegador todavía está armando el arrastre y
                  // el arrastre se cancela solo — `dragend` llega antes que el
                  // primer `dragover`. Desde una lista del panel no se nota,
                  // porque lo que se redibuja está lejos del que se arrastra.
                  setTimeout(() => setDragSource({ kind: 'reorder', box, index: placement.from }), 0)
                }}
                onDragEnd={() => {
                  setDragSource(null)
                  setCaret(null)
                }}
                // El texto no tiene alto propio: se toma el del renglón, que
                // es lo que se ve como una línea de palabras.
                style={{
                  left: placement.x * scale,
                  top: (placement.kind === 'icon' ? placement.y : placement.lineTop) * scale,
                  width: placement.width * scale,
                  height:
                    (placement.kind === 'icon' ? placement.height : placement.lineHeight) * scale,
                }}
                className="pointer-events-auto absolute cursor-grab rounded transition-shadow hover:ring-2 hover:ring-sand-300 active:cursor-grabbing"
              />
            )),
        )}

      {boxes.map(({ box, label, area, placements }) => (
        <div key={box}>
          {/* La zona sólo existe mientras se arrastra: el resto del tiempo, el
              preview es de la imagen del jugador. */}
          {dragging && (
            <div
              onDragOver={(event) => {
                event.preventDefault()
                event.stopPropagation()
                const rect = event.currentTarget.getBoundingClientRect()
                setCaret(
                  insertionAt(placements, area, {
                    x: (event.clientX - rect.left) / scale + CONTENT.left,
                    y: (event.clientY - rect.top) / scale + area.top,
                  }),
                )
              }}
              onDrop={(event) => {
                // Sin frenarlo, el mismo drop llega al preview, que es la zona
                // para soltar la imagen del jugador.
                event.preventDefault()
                event.stopPropagation()
                // El final de la caja se cuenta en piezas y no en lo que se
                // dibujó: un corte de renglón o un icono borrado ocupan lugar
                // en la lista sin dibujar nada.
                drop(box, caret?.index ?? parts(box).length)
                setCaret(null)
              }}
              style={boxStyle(area, scale)}
              className="pointer-events-auto absolute rounded border-2 border-dashed border-sand-400/70 bg-zinc-950/30 transition-colors hover:border-sand-300 hover:bg-sand-500/20"
            >
              <span className="absolute top-0.5 left-1.5 text-[10px] font-semibold tracking-wide text-sand-100/80">
                {label}
              </span>
            </div>
          )}
        </div>
      ))}

      {dragging && caret && (
        <div
          style={{
            left: caret.x * scale - 1,
            top: caret.top * scale,
            height: caret.height * scale,
          }}
          className="absolute w-0.5 rounded-full bg-sand-300 shadow shadow-black/50"
        />
      )}
    </div>
  )
}

type Caret = { index: number; x: number; top: number; height: number }

const boxStyle = (area: Box, scale: number) => ({
  left: CONTENT.left * scale,
  width: (CONTENT.right - CONTENT.left) * scale,
  top: area.top * scale,
  height: (area.bottom - area.top) * scale,
})

/**
 * Dónde entra la pieza que se está soltando, en coordenadas de carta.
 *
 * Primero el renglón —el que contiene al puntero, o el más cercano— y después
 * el borde de pieza más cercano en horizontal. Los renglones se reconocen por
 * `lineTop`, que el layout deja igual para todo lo que cayó en el mismo.
 */
function insertionAt(placements: Placement[], area: Box, pointer: { x: number; y: number }): Caret {
  const middle = (area.top + area.bottom) / 2

  if (!placements.length) {
    return {
      index: 0,
      x: (CONTENT.left + CONTENT.right) / 2,
      top: middle - CONTENT.text.lineHeight / 2,
      height: CONTENT.text.lineHeight,
    }
  }

  const tops = [...new Set(placements.map((placement) => placement.lineTop))]
  const lines = tops.map((top) => {
    const items = placements
      .filter((placement) => placement.lineTop === top)
      .sort((a, b) => a.x - b.x)
    return { top, height: items[0].lineHeight, items }
  })

  const line =
    lines.find((item) => pointer.y >= item.top && pointer.y < item.top + item.height) ??
    lines.reduce((closest, item) =>
      Math.abs(pointer.y - (item.top + item.height / 2)) <
      Math.abs(pointer.y - (closest.top + closest.height / 2))
        ? item
        : closest,
    )

  // Cada pieza ofrece dos bordes: antes (su propio índice) y después (el que
  // le sigue). Entre dos piezas contiguas los dos bordes caen casi en el mismo
  // lugar y da igual cuál gane — el índice resultante es el mismo hueco.
  const edges = line.items.flatMap((placement) => [
    { x: placement.x, index: placement.from },
    { x: placement.x + placement.width, index: placement.to + 1 },
  ])

  const edge = edges.reduce((closest, item) =>
    Math.abs(pointer.x - item.x) < Math.abs(pointer.x - closest.x) ? item : closest,
  )

  return { index: edge.index, x: edge.x, top: line.top, height: line.height }
}
