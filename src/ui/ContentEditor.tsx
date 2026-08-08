import { useState } from 'react'
import { ICON_IDS, ICONS, iconTakesNumber, type IconId } from '../assets/icons'
import { iconPart, textPart, type ContentPart } from '../model/card'
import { Hint } from './controls'

type Props = {
  parts: ContentPart[]
  onChange: (parts: ContentPart[]) => void
}

/**
 * Contenido de una caja: iconos y texto en la misma lista, en el orden en que
 * se dibujan. El acomodo en renglones lo hace el layout, no el usuario; acá
 * sólo se elige qué va y en qué orden.
 */
export function ContentEditor({ parts, onChange }: Props) {
  const [picking, setPicking] = useState(false)

  const update = (index: number, part: ContentPart) =>
    onChange(parts.map((item, i) => (i === index ? part : item)))

  const remove = (index: number) => onChange(parts.filter((_, i) => i !== index))

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= parts.length) return
    const next = [...parts]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      {parts.length === 0 && <Hint>Caja vacía.</Hint>}

      {parts.map((part, index) => (
        <div key={index} className="flex items-center gap-2 rounded-md bg-zinc-900 p-1.5">
          {part.type === 'icon' && (
            <>
              <img src={ICONS[part.icon].url} alt="" className="size-7 shrink-0 object-contain" />
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">
                {ICONS[part.icon].label}
              </span>
              {iconTakesNumber(part.icon) && (
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
              placeholder="Texto…"
              onChange={(event) => update(index, { type: 'text', text: event.target.value })}
              className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
            />
          )}

          {part.type === 'break' && (
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
              — corte de renglón —
            </span>
          )}

          <Action label="Mover antes" onClick={() => move(index, -1)}>
            ←
          </Action>
          <Action label="Mover después" onClick={() => move(index, 1)}>
            →
          </Action>
          <Action label="Quitar" onClick={() => remove(index)}>
            ×
          </Action>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2">
        <Add onClick={() => setPicking(!picking)}>{picking ? 'Cerrar' : 'Icono…'}</Add>
        <Add onClick={() => onChange([...parts, textPart()])}>Texto</Add>
        <Add onClick={() => onChange([...parts, { type: 'break' }])}>Renglón</Add>
      </div>

      {picking && (
        <div className="grid grid-cols-6 gap-1 rounded-md bg-zinc-900 p-2">
          {ICON_IDS.map((icon) => (
            <button
              key={icon}
              title={ICONS[icon].label}
              onClick={() => onChange([...parts, iconPart(icon as IconId)])}
              className="flex aspect-square items-center justify-center rounded p-1 transition-colors hover:bg-zinc-700"
            >
              <img
                src={ICONS[icon].url}
                alt={ICONS[icon].label}
                className="max-h-full max-w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Add({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md bg-zinc-800 px-2 py-2 text-xs text-zinc-200 transition-colors hover:bg-zinc-700"
    >
      {children}
    </button>
  )
}

function Action({
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
      className="size-6 shrink-0 rounded text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
    >
      {children}
    </button>
  )
}
