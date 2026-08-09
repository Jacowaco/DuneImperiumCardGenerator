import { useState, type ReactNode } from 'react'
import { IMMORTALITY_ICON_IDS, INFLUENCE_ICON_IDS, IX_ICON_IDS } from '../assets/icons'
import { useT } from '../i18n/strings'
import { iconPart, textPart, type AnyIconId, type ContentPart } from '../model/card'
import { useIconLibrary, type IconLibrary } from '../model/iconLibrary'
import { Action, Hint } from './controls'
import { BreakIcon, DiamondIcon, GripIcon, TextIcon } from './icons'

type Props = {
  parts: ContentPart[]
  onChange: (parts: ContentPart[]) => void
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
  const [dragIndex, setDragIndex] = useState<number | null>(null)
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

  return (
    <div className="flex flex-col gap-2">
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
            setDragIndex(index)
            event.dataTransfer.effectAllowed = 'move'
          }}
          onDragEnd={() => {
            setDragIndex(null)
            setDropTarget(null)
          }}
          onDragOver={(event) => {
            if (dragIndex === null || dragIndex === index) return
            event.preventDefault()
            const rect = event.currentTarget.getBoundingClientRect()
            setDropTarget({ index, before: event.clientY < rect.top + rect.height / 2 })
          }}
          onDrop={(event) => {
            event.preventDefault()
            if (dragIndex === null) return
            const rect = event.currentTarget.getBoundingClientRect()
            reorder(dragIndex, { index, before: event.clientY < rect.top + rect.height / 2 })
            setDragIndex(null)
            setDropTarget(null)
          }}
          className={`relative flex cursor-grab items-center gap-2 rounded-md border-l-4 p-1.5 transition-opacity active:cursor-grabbing ${
            STYLES[part.type].row
          } ${dragIndex === index ? 'opacity-40' : ''}`}
        >
          {dropTarget?.index === index && dragIndex !== null && dragIndex !== index && (
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
                  className="w-12 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
                />
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

      <div className="grid grid-cols-3 gap-2">
        <Add type="icon" icon={<DiamondIcon />} onClick={() => setPicking(!picking)}>
          {picking ? t.contentEditor.close : t.contentEditor.addIcon}
        </Add>
        <Add type="text" icon={<TextIcon />} onClick={() => onChange([...parts, textPart()])}>
          {t.contentEditor.addText}
        </Add>
        <Add type="break" icon={<BreakIcon />} onClick={() => onChange([...parts, { type: 'break' }])}>
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
              />
            </>
          )}

          <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
            {t.contentEditor.core}
          </p>
          <Grid ids={core} library={library} onPick={(icon) => onChange([...parts, iconPart(icon)])} />

          {/* Las expansiones van aparte para no tener que revisar tooltip por
              tooltip cuando el mazo no las usa. */}
          {ix.length > 0 && (
            <>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">Rise of Ix</p>
              <Grid ids={ix} library={library} onPick={(icon) => onChange([...parts, iconPart(icon)])} />
            </>
          )}

          {immortality.length > 0 && (
            <>
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">Immortality</p>
              <Grid
                ids={immortality}
                library={library}
                onPick={(icon) => onChange([...parts, iconPart(icon)])}
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
}: {
  ids: AnyIconId[]
  library: IconLibrary
  onPick: (icon: AnyIconId) => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {ids.map((icon) => (
        <button
          key={icon}
          title={library[icon].label}
          onClick={() => onPick(icon)}
          className="flex aspect-square items-center justify-center rounded p-1 transition-colors hover:bg-zinc-700"
        >
          <img
            src={library[icon].url}
            alt={library[icon].label}
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
  children,
}: {
  type: keyof typeof STYLES
  icon: ReactNode
  onClick: () => void
  children: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${STYLES[type].button}`}
    >
      {icon}
      {children}
    </button>
  )
}

