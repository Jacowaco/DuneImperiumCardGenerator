import type { AnyIconId } from './card'
import type { IconLibrary } from './iconLibrary'

/**
 * Sin acentos y en minúscula, de los dos lados: quien busca rápido escribe
 * "influencia" sin tilde y "Água" con mayúscula, y ninguna de las dos cosas
 * debería esconder el icono.
 */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * Lo que se compara contra lo tecleado: la etiqueta en el idioma de la UI y,
 * en los del juego, **también el id**.
 *
 * El id es el nombre en inglés (`victory-point`, `spice`), así que sirve de
 * segundo nombre para el que aprendió las cartas en inglés y tiene la app en
 * castellano. En los propios no: ahí el id es un `custom:` con azar adentro y
 * sólo daría coincidencias que no se explican.
 */
const haystack = (library: IconLibrary, id: AnyIconId) => {
  const entry = library[id]
  const label = normalize(entry.label)
  return entry.custom ? label : `${label} ${normalize(id.replace(/-/g, ' '))}`
}

/**
 * Filtra por **todas** las palabras tecleadas, en cualquier orden y en
 * cualquier parte: "pun vic" llega a "Punto de victoria" sin escribirlo entero,
 * que es de lo que se trata buscar en vez de recorrer la grilla.
 */
export const matchesIcon = (library: IconLibrary, id: AnyIconId, query: string) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = haystack(library, id)
  return terms.every((term) => text.includes(term))
}

export const filterIconIds = (library: IconLibrary, ids: AnyIconId[], query: string) =>
  query.trim() === '' ? ids : ids.filter((id) => matchesIcon(library, id, query))
