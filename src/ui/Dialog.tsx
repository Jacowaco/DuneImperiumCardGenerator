import { useEffect, useRef, type ReactNode } from 'react'

import { useT } from '../i18n/strings'
import { HintMark } from './controls'
import { CloseIcon } from './icons'

/**
 * Diálogo modal para lo que se usa cada tanto y no merece ocupar lugar fijo en
 * pantalla. Es el `<dialog>` nativo, así que Esc cierra y el fondo queda
 * inerte sin tener que manejarlo a mano.
 *
 * `onClose` es el evento nativo: cerrar de cualquier forma —Esc, la ×, el
 * fondo— pasa por ahí, y es un solo lugar donde apagar el estado en React.
 */
export function Dialog({
  title,
  hint,
  size = 'narrow',
  onClose,
  children,
}: {
  title: string
  /**
   * Cómo funciona lo que hay adentro, en el título y no al pie del panel: es
   * de todo el diálogo, y abajo de la grilla queda lejos de lo que explica y
   * ocupa lugar cada vez que se abre.
   */
  hint?: string
  /**
   * `narrow` es el ancho de un panel del costado, para lo que sigue siendo una
   * columna de controles. `wide` es para lo que se mira en grilla, donde el
   * ancho no es decoración: define cuántas columnas entran.
   */
  size?: 'narrow' | 'wide'
  onClose: () => void
  children: ReactNode
}) {
  const t = useT()
  const ref = useRef<HTMLDialogElement | null>(null)

  useEffect(() => ref.current?.showModal(), [])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // El backdrop es parte del propio <dialog>, así que un clic ahí llega
      // con el dialog como target; los clics de adentro los tapan los hijos.
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      // El ancho se topa contra la pantalla: en un portátil chico, 640 px fijos
      // se irían del viewport y el diálogo nativo no tiene dónde ir.
      className={`m-auto max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-800 bg-zinc-950 p-0 text-zinc-100 shadow-2xl shadow-black/60 backdrop:bg-black/60 ${
        size === 'wide' ? 'w-[640px]' : 'w-[360px]'
      }`}
    >
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-sand-500 uppercase">
          {title}
          {hint && <HintMark label={hint} />}
        </h2>
        <button
          onClick={() => ref.current?.close()}
          title={t.dialogs.close}
          aria-label={t.dialogs.close}
          className="flex size-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="max-h-[70vh] overflow-y-auto">{children}</div>
    </dialog>
  )
}
