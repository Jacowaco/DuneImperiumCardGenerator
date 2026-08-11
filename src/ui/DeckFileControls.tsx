import { useRef, useState } from 'react'
import { useT } from '../i18n/strings'
import { supportsFileSystem } from '../model/files'
import { deckName as fileDeckName } from '../model/storage'
import { Button } from './controls'
import { EditIcon, FolderIcon, SaveIcon } from './icons'

type Props = {
  /** Nombre que eligió el usuario, o null si nunca lo tocó. */
  name: string | null
  /** Nombre del archivo abierto, o null si el mazo todavía no se guardó. */
  fileName: string | null
  dirty: boolean
  onRename: (name: string) => void
  onSave: () => void
  onSaveAs: () => void
  onOpen: () => void
  onOpenFile: (file: File) => void
}

/**
 * El nombre del mazo y sus tres acciones de archivo, al pie de la columna del
 * mazo y no en la barra de arriba: son del mazo, así que es ahí donde se los
 * busca, aunque se usen seguido.
 */
export function DeckFileControls({
  name,
  fileName,
  dirty,
  onRename,
  onSave,
  onSaveAs,
  onOpen,
  onOpenFile,
}: Props) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const native = supportsFileSystem()

  // El nombre editable manda; si nunca se tocó, cae al del archivo abierto —
  // así un mazo guardado antes de este cambio sigue mostrando algo con
  // sentido en vez de "Mazo sin guardar".
  const displayName = name ?? (fileName ? fileDeckName(fileName) : null)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(displayName ?? '')
    setEditing(true)
  }

  const commit = () => {
    onRename(draft.trim())
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* El punto ámbar dice que hay cambios sin guardar; el archivo completo,
          con extensión, va en el tooltip. */}
      {editing ? (
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
          placeholder={t.deckFooter.unsavedName}
          className="w-full rounded border border-sand-500 bg-zinc-900 px-1.5 py-1 text-sm text-zinc-100 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          title={fileName ?? t.deckFooter.renameTitle}
          className={`group flex min-w-0 items-center gap-1.5 rounded px-1 py-1 text-sm hover:bg-zinc-900 ${
            displayName ? 'text-zinc-100' : 'text-zinc-500 italic'
          }`}
        >
          {dirty && <span className="size-1.5 shrink-0 rounded-full bg-amber-400" />}
          <span className="truncate">{displayName ?? t.deckFooter.unsavedName}</span>
          <EditIcon />
        </button>
      )}

      {!native && (
        <span
          title={t.deckFooter.noNativeFsTooltip}
          className="truncate rounded bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500"
        >
          {t.deckFooter.noNativeFsBadge}
        </span>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button onClick={() => (native ? onOpen() : inputRef.current?.click())} className="px-2 text-xs">
          <FolderIcon />
          {t.deckFooter.open}
        </Button>
        <Button onClick={onSave} disabled={!dirty && fileName !== null} className="px-2 text-xs">
          <SaveIcon />
          {t.deckFooter.save}
        </Button>
        <Button onClick={onSaveAs} className="px-2 text-xs">
          <SaveIcon />
          {t.deckFooter.saveAs}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onOpenFile(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}
