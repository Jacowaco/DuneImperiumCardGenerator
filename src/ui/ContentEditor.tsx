import { useState, type ReactNode } from 'react'
import { IMMORTALITY_ICON_IDS, INFLUENCE_ICON_IDS, IX_ICON_IDS } from '../assets/icons'
import { useT } from '../i18n/strings'
import { iconPart, textPart, type AnyIconId, type ContentPart } from '../model/card'
import { useIconLibrary, type IconLibrary } from '../model/iconLibrary'
import { Action, Hint } from './controls'
import { BreakIcon, DiamondIcon, GripIcon, MinusIcon, PlusIcon, TextIcon } from './icons'

type Props = {
  parts: ContentPart[]
  onChange: (parts: ContentPart[]) => void
}

/**
 * De dónde viene lo que se está arrastrando: una fila que ya está en la
 * lista (se reordena) o algo nuevo — un icono de la grilla, o los botones de
 * texto/renglón — que se inserta donde se suelte.
 */
type DragSource =
  | { kind: 'reorder'; index: number }
  | { kind: 'icon'; icon: AnyIconId }
  | { kind: 'text' }
  | { kind: 'break' }

function newPartFor(source: DragSource): ContentPart | null {
  if (source.kind === 'icon') return iconPart(source.icon)
  if (source.kind === 'text') return textPart()
  if (source.kind === 'break') return { type: 'break' }
  return null
}

/**
 * Un color por tipo de pieza, el mismo en la fila y en el botón que la agrega.
 * En una lista larga y mezclada, el color se lee antes que el contenido.
 */
