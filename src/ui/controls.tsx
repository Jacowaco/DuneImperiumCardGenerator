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

/** Grupo de botones excluyentes. `null` es una opción válida ("ninguno"). */
export function Choice<T extends string>({
  value,
  options,
  columns = 2,
  onChange,
}: {
  value: T | null
  options: { value: T | null; label: string }[]
  columns?: number
  onChange: (value: T | null) => void
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((option) => (
        <button
          key={option.value ?? '__none__'}
          onClick={() => onChange(option.value)}
          className={`truncate rounded-md px-2.5 py-2 text-xs transition-colors ${
            value === option.value
              ? 'bg-zinc-100 font-medium text-zinc-900'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
