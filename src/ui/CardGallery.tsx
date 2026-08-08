import type { Card } from '../model/card'
import { CARD_WIDTH } from '../render/constants'
import { CardStage } from '../render/CardStage'

type Props = {
  cards: Card[]
  selected: number
  onSelect: (index: number) => void
  onAdd: () => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
}

const THUMBNAIL_WIDTH = 96
const SCALE = THUMBNAIL_WIDTH / CARD_WIDTH

/**
 * Tira de miniaturas del mazo. Cada una es el mismo `CardStage` que el
 * preview grande, sólo que a escala chica y sin interacción — así una carta
 * en la galería nunca se ve distinta de como se va a exportar.
 */
export function CardGallery({
  cards,
  selected,
  onSelect,
  onAdd,
  onDuplicate,
  onRemove,
}: Props) {
  return (
    <div className="flex shrink-0 gap-3 overflow-x-auto border-t border-zinc-800 bg-zinc-950 p-3">
      {cards.map((card, index) => (
        <div key={index} className="group relative shrink-0">
          <button
            onClick={() => onSelect(index)}
            title={card.title.trim() || 'Sin nombre'}
            className={`block overflow-hidden rounded transition ${
              index === selected
                ? 'ring-2 ring-sand-500'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            {/* El stage no debe recibir el clic: el botón de arriba lo maneja. */}
            <div className="pointer-events-none">
              <CardStage card={card} scale={SCALE} />
            </div>
          </button>

          <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <ThumbnailAction label="Duplicar" onClick={() => onDuplicate(index)}>
              ⧉
            </ThumbnailAction>
            {cards.length > 1 && (
              <ThumbnailAction label="Eliminar" onClick={() => onRemove(index)}>
                ×
              </ThumbnailAction>
            )}
          </div>

          <p className="mt-1 w-24 truncate text-center text-[11px] text-zinc-500">
            {card.title.trim() || 'Sin nombre'}
          </p>
        </div>
      ))}

      <button
        onClick={onAdd}
        title="Carta nueva"
        style={{ width: THUMBNAIL_WIDTH }}
        className="flex shrink-0 items-center justify-center self-start rounded border border-dashed border-zinc-700 text-2xl text-zinc-600 transition-colors hover:border-sand-500 hover:text-sand-500"
        // El alto lo fija el aspecto de la carta, para que quede a la par.
      >
        <span style={{ aspectRatio: '750 / 1039' }} className="flex w-full items-center justify-center">
          +
        </span>
      </button>
    </div>
  )
}

function ThumbnailAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: string
}) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className="size-5 rounded bg-zinc-900/85 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
    >
      {children}
    </button>
  )
}
