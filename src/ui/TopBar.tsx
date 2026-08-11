import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/strings'
import { LANGUAGE_IDS, LANGUAGE_NAMES, type Language } from '../model/language'
import { supportsFileSystem } from '../model/files'
import { deckName as fileDeckName } from '../model/storage'
import { Button } from './controls'
import { ChevronDownIcon, DownloadIcon, EditIcon, FolderIcon, GlobeIcon, SaveIcon } from './icons'

type Props = {
  /** Nombre que eligió el usuario, o null si nunca lo tocó. */
  name: string | null
  /** Nombre del archivo abierto, o null si el mazo todavía no se guardó. */
  fileName: string | null
  dirty: boolean
  exporting: boolean
  language: Language
  onLanguageChange: (language: Language) => void
  onRename: (name: string) => void
  onSave: () => void
  onSaveAs: () => void
  onOpen: () => void
  onOpenFile: (file: File) => void
  onExport: () => void
}

/**
 * Barra de arriba: qué mazo está abierto y las acciones que no son de una
 * carta en particular.
 *
 * Van acá y no en el panel lateral porque son las de siempre —guardar, abrir,
 * exportar— y antes quedaban al final de una columna larguísima: para guardar
 * había que scrollear pasando todos los campos de la carta.
 */
export function TopBar({
  name,
  fileName,
  dirty,
  exporting,
  language,
  onLanguageChange,
  onRename,
  onSave,
  onSaveAs,
  onOpen,
  onOpenFile,
  onExport,
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
    <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-2.5">
      <div className="flex shrink-0 items-baseline gap-2">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-5 self-center rounded-sm" />
        <h1 className="text-sm font-semibold tracking-wide text-sand-100">{t.topBar.title}</h1>
        <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
          {t.topBar.subtitle}
        </span>
        <span className="text-[10px] text-zinc-600">v{__APP_VERSION__}</span>
      </div>

      <div className="h-5 w-px shrink-0 bg-zinc-800" />

      <LanguageMenu language={language} onChange={onLanguageChange} />

      <div className="h-5 w-px shrink-0 bg-zinc-800" />

      {/* El nombre identifica el mazo, y es propio: se edita acá y no
          necesita coincidir con el nombre del archivo. El punto ámbar dice
          que hay cambios sin guardar; el archivo completo, con extensión, va
          en el tooltip. */}
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
          placeholder={t.topBar.unsavedName}
          className="min-w-0 max-w-48 rounded border border-sand-500 bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-100 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          title={fileName ?? t.topBar.renameTitle}
          className={`group flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 text-sm hover:bg-zinc-900 ${
            displayName ? 'text-zinc-100' : 'text-zinc-500 italic'
          }`}
        >
          {dirty && <span className="size-1.5 shrink-0 rounded-full bg-amber-400" />}
          <span className="truncate">{displayName ?? t.topBar.unsavedName}</span>
          <EditIcon />
        </button>
      )}

      {!native && (
        <span
          title={t.topBar.noNativeFsTooltip}
          className="shrink-0 truncate rounded bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500"
        >
          {t.topBar.noNativeFsBadge}
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button onClick={() => (native ? onOpen() : inputRef.current?.click())}>
          <FolderIcon />
          {t.topBar.open}
        </Button>
        <Button onClick={onSave} disabled={!dirty && fileName !== null}>
          <SaveIcon />
          {t.topBar.save}
        </Button>
        <Button onClick={onSaveAs}>
          <SaveIcon />
          {t.topBar.saveAs}
        </Button>

        <div className="mx-1 h-5 w-px bg-zinc-800" />

        <Button variant="primary" onClick={onExport} disabled={exporting}>
          <DownloadIcon />
          {exporting ? t.topBar.exporting : t.topBar.export}
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
    </header>
  )
}

/**
 * Es una preferencia del navegador, no del mazo (`src/model/language.ts`), así
 * que va en la barra de arriba junto al resto de lo que no es de una carta en
 * particular.
 *
 * Es un menú desplegable y no un grupo de botones —el diseño anterior— porque
 * la lista de idiomas va a crecer: dos entran cómodos en un grupo, pero cinco
 * o seis no.
 */
function LanguageMenu({
  language,
  onChange,
}: {
  language: Language
  onChange: (language: Language) => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={t.topBar.language}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-zinc-100"
      >
        <GlobeIcon />
        {LANGUAGE_NAMES[language]}
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t.topBar.language}
          className="absolute top-full left-0 z-10 mt-1 min-w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 py-1 shadow-2xl shadow-black/60"
        >
          {LANGUAGE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={language === id}
              onClick={() => {
                onChange(id)
                setOpen(false)
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs whitespace-nowrap transition-colors ${
                language === id
                  ? 'bg-sand-500 font-medium text-zinc-950'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {LANGUAGE_NAMES[id]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
