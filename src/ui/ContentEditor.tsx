import { useT } from '../i18n/strings'
import { type ContentPart } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { useContentDrag, type ContentBox } from './contentDrag'
import { Action, Hint } from './controls'
import { GripIcon, MinusIcon, PlusIcon } from './icons'
import { PART_STYLES } from './ContentPalette'

/**
 * Contenido de una caja: iconos y texto en la misma lista, en el orden en que
 * se dibujan. El acomodo en renglones lo hace el layout, no el usuario; acá
 * sólo se elige qué va y en qué orden.
 *
 * Es nada más que la lista: qué se puede agregar lo decide `ContentPalette`,
 * que es una sola para las dos cajas. El estado del arrastre también vive
 * afuera, por lo mismo — arrastrar una fila del turno a la revelación es un
 * movimiento entre dos listas, y ninguna de las dos cajas puede resolverlo
 * sola.
 */
export function ContentEditor({ box }: { box: ContentBox }) {
  const t = useT()
  const library = useIconLibrary()
  const {
    target,
    setTarget,
    dragSource,
    setDragSource,
    dropTarget,
    setDropTarget,
    parts: partsOf,
    update: updateBox,
    drop,
  } = useContentDrag()

  const parts = partsOf(box)
  const active = target === box
  const onChange = (next: ContentPart[]) => updateBox(box, next)

  const update = (index: number, part: ContentPart) =>
    onChange(parts.map((item, i) => (i === index ? part : item)))

  const remove = (index: number) => onChange(parts.filter((_, i) => i !== index))

  const here = dropTarget?.box === box ? dropTarget : null

  return (
    <div className="flex flex-col gap-2">
      {/* El contenedor es el respaldo de las filas: recibe el drop cuando no
          cae sobre ninguna en particular — la caja vacía, o el hueco después
          de la última —, así que siempre hay dónde soltar, no sólo entre dos
          filas. Cada fila frena la propagación para no disparar los dos a
          la vez.

          El anillo dice cuál de las dos cajas está recibiendo lo que se
          agregue desde la paleta; tocar la caja la elige, que es lo que uno
          hace igual antes de agregarle algo. */}
      <div
        onClick={() => setTarget(box)}
        onDragOver={(event) => {
          if (dragSource === null) return
          event.preventDefault()
          setDropTarget({ box, index: parts.length, before: true })
        }}
        onDrop={(event) => {
          if (dragSource === null) return
          event.preventDefault()
          drop(box, parts.length)
        }}
        className={`flex flex-col gap-2 rounded-md transition-colors ${
          active ? 'ring-1 ring-sand-500/40' : ''
        } ${
          dragSource !== null ? 'outline-dashed outline-1 outline-offset-2 outline-zinc-600' : ''
        } ${here?.index === parts.length ? 'outline-sand-400' : ''} ${
          parts.length === 0 ? 'bg-zinc-900/60 p-3' : ''
        }`}
      >
        {parts.length === 0 && <Hint>{t.contentEditor.empty}</Hint>}

        {parts.map((part, index) => (
          <div
            key={index}
            draggable
            onDragStart={(event) => {
              // Un mousedown que arranca en un input o un botón (el número de
              // cantidad, el texto, la cruz) es al usuario tocando ese control,
              // no queriendo mover la fila.
              if ((event.target as HTMLElement).closest('input, button')) {
                event.preventDefault()
                return
              }
              setDragSource({ kind: 'reorder', box, index })
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => {
              setDragSource(null)
              setDropTarget(null)
            }}
            onDragOver={(event) => {
              if (dragSource === null) return
              if (dragSource.kind === 'reorder' && dragSource.box === box && dragSource.index === index)
                return
              event.preventDefault()
              event.stopPropagation()
              const rect = event.currentTarget.getBoundingClientRect()
              setDropTarget({ box, index, before: event.clientY < rect.top + rect.height / 2 })
            }}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              const rect = event.currentTarget.getBoundingClientRect()
              const before = event.clientY < rect.top + rect.height / 2
              drop(box, before ? index : index + 1)
            }}
            className={`relative flex cursor-grab items-center gap-2 rounded-md border-l-4 p-1.5 transition-opacity active:cursor-grabbing ${
              PART_STYLES[part.type].row
            } ${
              dragSource?.kind === 'reorder' && dragSource.box === box && dragSource.index === index
                ? 'opacity-40'
                : ''
            }`}
          >
            {here?.index === index &&
              dragSource !== null &&
              !(dragSource.kind === 'reorder' && dragSource.box === box && dragSource.index === index) && (
                <div
                  className={`absolute inset-x-0 h-0.5 rounded-full bg-sand-300 ${
                    here.before ? '-top-1' : '-bottom-1'
                  }`}
                />
              )}

            <span className="shrink-0 text-zinc-500">
              <GripIcon />
            </span>

            {part.type === 'icon' && (
              <>
                {/* Un icono propio borrado del mazo deja la pieza sin nada que
                    dibujar. Se dice acá, que es donde se puede arreglar. */}
                <img
                  src={library[part.icon]?.url}
                  alt=""
                  className="size-7 shrink-0 object-contain"
                />
                <span
                  className={`min-w-0 flex-1 truncate text-xs ${
                    library[part.icon] ? 'text-zinc-300' : 'text-red-400'
                  }`}
                >
                  {library[part.icon]?.label ?? t.contentEditor.deletedIcon}
                </span>
                {library[part.icon]?.numberColor && (
                  <div className="flex shrink-0 items-center overflow-hidden rounded border border-zinc-700 bg-zinc-950">
                    <button
                      type="button"
                      title={t.contentEditor.decrease(library[part.icon]?.label ?? '')}
                      aria-label={t.contentEditor.decrease(library[part.icon]?.label ?? '')}
                      disabled={part.amount <= 0}
                      onClick={() =>
                        update(index, { ...part, amount: Math.max(0, part.amount - 1) })
                      }
                      className="flex size-6 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <MinusIcon />
                    </button>
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
                      className="w-7 shrink-0 bg-transparent text-center text-xs text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      title={t.contentEditor.increase(library[part.icon]?.label ?? '')}
                      aria-label={t.contentEditor.increase(library[part.icon]?.label ?? '')}
                      disabled={part.amount >= 99}
                      onClick={() =>
                        update(index, { ...part, amount: Math.min(99, part.amount + 1) })
                      }
                      className="flex size-6 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                )}
              </>
            )}

            {part.type === 'text' && (
              <input
                value={part.text}
                placeholder={t.contentEditor.textPlaceholder}
                onChange={(event) => update(index, { type: 'text', text: event.target.value })}
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
              />
            )}

            {part.type === 'break' && (
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
                {t.contentEditor.lineBreak}
              </span>
            )}

            <Action label={t.contentEditor.remove} onClick={() => remove(index)}>
              ×
            </Action>
          </div>
        ))}
      </div>
    </div>
  )
}
