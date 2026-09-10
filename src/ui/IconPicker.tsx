import { useState, type ReactNode } from 'react'

import { useT } from '../i18n/strings'
import type { AnyIconId } from '../model/card'
import { groupIconIds, type IconLibrary } from '../model/iconLibrary'
import { filterIconIds } from '../model/iconSearch'
import { SearchIcon } from './icons'

/**
 * El catálogo entero para elegir un icono: el buscador arriba y abajo la
 * grilla agrupada (propios, juego base, expansiones, influencia).
 *
 * Es **uno solo para los dos lugares donde se elige un icono** —las cajas de
 * contenido y el beneficio de compra—, que antes repetían la misma escalera de
 * cinco grupos con distinto `onPick`. Compartirlo es lo que hace que el
 * buscador aparezca en los dos sin escribirlo dos veces.
 *
 * Buscar es el camino rápido para armar cartas: el catálogo son unas cuarenta
 * y cinco piezas más las propias, y encontrar "Punto de victoria" a ojo cuesta
 * más que escribir tres letras. Por eso el campo se enfoca solo al abrir y
 * **Enter agrega el primer resultado** sin levantar la mano del teclado; la
 * búsqueda no se limpia, así que dos Enter son dos especias.
 */
export function IconPicker({
  library,
  onPick,
  onClose,
  onDragStart,
  onDragEnd,
  children,
  className = '',
  listClassName = '',
}: {
  library: IconLibrary
  onPick: (icon: AnyIconId) => void
  /** Escape cierra el selector, donde haya algo que cerrar. */
  onClose?: () => void
  onDragStart?: (icon: AnyIconId) => void
  onDragEnd?: () => void
  /** Lo que va arriba de la grilla y debajo del buscador (el "Ninguno"). */
  children?: ReactNode
  className?: string
  /**
   * El alto y el scroll de la grilla, cuando quien lo usa necesita toparla.
   * Va en la grilla y no en el selector entero para que el buscador quede
   * siempre a la vista: dentro del scroll se iría hacia arriba justo mientras
   * se lo está usando.
   */
  listClassName?: string
}) {
  const t = useT()
  const [query, setQuery] = useState('')
  const { custom, core, ix, immortality, influence } = groupIconIds(library)

  const groups = [
    { label: t.contentEditor.custom, ids: custom },
    { label: t.contentEditor.core, ids: core },
    { label: 'Rise of Ix', ids: ix },
    { label: 'Immortality', ids: immortality },
    { label: t.contentEditor.influence, ids: influence },
  ]
    .map((group) => ({ ...group, ids: filterIconIds(library, group.ids, query) }))
    .filter((group) => group.ids.length > 0)

  // El primero de la lista, en el orden en que se ve: es el que se lleva el
  // Enter, y por eso también el que va marcado.
  const first = groups[0]?.ids[0]

  return (
    <div className={`flex flex-col gap-2 rounded-md bg-zinc-900 p-2 ${className}`}>
      <div className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-950 px-2 focus-within:border-sand-500">
        <span className="shrink-0 text-zinc-500">
          <SearchIcon />
        </span>
        <input
          type="search"
          autoFocus
          value={query}
          placeholder={t.contentEditor.search}
          aria-label={t.contentEditor.search}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && first) {
              event.preventDefault()
              onPick(first)
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              // Con algo escrito, Escape borra la búsqueda y recién después
              // cierra: lo primero que se quiere deshacer es el filtro.
              if (query !== '') setQuery('')
              else onClose?.()
            }
          }}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      {children}

      <div className={`flex flex-col gap-2 ${listClassName}`}>
        {groups.length === 0 ? (
          <p className="px-1 py-2 text-xs text-zinc-500">{t.contentEditor.noResults}</p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">{group.label}</p>
              <Grid
                ids={group.ids}
                library={library}
                highlighted={query.trim() === '' ? undefined : first}
                onPick={onPick}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/** Grilla de iconos para elegir uno. */
function Grid({
  ids,
  library,
  highlighted,
  onPick,
  onDragStart,
  onDragEnd,
}: {
  ids: AnyIconId[]
  library: IconLibrary
  highlighted?: AnyIconId
  onPick: (icon: AnyIconId) => void
  onDragStart?: (icon: AnyIconId) => void
  onDragEnd?: () => void
}) {
  return (
    // Nueve por fila y casi sin aire entre ellos: el catálogo entero son unas
    // cuarenta y cinco piezas, y a seis por fila había que scrollear la grilla
    // para llegar a influencia. Los iconos son siluetas de color plano, así
    // que se siguen reconociendo chicos.
    <div className="grid grid-cols-9 gap-0.5">
      {ids.map((icon) => (
        <button
          key={icon}
          title={library[icon].label}
          onClick={() => onPick(icon)}
          draggable={onDragStart !== undefined}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'copy'
            onDragStart?.(icon)
          }}
          onDragEnd={onDragEnd}
          // El anillo del primero va **hacia adentro** (`inset-ring`): dibujado
          // por fuera, el borde izquierdo se lo comía el contenedor que
          // scrollea, porque la primera columna de la grilla arranca justo
          // sobre ese borde.
          className={`flex aspect-square items-center justify-center rounded p-0.5 transition-colors hover:bg-zinc-700 ${icon === highlighted ? 'inset-ring-1 inset-ring-sand-500' : ''} ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <img
            src={library[icon].url}
            alt={library[icon].label}
            draggable={false}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      ))}
    </div>
  )
}
