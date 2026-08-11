import { createContext, useContext } from 'react'

import { FACTIONS, FACTION_COLORS, FACTION_IDS, type AnyFactionId } from './card'
import type { CustomFaction } from './customFaction'
import { getFactionPickerBadge } from './factionArt'
import { pick, type Language } from './language'

/**
 * Todo lo que hace falta saber de una facción para dibujarla y para
 * ofrecerla en el panel, sea del juego base o propia — mismo rol que
 * `IconEntry`/`IconLibrary` en `iconLibrary.ts`, y por la misma razón: a
 * partir de las facciones propias el catálogo deja de ser una constante del
 * build, depende del mazo abierto.
 */
export type FactionEntry = {
  label: string
  color: string
  /** Sólo las propias: el emblema subido, crudo (sin placa). */
  emblem?: string
  /**
   * Sólo las propias: la placa sin marco para los botones de selector —
   * mismo rol que `AGENT_BADGE_URLS` para las built-in. `undefined` mientras
   * todavía se está calentando.
   *
   * El icono de agente en la columna de la carta es aparte
   * (`getFactionAgentIcon`, con marco y depende del estilo Normal/
   * Infiltración) y no vive acá — lo consume directo `AgentIcons.tsx`, igual
   * que la banda tintada no vive en `FactionEntry` tampoco.
   */
  badge?: string
  custom?: boolean
}

export type FactionLibrary = Record<string, FactionEntry>

const buildBuiltinFactions = (language: Language): FactionLibrary =>
  Object.fromEntries(
    FACTION_IDS.map((id) => [id, { label: pick(FACTIONS[id], language), color: FACTION_COLORS[id] }]),
  )

export const customFactionEntry = (faction: CustomFaction): FactionEntry => ({
  label: faction.label,
  color: faction.color,
  emblem: faction.emblem,
  badge: getFactionPickerBadge(faction.id),
  custom: true,
})

export const buildFactionLibrary = (custom: CustomFaction[], language: Language): FactionLibrary => ({
  ...buildBuiltinFactions(language),
  ...Object.fromEntries(custom.map((faction) => [faction.id, customFactionEntry(faction)])),
})

/**
 * El catálogo se pasa por contexto por lo mismo que `IconLibrary`: sale del
 * mazo, y tanto el render como los paneles necesitan el mismo.
 */
const FactionLibraryContext = createContext<FactionLibrary>(buildBuiltinFactions('es'))

export const FactionLibraryProvider = FactionLibraryContext.Provider
export const useFactionLibrary = () => useContext(FactionLibraryContext)

/**
 * Una carta puede nombrar una facción que ya no está. Igual que `findIcon`,
 * eso no rompe el render: la banda se saltea al dibujar.
 */
export const findFaction = (library: FactionLibrary, id: AnyFactionId): FactionEntry | undefined =>
  library[id]
