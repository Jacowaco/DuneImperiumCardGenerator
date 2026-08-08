import { useState } from 'react'
import { ICON_IDS, ICONS, iconTakesNumber, type IconId } from '../assets/icons'
import type { ContentEntry } from '../model/card'
import { Hint } from './controls'

type Props = {
  entries: ContentEntry[]
  onChange: (entries: ContentEntry[]) => void
}

/**
 * Fila de iconos de una caja de contenido. Los elegidos se muestran en orden
 * y se pueden mover o sacar; abajo está la paleta con todos los disponibles.
 */
export function IconRowEditor({ entries, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const update = (index: number, patch: Partial<ContentEntry>) =>
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))

  const remove = (index: number) => onChange(entries.filter((_, i) => i !== index))

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= entries.length) return
    const next = [...entries]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.length === 0 && <Hint>Sin iconos.</Hint>}

      {entries.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 rounded-md bg-zinc-900 p-1.5">
          <img src={ICONS[entry.icon].url} alt="" className="size-7 shrink-0 object-contain" />
          <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">
            {ICONS[entry.icon].label}
          </span>

          {iconTakesNumber(entry.icon) && (
            <input
              type="number"
              min={0}
              max={99}
              value={entry.amount}
              onChange={(event) =>
                update(index, {
                  amount: Math.max(0, Math.min(99, Number(event.target.value))),
                })
              }
              className="w-12 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
            />
          )}

          <IconButton label="Mover a la izquierda" onClick={() => move(index, -1)}>
            ←
          </IconButton>
          <IconButton label="Mover a la derecha" onClick={() => move(index, 1)}>
            →
          </IconButton>
          <IconButton label="Quitar" onClick={() => remove(index)}>
            ×
          </IconButton>
        </div>
      ))}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700"
      >
        {open ? 'Cerrar' : 'Agregar icono…'}
      </button>

      {open && (
        <div className="grid grid-cols-6 gap-1 rounded-md bg-zinc-900 p-2">
          {ICON_IDS.map((icon) => (
            <button
              key={icon}
              title={ICONS[icon].label}
              onClick={() => onChange([...entries, { icon: icon as IconId, amount: 1 }])}
              className="flex aspect-square items-center justify-center rounded p-1 transition-colors hover:bg-zinc-700"
            >
              <img src={ICONS[icon].url} alt={ICONS[icon].label} className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function IconButton({
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