const STYLES = {
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
 * Contenido de una caja: iconos y texto en la misma lista, en el orden en que
 * se dibujan. El acomodo en renglones lo hace el layout, no el usuario; acá
 * sólo se elige qué va y en qué orden.
 */
export function ContentEditor({ parts, onChange }: Props) {
  const t = useT()
  const [picking, setPicking] = useState(false)
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [dropTarget, setDropTarget] = useState<{ index: number; before: boolean } | null>(null)
  const library = useIconLibrary()

  const ids = Object.keys(library) as AnyIconId[]
  const custom = ids.filter((id) => library[id].custom)
  const builtin = ids.filter((id) => !library[id].custom)
  const ix = builtin.filter((id) => (IX_ICON_IDS as readonly AnyIconId[]).includes(id))
  const immortality = builtin.filter((id) =>
    (IMMORTALITY_ICON_IDS as readonly AnyIconId[]).includes(id),
  )
  const influence = builtin.filter((id) =>
    (INFLUENCE_ICON_IDS as readonly AnyIconId[]).includes(id),
  )
  const core = builtin.filter(
    (id) => !ix.includes(id) && !immortality.includes(id) && !influence.includes(id),
  )

  const update = (index: number, part: ContentPart) =>
    onChange(parts.map((item, i) => (i === index ? part : item)))

  const remove = (index: number) => onChange(parts.filter((_, i) => i !== index))

  // `to.before` es de qué lado del renglón sobre el que se soltó va a caer la
  // pieza — así el punto de inserción es siempre el hueco que se está
  // marcando, y no "arriba" o "abajo" según de qué lado se venía arrastrando.
  const reorder = (from: number, to: { index: number; before: boolean }) => {
    if (from === to.index) return
    const next = [...parts]
    const [moved] = next.splice(from, 1)
    let insertAt = to.index
    if (from < to.index) insertAt--
    if (!to.before) insertAt++
    onChange([...next.slice(0, insertAt), moved, ...next.slice(insertAt)])
  }

  const insertPart = (part: ContentPart, to: { index: number; before: boolean }) => {
    const at = to.before ? to.index : to.index + 1
    onChange([...parts.slice(0, at), part, ...parts.slice(at)])
  }

  // Soltar sobre una fila puede venir de otra fila (reordenar) o de algo
  // nuevo — icono, texto o renglón — que hay que insertar en ese punto.
  const dropOnRow = (to: { index: number; before: boolean }) => {
    if (dragSource === null) return
    if (dragSource.kind === 'reorder') {
      reorder(dragSource.index, to)
    } else {
      const part = newPartFor(dragSource)
      if (part) insertPart(part, to)
    }
    setDragSource(null)
    setDropTarget(null)
  }

  // Al final de la lista no hay una fila sobre la que calcular antes/después,
  // así que mover o insertar ahí es directo: siempre va al final.
  const dropAtEnd = () => {
    if (dragSource === null) return
    if (dragSource.kind === 'reorder') {
      const next = [...parts]
      const [moved] = next.splice(dragSource.index, 1)
      onChange([...next, moved])
    } else {
      const part = newPartFor(dragSource)
      if (part) onChange([...parts, part])
    }
    setDragSource(null)
    setDropTarget(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* El contenedor es el respaldo de las filas: recibe el drop cuando no
          cae sobre ninguna en particular — la caja vacía, o el hueco después
          de la última —, así que siempre hay dónde soltar, no sólo entre dos
          filas. Cada fila frena la propagación para no disparar los dos a
          la vez. */}
      <div
        onDragOver={(event) => {
          if (dragSource === null) return
          event.preventDefault()
          setDropTarget({ index: parts.length, before: true })
        }}
        onDrop={(event) => {
          if (dragSource === null) return
          event.preventDefault()
          dropAtEnd()
        }}
        className={`flex flex-col gap-2 rounded-md transition-colors ${
          dragSource !== null ? 'outline-dashed outline-1 outline-offset-2 outline-zinc-600' : ''
        } ${dropTarget?.index === parts.length ? 'outline-sand-400' : ''} ${
          parts.length === 0 ? 'bg-zinc-900/60 p-3' : ''
        }`}
      >
        {parts.length === 0 && <Hint>{t.contentEditor.empty}</Hint>}

        {parts.map((part, index) => (
          <div
            key={index}
            draggable
            onDragStart={(event) => {
              // Un mousedown que arranca en un input o un botón (el número de
              // cantidad, el texto, la cruz) es al usuario tocando ese control,
              // no queriendo mover la fila.
              if ((event.target as HTMLElement).closest('input, button')) {
                event.preventDefault()
                return
              }
              setDragSource({ kind: 'reorder', index })
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => {
              setDragSource(null)
              setDropTarget(null)
            }}
            onDragOver={(event) => {
              if (dragSource === null) return
              if (dragSource.kind === 'reorder' && dragSource.index === index) return
              event.preventDefault()
              event.stopPropagation()
              const rect = event.currentTarget.getBoundingClientRect()
              setDropTarget({ index, before: event.clientY < rect.top + rect.height / 2 })
            }}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              const rect = event.currentTarget.getBoundingClientRect()
              dropOnRow({ index, before: event.clientY < rect.top + rect.height / 2 })
            }}
            className={`relative flex cursor-grab items-center gap-2 rounded-md border-l-4 p-1.5 transition-opacity active:cursor-grabbing ${
              STYLES[part.type].row
            } ${dragSource?.kind === 'reorder' && dragSource.index === index ? 'opacity-40' : ''}`}
          >
            {dropTarget?.index === index &&
              dragSource !== null &&
              !(dragSource.kind === 'reorder' && dragSource.index === index) && (
                <div
                  className={`absolute inset-x-0 h-0.5 rounded-full bg-sand-300 ${
                    dropTarget.before ? '-top-1' : '-bottom-1'
                  }`}
                />
              )}

            <span className="shrink-0 text-zinc-500">
              <GripIcon />
            </span>

            {part.type === 'icon' && (
              <>
                {/* Un icono propio borrado del mazo deja la pieza sin nada que
                    dibujar. Se dice acá, que es donde se puede arreglar. */}
                <img
                  src={library[part.icon]?.url}
                  alt=""
                  className="size-7 shrink-0 object-contain"
                />
                <span
                  className={`min-w-0 flex-1 truncate text-xs ${
                    library[part.icon] ? 'text-zinc-300' : 'text-red-400'
                  }`}
                >
                  {library[part.icon]?.label ?? t.contentEditor.deletedIcon}
                </span>
                {library[part.icon]?.numberColor && (
                  <div className="flex shrink-0 items-center overflow-hidden rounded border border-zinc-700 bg-zinc-950">
                    <button
                      type="button"
                      title={t.contentEditor.decrease(library[part.icon]?.label ?? '')}
                      aria-label={t.contentEditor.decrease(library[part.icon]?.label ?? '')}
                      disabled={part.amount <= 0}
                      onClick={() =>
                        update(index, { ...part, amount: Math.max(0, part.amount - 1) })
                      }
                      className="flex size-6 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <MinusIcon />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={part.amount}
                      onChange={(event) =>
                        update(index, {
                          ...part,
                          amount: Math.max(0, Math.min(99, Number(event.target.value))),
                        })
                      }
                      className="w-7 shrink-0 bg-transparent text-center text-xs text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      title={t.contentEditor.increase(library[part.icon]?.label ?? '')}
                      aria-label={t.contentEditor.increase(library[part.icon]?.label ?? '')}
                      disabled={part.amount >= 99}
                      onClick={() =>
                        update(index, { ...part, amount: Math.min(99, part.amount + 1) })
                      }
                      className="flex size-6 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                )}
              </>
            )}

            {part.type === 'text' && (
              <input
                value={part.text}
                placeholder={t.contentEditor.textPlaceholder}
                onChange={(event) => update(index, { type: 'text', text: event.target.value })}
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
              />
            )}

            {part.type === 'break' && (
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
                {t.contentEditor.lineBreak}
              </span>
            )}

            <Action label={t.contentEditor.remove} onClick={() => remove(index)}>
              ×
            </Action>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Add type="icon" icon={<DiamondIcon />} onClick={() => setPicking(!picking)}>
          {picking ? t.contentEditor.close : t.contentEditor.addIcon}
        </Add>
        <Add
          type="text"
          icon={<TextIcon />}
          onClick={() => onChange([...parts, textPart()])}
          onDragStart={() => setDragSource({ kind: 'text' })}
          onDragEnd={() => setDragSource(null)}
        >
          {t.contentEditor.addText}
        </Add>
        <Add
          type="break"
          icon={<BreakIcon />}
          onClick={() => onChange([...parts, { type: 'break' }])}
          onDragStart={() => setDragSource({ kind: 'break' })}
          onDragEnd={() => setDragSource(null)}
        >
          {t.contentEditor.addLineBreak}
        </Add>
      </div>

      {picking && (
        <div className="flex flex-col gap-2 rounded-md bg-zinc-900 p-2">
          {/* Los propios van primero: son los que se agregaron a propósito
              para este mazo, así que pesan más que revisar todo el catálogo
              del juego para encontrarlos. */}
          {custom.length > 0 && (
            <>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                {t.contentEditor.custom}
              </p>
              <Grid
                ids={custom}
                library={library}
                onPick={(icon) => onChange([...parts, iconPart(icon)])}
                onDragStart={(icon) => setDragSource({ kind: 'icon', icon })}
                onDragEnd={() => setDragSource(null)}
              />
            </>
          )}

          <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
            {t.contentEditor.core}
          </p>
          <Grid
            ids={core}
            library={library}
            onPick={(icon) => onChange([...parts, iconPart(icon)])}
            onDragStart={(icon) => setDragSource({ kind: 'icon', icon })}
            onDragEnd={() => setDragSource(null)}
          />

          {/* Las expansiones van aparte para no tener que revisar tooltip por
              tooltip cuando el mazo no las usa. */}
          {ix.length > 0 && (
            <>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">Rise of Ix</p>
              <Grid
                ids={ix}
                library={library}
                onPick={(icon) => onChange([...parts, iconPart(icon)])}
                onDragStart={(icon) => setDragSource({ kind: 'icon', icon })}
                onDragEnd={() => setDragSource(null)}
              />
            </>
          )}

          {immortality.length > 0 && (
            <>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">Immortality</p>
              <Grid
                ids={immortality}
                library={library}
                onPick={(icon) => onChange([...parts, iconPart(icon)])}
                onDragStart={(icon) => setDragSource({ kind: 'icon', icon })}
                onDragEnd={() => setDragSource(null)}
              />
            </>
          )}

          {influence.length > 0 && (
            <>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                {t.contentEditor.influence}
              </p>
              <Grid
                ids={influence}
                library={library}
                onPick={(icon) => onChange([...parts, iconPart(icon)])}
                onDragStart={(icon) => setDragSource({ kind: 'icon', icon })}
                onDragEnd={() => setDragSource(null)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Grid({
  ids,
  library,
  onPick,
  onDragStart,
  onDragEnd,
}: {
  ids: AnyIconId[]
  library: IconLibrary
  onPick: (icon: AnyIconId) => void
  onDragStart: (icon: AnyIconId) => void
  onDragEnd: () => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {ids.map((icon) => (
        <button
          key={icon}
          title={library[icon].label}
          onClick={() => onPick(icon)}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'copy'
            onDragStart(icon)
          }}
          onDragEnd={onDragEnd}
          className="flex aspect-square cursor-grab items-center justify-center rounded p-1 transition-colors hover:bg-zinc-700 active:cursor-grabbing"
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
  type: keyof typeof STYLES
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
      className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${STYLES[type].button} ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {icon}
      {children}
    </button>
  )
}

