import { useState, type ReactNode } from 'react'

import { useT } from '../i18n/strings'
import { iconPart, textPart, type AnyIconId } from '../model/card'
import { groupIconIds, useIconLibrary, type IconLibrary } from '../model/iconLibrary'
import { useContentDrag, type ContentBox } from './contentDrag'
import { Choice } from './controls'
import { BreakIcon, DiamondIcon, TextIcon } from './icons'

/**
 * Un color por tipo de pieza, el mismo en la fila y en el botón que la agrega.
 * En una lista larga y mezclada, el color se lee antes que el contenido.
 */
export const PART_STYLES = {
  icon: {
    row: 'border-sand-500 bg-sand-500/10',
    button: 'bg-sand-500/15 text-sand-100 hover:bg-sand-500/25',
  },
  text: {
    row: 'border-sky-500 bg-sky-500/10',
    button: 'bg-sky-500/15 text-sky-100 hover:bg-sky-500/25',
  },
  break: {
    row: 'border-zinc-500 bg-zinc-500/10',
    button: 'bg-zinc-500/15 text-zinc-200 hover:bg-zinc-500/25',
  },
} as const

/**
 * Todo lo que se puede meter en una caja de contenido, **una sola vez para
 * las dos**.
 *
 * Antes cada caja tenía su propia paleta abajo, y eso costaba dos veces: la
 * grilla del juego entero se repetía en pantalla, y arrastrar de una a la otra
 * no andaba —el estado del arrastre era de cada editor, así que la caja de al
 * lado ni se enteraba de que había algo viajando—. Con una sola paleta, el
 * destino pasa a ser una elección explícita (el selector de acá arriba, que
 * también se mueve al tocar una caja) y arrastrar funciona hacia cualquiera de
 * las dos.
 *
 * Va pegada al pie del panel (`sticky`) porque es de las dos cajas: con la
 * lista del turno larga, una paleta al final de la columna quedaría a un
 * scroll de distancia justo cuando más se la usa.
 */
export function ContentPalette() {
  const t = useT()
  const { target, setTarget, add, setDragSource } = useContentDrag()
  const [picking, setPicking] = useState(false)
  const library = useIconLibrary()
  const { custom, core, ix, immortality, influence } = groupIconIds(library)

  const groups: { label: string; ids: AnyIconId[] }[] = [
    { label: t.contentEditor.custom, ids: custom },
    { label: t.contentEditor.core, ids: core },
    { label: 'Rise of Ix', ids: ix },
    { label: 'Immortality', ids: immortality },
    { label: t.contentEditor.influence, ids: influence },
  ]

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-zinc-800 bg-zinc-950 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[11px] font-semibold tracking-[0.18em] text-sand-500 uppercase">
          {t.contentEditor.addTo}
        </span>
        <div className="min-w-0 flex-1">
          <Choice<ContentBox>
            value={target}
            columns={2}
            onChange={(box) => box && setTarget(box)}
            options={[
              { value: 'play', label: t.rulesPanel.playTurn },
              { value: 'reveal', label: t.rulesPanel.reveal },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Add type="icon" icon={<DiamondIcon />} onClick={() => setPicking(!picking)}>
          {picking ? t.contentEditor.close : t.contentEditor.addIcon}
        </Add>
        <Add
          type="text"
          icon={<TextIcon />}
          onClick={() => add(textPart())}
          onDragStart={() => setDragSource({ kind: 'text' })}
          onDragEnd={() => setDragSource(null)}
        >
          {t.contentEditor.addText}
        </Add>
        <Add
          type="break"
          icon={<BreakIcon />}
          onClick={() => add({ type: 'break' })}
          onDragStart={() => setDragSource({ kind: 'break' })}
          onDragEnd={() => setDragSource(null)}
        >
          {t.contentEditor.addLineBreak}
        </Add>
      </div>

      {picking && (
        // La grilla se topa a media pantalla y scrollea adentro: pegada al pie
        // como está, el catálogo entero taparía las cajas que se están
        // llenando. Los propios van primero — se agregaron a propósito para
        // este mazo, así que pesan más que revisar todo el catálogo del juego
        // para encontrarlos — y las expansiones aparte, para no tener que
        // mirar tooltip por tooltip cuando el mazo no las usa.
        <div className="flex max-h-[38vh] flex-col gap-2 overflow-y-auto rounded-md bg-zinc-900 p-2">
          {groups
            .filter((group) => group.ids.length > 0)
            .map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                  {group.label}
                </p>
                <Grid
                  ids={group.ids}
                  library={library}
                  onPick={(icon) => add(iconPart(icon))}
                  onDragStart={(icon) => setDragSource({ kind: 'icon', icon })}
                  onDragEnd={() => setDragSource(null)}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

/**
 * Grilla de iconos para elegir uno: se reusa tal cual en `CardPanel` para el
 * beneficio de compra, que no necesita arrastrar — ahí `onDragStart`/
 * `onDragEnd` quedan sin pasar.
 */
export function Grid({
  ids,
  library,
  onPick,
  onDragStart,
  onDragEnd,
}: {
  ids: AnyIconId[]
  library: IconLibrary
  onPick: (icon: AnyIconId) => void
  onDragStart?: (icon: AnyIconId) => void
  onDragEnd?: () => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {ids.map((icon) => (
        <button
          key={icon}
          title={library[icon].label}
          onClick={() => onPick(icon)}
          draggable={onDragStart !== undefined}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'copy'
            onDragStart?.(icon)
          }}
          onDragEnd={onDragEnd}
          className={`flex aspect-square items-center justify-center rounded p-1 transition-colors hover:bg-zinc-700 ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <img
            src={library[icon].url}
            alt={library[icon].label}
            draggable={false}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      ))}
    </div>
  )
}

function Add({
  type,
  icon,
  onClick,
  onDragStart,
  onDragEnd,
  children,
}: {
  type: keyof typeof PART_STYLES
  icon: ReactNode
  onClick: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  children: string
}) {
  return (
    <button
      onClick={onClick}
      draggable={onDragStart !== undefined}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'copy'
        onDragStart?.()
      }}
      onDragEnd={onDragEnd}
      className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${PART_STYLES[type].button} ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {icon}
      {children}
    </button>
  )
}
