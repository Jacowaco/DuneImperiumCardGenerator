import { useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { CONTENT } from '../render/constants'
import { autoPlayRows } from '../render/contentLayout'
import { useContentDrag, type ContentBox } from './contentDrag'

/**
 * Soltar contenido **sobre la carta**, en la caja donde se lo quiere ver.
 *
 * Es el mismo arrastre que el de las listas del panel, con otro destino: acá
 * no hay orden que elegir —la pieza va al final de esa caja— porque lo que se
 * está diciendo es *en cuál de las dos*, que es justamente lo que en el panel
 * hay que ir a buscar a otra sección.
 *
 * Las zonas son las áreas donde el layout acomoda el contenido, no los PNG de
 * las cajas: así el rectángulo que se ilumina es exactamente el lugar donde la
 * pieza va a aparecer. La de revelación arranca donde termina la de play
 * porque la caja de play la tapa —crece hacia abajo sobre ella—, así que el
 * alto de las dos depende de cuántas filas tenga el turno de agente.
 */
export function CardDropZones({ card, scale }: { card: Card; scale: number }) {
  const t = useT()
  const library = useIconLibrary()
  const { dragSource, drop, parts } = useContentDrag()

  if (dragSource === null) return null

  const rows = card.playRowsAuto ? autoPlayRows(card.playContent, library) : card.playRows
  const playBottom = CONTENT.play.bottoms[rows]

  const zones: { box: ContentBox; label: string; top: number; bottom: number }[] = [
    { box: 'play', label: t.rulesPanel.playTurn, top: CONTENT.play.top, bottom: playBottom },
    { box: 'reveal', label: t.rulesPanel.reveal, top: playBottom, bottom: CONTENT.reveal.bottom },
  ]

  return (
    <div className="absolute inset-0">
      {zones.map((zone) => (
        <Zone
          key={zone.box}
          label={zone.label}
          scale={scale}
          top={zone.top}
          bottom={zone.bottom}
          onDrop={() => drop(zone.box, parts(zone.box).length)}
        />
      ))}
    </div>
  )
}

function Zone({
  label,
  scale,
  top,
  bottom,
  onDrop,
}: {
  label: string
  scale: number
  top: number
  bottom: number
  onDrop: () => void
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDrop={(event) => {
        // Sin frenarlo, el mismo drop llega al preview, que es la zona para
        // soltar la imagen del jugador.
        event.preventDefault()
        event.stopPropagation()
        onDrop()
      }}
      style={{
        left: CONTENT.left * scale,
        width: (CONTENT.right - CONTENT.left) * scale,
        top: top * scale,
        height: (bottom - top) * scale,
      }}
      className="absolute flex items-center justify-center rounded border-2 border-dashed border-sand-400/70 bg-zinc-950/40 text-xs font-semibold text-sand-100 transition-colors hover:border-sand-300 hover:bg-sand-500/30"
    >
      {label}
    </div>
  )
}
