import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/strings'
import { LANGUAGE_IDS, LANGUAGE_NAMES, type Language } from '../model/language'
import { Button } from './controls'
import { ChevronDownIcon, DownloadIcon, GlobeIcon, InfoIcon, RedoIcon, UndoIcon } from './icons'

type Props = {
  exporting: boolean
  language: Language
  onLanguageChange: (language: Language) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  onAbout: () => void
}

/**
 * Barra de arriba: idioma, deshacer/rehacer y exportar la carta abierta.
 *
 * El mazo como archivo —nombre, abrir, guardar— vive en el pie de la columna
 * del mazo (`DeckFileControls`, montado desde `App.tsx`) y no acá: son
 * acciones del mazo entero, así que se buscan ahí. Acá queda lo que no es ni
 * de una carta ni del mazo como archivo — deshacer y el idioma son de la
 * sesión de edición— más exportar, que es de la carta abierta.
 */
export function TopBar({
  exporting,
  language,
  onLanguageChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onAbout,
}: Props) {
  const t = useT()

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-2.5">
      <div className="flex shrink-0 items-baseline gap-2">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-5 self-center rounded-sm" />
        <h1 className="text-sm font-semibold tracking-wide text-sand-100">{t.topBar.title}</h1>
        <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
          {t.topBar.subtitle}
        </span>
        <span className="text-[10px] text-zinc-600">v{__APP_VERSION__}</span>

        {/*
          El descargo de fans va acá, pegado al nombre de la app: es de la app
          entera, no del mazo ni de la carta abierta. Botón al ras y no uno con
          fondo, para no competir con las acciones de la derecha.
        */}
        <button
          type="button"
          onClick={onAbout}
          title={t.dialogs.about}
          aria-label={t.dialogs.about}
          className="self-center rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <InfoIcon />
        </button>
      </div>

      <div className="h-5 w-px shrink-0 bg-zinc-800" />

      <LanguageMenu language={language} onChange={onLanguageChange} />

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button onClick={onUndo} disabled={!canUndo} title={t.topBar.undo} aria-label={t.topBar.undo}>
          <UndoIcon />
        </Button>
        <Button onClick={onRedo} disabled={!canRedo} title={t.topBar.redo} aria-label={t.topBar.redo}>
          <RedoIcon />
        </Button>

        <div className="mx-1 h-5 w-px bg-zinc-800" />

        {/* «Exportar carta», no «Exportar PNG»: lo que lo distingue del botón
            del pie del mazo es el alcance —esta carta contra el mazo entero—, y
            no el formato, que va en el título. */}
        <Button variant="primary" onClick={onExport} disabled={exporting} title={t.topBar.exportTitle}>
          <DownloadIcon />
          {exporting ? t.topBar.exporting : t.topBar.export}
        </Button>
      </div>
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
