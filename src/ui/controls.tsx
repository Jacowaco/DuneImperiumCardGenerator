import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-zinc-800 px-5 py-5">
      <h2 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-sand-500 uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'ghost', className = '', ...props }: ButtonProps) {
  const styles =
    variant === 'primary'
      ? 'bg-sand-500 text-zinc-950 hover:bg-sand-300'
      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'

  return (
    <button
      {...props}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    />
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-zinc-500">{children}</p>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

const inputStyles =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sand-500'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputStyles} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputStyles} />
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-sand-500"
      />
      {label}
    </label>
  )
}

/**
 * Igual que Choice pero se pueden elegir varias a la vez. Una opción con
 * `icon` (url de imagen) lo muestra antes del texto.
 *
 * Con `iconsOnly` el nombre pasa al tooltip y el botón queda del tamaño del
 * símbolo: es el símbolo el que identifica la opción, no el texto.
 */
export function MultiChoice<T extends string>({
  values,
  options,
  columns = 2,
  iconsOnly = false,
  onChange,
}: {
  values: T[]
  options: { value: T; label: string; icon?: string }[]
  columns?: number
  iconsOnly?: boolean
  onChange: (values: T[]) => void
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((option) => {
        const selected = values.includes(option.value)

        return (
          <button
            key={option.value}
            onClick={() =>
              onChange(
                selected
                  ? values.filter((value) => value !== option.value)
                  : [...values, option.value],
              )
            }
            title={iconsOnly ? option.label : undefined}
            aria-label={iconsOnly ? option.label : undefined}
            className={`flex items-center rounded-md text-xs transition-colors ${
              iconsOnly ? 'justify-center px-1 py-1.5' : 'gap-2 px-2.5 py-2'
            } ${
              selected
                ? 'bg-sand-500 font-medium text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {option.icon && (
              <img
                src={option.icon}
                alt=""
                // Ancho fijo con object-contain: los emblemas tienen alturas
                // distintas, y si no cada uno ocuparía un ancho diferente.
                className={`shrink-0 object-contain transition-opacity ${
                  iconsOnly ? 'h-7 w-9' : 'h-5 w-7'
                } ${selected ? '' : 'opacity-80'}`}
              />
            )}
            {!iconsOnly && <span className="truncate">{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Grupo de botones excluyentes. `null` es una opción válida ("ninguno").
 * Una opción con `color` va pintada de ese color siempre: apagada mientras
 * no está elegida (la opacidad la mezcla con el fondo oscuro del panel) y a
 * pleno, con anillo, cuando lo está.
 */
export function Choice<T extends string>({
  value,
  options,
  columns = 2,
  onChange,
}: {
  value: T | null
  options: { value: T | null; label: string; color?: string }[]
  columns?: number
  onChange: (value: T | null) => void
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value ?? '__none__'}
            onClick={() => onChange(option.value)}
            style={option.color ? { backgroundColor: option.color } : undefined}
            className={`truncate rounded-md px-2.5 py-2 text-xs transition ${
              option.color
                ? selected
                  ? 'ring-sand-300 font-medium text-white ring-2'
                  : 'text-white/80 opacity-55 hover:opacity-80'
                : selected
                  ? 'bg-sand-500 font-medium text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
