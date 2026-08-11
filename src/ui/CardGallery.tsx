import { useEffect, useRef, type ReactNode } from 'react'

import { pluralCards, pluralDone, useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { useLanguage } from '../model/language'
import { CARD_WIDTH } from '../render/constants'
import { CardStage } from '../render/CardStage'
import { Button } from './controls'
import { PlusIcon } from './icons'

type Props = {
  cards: Card[]
  selected: number
  onSelect: (index: number) => void
  onAdd: () => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onToggleDone: (index: number) => void
  /** Pie de la columna: lo que es del mazo entero y no de una carta. */
  children?: ReactNode
}

const THUMBNAIL_WIDTH = 96
const SCALE = THUMBNAIL_WIDTH / CARD_WIDTH

/**
 * El mazo, en una columna a la derecha. Va al costado y no en una tira abajo
 * porque la pantalla es ancha y baja: el alto es lo que le falta al preview,
 * que es una carta parada, y el ancho es lo que sobra.
 *
 * Cada miniatura es el mismo `CardStage` que el preview grande, sólo que a
 * escala chica y sin interacción — así una carta en la galería nunca se ve
 * distinta de como se va a exportar.
 *
 * En el pie va lo que es del mazo entero (`children`): esta columna es el
 * mazo, así que es acá donde se lo busca, y no entre las pestañas de la carta.
 */
export function CardGallery({
  cards,
  selected,
  onSelect,
  onAdd,
  onDuplicate,
  onRemove,
  onToggleDone,
  children,
}: Props) {
  const t = useT()
  const { language } = useLanguage()
  const done = cards.filter((card) => card.done).length
  const selectedRef = useRef<HTMLDivElement | null>(null)

  // Con el mazo largo, la carta abierta puede quedar fuera de la vista al
  // agregar una nueva o al abrir un archivo.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-zinc-800 bg-zinc-950">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="text-[11px] font-semibold tracking-[0.18em] text-sand-500 uppercase">
            {t.gallery.title}
          </h2>
          <p className="truncate text-xs text-zinc-500">
            {pluralCards(cards.length, language)}
            {done > 0 && ` · ${pluralDone(done, language)}`}
          </p>
        </div>

        <Button onClick={onAdd} title={t.gallery.newCardTitle} className="shrink-0 px-2.5 py-1.5 text-xs">
          <PlusIcon />
          {t.gallery.newButton}
        </Button>
      </header>

      {/* `flex-1` para que el pie quede abajo de la columna y no colgando de la
          última miniatura, que se mueve con cada carta que se agrega. */}
      <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-3 overflow-y-auto p-3">
        {cards.map((card, index) => (
          <div
            key={index}
            ref={index === selected ? selectedRef : undefined}
            className="group relative"
          >
            <button
              onClick={() => onSelect(index)}
              title={card.title.trim() || t.gallery.unnamed}
              className={`block overflow-hidden rounded transition ${
                index === selected ? 'ring-2 ring-sand-500' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {/* El stage no debe recibir el clic: el botón de arriba lo maneja. */}
              <div className="pointer-events-none">
                <CardStage card={card} scale={SCALE} />
              </div>
            </button>

            {/* Sello sobre la miniatura: se ve de un vistazo recorriendo la
                galería, sin tener que leer la etiqueta de abajo. Es HTML aparte
                del Konva Stage, así que no sale en el PNG exportado. */}
            {card.done && (
              <div
                title={t.gallery.doneStamp}
                className="pointer-events-none absolute -top-1.5 -left-1.5 flex size-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-emerald-500 text-sm font-bold text-zinc-950 shadow"
              >
                ✓
              </div>
            )}

            <div className="absolute top-1 left-1 opacity-0 transition-opacity group-hover:opacity-100">
              <ThumbnailAction label={t.gallery.duplicate} onClick={() => onDuplicate(index)}>
                ⧉
              </ThumbnailAction>
            </div>

            {cards.length > 1 && (
              <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                <ThumbnailAction label={t.gallery.remove} onClick={() => onRemove(index)}>
                  ×
                </ThumbnailAction>
              </div>
            )}

            {/* El tilde va en el pie y no encima de la miniatura: ahí se lee sin
                taparle el título a la carta. La casilla está siempre a la vista,
                vacía o marcada — un control que sólo aparece al pasar el mouse no
                se descubre, y recorrer el mazo de un vistazo es todo el punto. */}
            <button
              title={card.done ? t.gallery.reopenTitle : t.gallery.markDoneTitle}
              aria-label={card.done ? t.gallery.markPendingAria : t.gallery.markDoneTitle}
              aria-pressed={card.done}
              onClick={() => onToggleDone(index)}
              className="mt-1 flex w-full items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-zinc-900"
            >
              <span
                className={`flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border text-[9px] leading-none transition-colors ${
                  card.done
                    ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                    : 'border-zinc-700 text-transparent group-hover:border-zinc-500'
                }`}
              >
                ✓
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-left text-[11px] ${
                  card.done ? 'text-emerald-500' : 'text-zinc-500'
                }`}
              >
                {card.title.trim() || t.gallery.unnamed}
              </span>
            </button>
          </div>
        ))}
      </div>

      {children && (
        <footer className="shrink-0 border-t border-zinc-800 p-3">{children}</footer>
      )}
    </aside>
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
      className="flex size-7 items-center justify-center rounded bg-zinc-900/85 text-base text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
    >
      {children}
    </button>
  )
}
