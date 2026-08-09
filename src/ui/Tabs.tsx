import type { ReactNode } from 'react'

/**
 * Grupo de pestañas del panel lateral. Mismo lenguaje visual que `Choice` —es
 * lo mismo, un grupo excluyente— para que la app no tenga dos estilos de
 * botón seleccionado.
 */
export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; icon: ReactNode }[]
  onChange: (value: T) => void
}) {
  return (
    <div role="tablist" className="flex shrink-0 gap-1 border-b border-zinc-800 p-2">
      {options.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition ${
              selected
                ? 'bg-sand-500 font-medium text-zinc-950'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {option.icon}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
