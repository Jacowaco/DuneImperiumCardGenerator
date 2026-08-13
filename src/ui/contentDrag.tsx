import { createContext, useContext, useState, type ReactNode } from 'react'

import { iconPart, textPart, type AnyIconId, type Card, type ContentPart } from '../model/card'

/** Las dos cajas de contenido de la carta. */
export type ContentBox = 'play' | 'reveal'

/**
 * De dónde viene lo que se está arrastrando: una fila que ya está en una de
 * las cajas (se mueve, y puede terminar en la otra) o algo nuevo — un icono de
 * la grilla, o los botones de texto/renglón — que se inserta donde se suelte.
 */
export type DragSource =
  | { kind: 'reorder'; box: ContentBox; index: number }
  | { kind: 'icon'; icon: AnyIconId }
  | { kind: 'text' }
  | { kind: 'break' }

/** Dónde va a caer lo que se está arrastrando, mientras se arrastra. */
export type DropTarget = { box: ContentBox; index: number; before: boolean }

export function newPartFor(source: DragSource): ContentPart | null {
  if (source.kind === 'icon') return iconPart(source.icon)
  if (source.kind === 'text') return textPart()
  if (source.kind === 'break') return { type: 'break' }
  return null
}

const patchBox = (box: ContentBox, parts: ContentPart[]): Partial<Card> =>
  box === 'play' ? { playContent: parts } : { revealContent: parts }

const insert = (parts: ContentPart[], at: number, part: ContentPart) => [
  ...parts.slice(0, at),
  part,
  ...parts.slice(at),
]

type ContentDrag = {
  /** La caja a la que van las piezas que se agregan desde la paleta. */
  target: ContentBox
  setTarget: (box: ContentBox) => void
  dragSource: DragSource | null
  setDragSource: (source: DragSource | null) => void
  dropTarget: DropTarget | null
  setDropTarget: (target: DropTarget | null) => void
  parts: (box: ContentBox) => ContentPart[]
  update: (box: ContentBox, parts: ContentPart[]) => void
  /** Agregar al final de la caja elegida, que es lo que hace la paleta. */
  add: (part: ContentPart) => void
  /** Soltar en `box`, en la posición `at`. */
  drop: (box: ContentBox, at: number) => void
}

const ContentDragContext = createContext<ContentDrag | null>(null)

/**
 * El arrastre de contenido, compartido por todos los que participan de él.
 *
 * Va por contexto y no por props porque los que lo necesitan no están cerca:
 * la paleta y las dos cajas están en el panel de la izquierda, y las zonas de
 * soltar están **encima de la carta**, del otro lado de la pantalla. Además
 * mover una pieza de una caja a la otra es un cambio de dos listas a la vez,
 * y ninguna de las dos puede resolverlo sola.
 */
export function ContentDragProvider({
  card,
  onChange,
  children,
}: {
  card: Card
  onChange: (patch: Partial<Card>) => void
  children: ReactNode
}) {
  const [target, setTarget] = useState<ContentBox>('play')
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const content: Record<ContentBox, ContentPart[]> = {
    play: card.playContent,
    reveal: card.revealContent,
  }

  const drop = (box: ContentBox, at: number) => {
    if (dragSource === null) return

    if (dragSource.kind === 'reorder' && dragSource.box === box) {
      const moved = content[box][dragSource.index]
      const rest = content[box].filter((_, i) => i !== dragSource.index)
      // Sacar la pieza corre un lugar todo lo que venía después.
      onChange(patchBox(box, insert(rest, dragSource.index < at ? at - 1 : at, moved)))
    } else if (dragSource.kind === 'reorder') {
      const from = dragSource.box
      const moved = content[from][dragSource.index]
      onChange({
        ...patchBox(from, content[from].filter((_, i) => i !== dragSource.index)),
        ...patchBox(box, insert(content[box], at, moved)),
      })
    } else {
      const part = newPartFor(dragSource)
      if (part) onChange(patchBox(box, insert(content[box], at, part)))
    }

    // Lo que se soltó en una caja deja a esa caja como destino: es la que se
    // está llenando.
    setTarget(box)
    setDragSource(null)
    setDropTarget(null)
  }

  return (
    <ContentDragContext.Provider
      value={{
        target,
        setTarget,
        dragSource,
        setDragSource,
        dropTarget,
        setDropTarget,
        parts: (box) => content[box],
        update: (box, parts) => onChange(patchBox(box, parts)),
        add: (part) => onChange(patchBox(target, [...content[target], part])),
        drop,
      }}
    >
      {children}
    </ContentDragContext.Provider>
  )
}

export function useContentDrag(): ContentDrag {
  const value = useContext(ContentDragContext)
  if (!value) throw new Error('Falta <ContentDragProvider> arriba')
  return value
}
