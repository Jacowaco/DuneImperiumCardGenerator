import { useState } from 'react'
import { EditIcon } from './icons'

type Props = {
  /** El nombre a mostrar, o null si nunca se le puso uno. */
  name: string | null
  /** Qué decir cuando no hay nombre. Se ve atenuado y en itálica. */
  placeholder: string
  /** Tooltip del botón: el archivo abierto, o qué hace el clic. */
  title: string
  /** Punto ámbar de «sin guardar». Sólo lo usa el mazo. */
  dirty?: boolean
  onRename: (name: string) => void
}

/**
 * El nombre editable del pie de la columna del mazo. Lo comparten **el mazo y
 * la biblioteca**, que son los dos renglones de esa columna: están a cuatro
 * filas de distancia, así que cualquier diferencia entre uno y otro se lee
 * como que hacen cosas distintas.
 *
 * El nombre lleva fondo y borde propios aunque no se esté editando: es un
 * campo, y sin nada atrás no se lee como algo que se pueda tocar. La caja es
 * la misma que la del input —mismo padding, mismo borde—, así que al entrar a
 * editar no se mueve nada.
 */
export function NameField({ name, placeholder, title, dirty, onRename }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(name ?? '')
    setEditing(true)
  }

  const commit = () => {
    onRename(draft.trim())
    setEditing(false)
  }

  if (editing)
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.target.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') setEditing(false)
        }}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded border border-sand-500 bg-zinc-900 px-1.5 py-1 text-sm text-zinc-100 outline-none"
      />
    )

  return (
    <button
      type="button"
      onClick={startEdit}
      title={title}
      className={`group flex min-w-0 flex-1 items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-sm transition-colors hover:border-zinc-700 hover:bg-zinc-800 ${
        name ? 'text-zinc-100' : 'text-zinc-500 italic'
      }`}
    >
      {dirty && <span className="size-1.5 shrink-0 rounded-full bg-amber-400" />}
      <span className="truncate">{name ?? placeholder}</span>
      <span className="ml-auto shrink-0 text-zinc-500">
        <EditIcon />
      </span>
    </button>
  )
}
