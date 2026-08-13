import { useEffect, useRef, useState, type ReactNode } from 'react'

import { pluralCards, pluralDone, useT } from '../i18n/strings'
import type { Card } from '../model/card'
import { useLanguage } from '../model/language'
import { CARD_WIDTH } from '../render/constants'
import { CardStage } from '../render/CardStage'
import { Button } from './controls'
import { CheckIcon, CloseIcon, CopyIcon, PlusIcon } from './icons'

type Props = {
  cards: Card[]
  selected: number
  onSelect: (index: number) => void
  onAdd: () => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onToggleDone: (index: number) => void
  /** Mover una carta a otro lugar del mazo: `to` es el hueco donde cae. */
  onMove: (from: number, to: number) => void
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
 *
 * El orden de esta lista **es** el del mazo: el de la hoja de impresión y el
 * de los PNG del zip. Por eso las cartas se arrastran para reordenarlas — sin
 * eso, cambiar el orden salía sólo borrando y rehaciendo.
 */
export function CardGallery({
  cards,
  selected,
  onSelect,
  onAdd,
  onDuplicate,
  onRemove,
  onToggleDone,
  onMove,
  children,
}: Props) {
  const t = useT()
  const { language } = useLanguage()
  const done = cards.filter((card) => card.done).length
  const selectedRef = useRef<HTMLDivElement | null>(null)

  // Qué carta se está arrastrando y en qué hueco caería. El hueco es un índice
  // *entre* cartas —de 0 a cards.length—, no la carta de al lado: así el borde
  // derecho de la última y el izquierdo de la primera son destinos posibles.
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const endDrag = () => {
    setDragIndex(null)
    setDropIndex(null)
  }

  // Con el mazo largo, la carta abierta puede quedar fuera de la vista al
  // agregar una nueva o al abrir un archivo.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-zinc-800 bg-zinc-950">
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
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              // El navegador necesita algo en el `dataTransfer` para arrancar
              // el arrastre en Firefox; el índice de verdad va por estado, que
              // es lo único que un drop de afuera no puede falsificar.
              event.dataTransfer.setData('text/plain', String(index))
              setDragIndex(index)
            }}
            onDragEnd={endDrag}
            onDragOver={(event) => {
              // Sólo lo nuestro: un icono de la paleta o un archivo soltado acá
              // no tienen por qué reordenar el mazo.
              if (dragIndex === null) return
              event.preventDefault()
              const rect = event.currentTarget.getBoundingClientRect()
              setDropIndex(event.clientX < rect.left + rect.width / 2 ? index : index + 1)
            }}
            onDrop={(event) => {
              if (dragIndex === null) return
              event.preventDefault()
              const rect = event.currentTarget.getBoundingClientRect()
              const to = event.clientX < rect.left + rect.width / 2 ? index : index + 1
              onMove(dragIndex, to)
              endDrag()
            }}
            className={`group relative transition-opacity ${
              dragIndex === index ? 'opacity-40' : ''
            }`}
          >
            {/* La línea del hueco donde va a caer. Va pegada al costado de la
                miniatura y no entre las filas de la grilla, porque el orden se
                lee de izquierda a derecha y renglón por renglón. */}
            {dragIndex !== null && (dropIndex === index || dropIndex === index + 1) && (
              <div
                className={`absolute -top-1 bottom-0 w-0.5 rounded-full bg-sand-300 ${
                  dropIndex === index ? '-left-1.5' : '-right-1.5'
                }`}
              />
            )}

            <button
              onClick={() => onSelect(index)}
              title={card.title.trim() || t.gallery.unnamed}
              className={`relative block overflow-hidden rounded transition ${
                index === selected ? 'ring-2 ring-sand-500' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {/* El stage no debe recibir el clic: el botón de arriba lo maneja. */}
              <div className="pointer-events-none">
                <CardStage card={card} scale={SCALE} />
              </div>

              {/* Cuántos ejemplares lleva el mazo. Sólo cuando es más de uno:
                  «×1» en todas las cartas sería ruido en la única vista donde
                  se recorre el mazo entero de un vistazo. */}
              {card.copies > 1 && (
                <span
                  title={t.gallery.copiesStamp(card.copies)}
                  className="absolute right-1 bottom-1 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-semibold text-sand-100 tabular-nums"
                >
                  ×{card.copies}
                </span>
              )}
            </button>

            {/* Sello sobre la miniatura: se ve de un vistazo recorriendo la
                galería, sin tener que leer la etiqueta de abajo. Es HTML aparte
                del Konva Stage, así que no sale en el PNG exportado. */}
            {card.done && (
              <div
                title={t.gallery.doneStamp}
                className="pointer-events-none absolute -top-1.5 -left-1.5 flex size-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-emerald-500 text-zinc-950 shadow [&_svg]:size-3.5 [&_svg]:stroke-[2.4]"
              >
                <CheckIcon />
              </div>
            )}

            {/* `focus-within` además de `group-hover`: sin eso el botón seguía
                siendo enfocable con Tab estando en `opacity: 0`, o sea que el
                teclado caía en un control invisible. */}
            <div className="absolute top-1 left-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <ThumbnailAction label={t.gallery.duplicate} onClick={() => onDuplicate(index)}>
                <CopyIcon />
              </ThumbnailAction>
            </div>

            {cards.length > 1 && (
              <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <ThumbnailAction label={t.gallery.remove} onClick={() => onRemove(index)}>
                  <CloseIcon />
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
                className={`flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors [&_svg]:size-2.5 [&_svg]:stroke-[2.6] ${
                  card.done
                    ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                    : 'border-zinc-700 text-transparent group-hover:border-zinc-500'
                }`}
              >
                <CheckIcon />
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
  children: ReactNode
}) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded bg-zinc-900/85 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
    >
      {children}
    </button>
  )
}
