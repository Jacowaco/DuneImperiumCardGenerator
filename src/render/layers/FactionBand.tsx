import { Image as KonvaImage } from 'react-konva'

import { factionBandUrl } from '../../assets/layers/factionBands'
import { FACTION_IDS, type AnyFactionId, type Faction } from '../../model/card'
import { isCustomFactionId } from '../../model/customFaction'
import { useTintedFactionBand } from '../../model/factionArt'
import { findFaction, useFactionLibrary } from '../../model/factionLibrary'
import { FACTION_BAND } from '../constants'
import { useCardImage } from '../imageCache'
import { layoutSmallCaps } from '../text'
import { TextShape } from './TextShape'

/**
 * Apila una banda por facción hacia abajo, siempre en el orden canónico —
 * las built-in primero, en el orden de `FACTION_IDS`, y las propias después
 * en el orden en que se eligieron — no en el orden en que se eligieron las
 * built-in, igual que la columna de iconos de agente.
 *
 * `.slice(0, 4)` no es sólo defensa contra un archivo ajeno con más de
 * cuatro: `FACTION_BAND.offsets`/`.widths` sólo tienen las claves 1–4,
 * porque no hay arte para una quinta banda — el panel ya clampea la
 * selección, pero un `.dune.json` editado a mano podría no respetarlo.
 */
export function FactionBand({ factions }: { factions: AnyFactionId[] }) {
  const library = useFactionLibrary()

  const ordered = [
    ...FACTION_IDS.filter((id) => factions.includes(id)),
    ...factions.filter(
      (id): id is Exclude<AnyFactionId, Faction> => isCustomFactionId(id) && Boolean(library[id]),
    ),
  ].slice(0, 4)

  return (
    <>
      {ordered.map((id, index) => {
        const rank = index + 1
        return <Band key={id} id={id} rank={rank} y={FACTION_BAND.offsets[rank]} />
      })}
    </>
  )
}

function Band({ id, rank, y }: { id: AnyFactionId; rank: number; y: number }) {
  const library = useFactionLibrary()
  const entry = findFaction(library, id)
  const custom = isCustomFactionId(id)

  // Los dos hooks se llaman siempre, sin ramificar cuál se ejecuta — sólo
  // cambia el argumento. Ramificar la llamada misma según `custom` pisaría
  // las reglas de hooks en cuanto algo reordenara los renders.
  const tinted = useTintedFactionBand(custom ? entry?.color : undefined, rank)
  const band = useCardImage(custom ? tinted : factionBandUrl(id as Faction, rank))

  if (!entry) return null

  const width = FACTION_BAND.widths[rank]
  const maxWidth = width - (FACTION_BAND.text.x - 25) - FACTION_BAND.text.rightPadding
  const { glyphs } = layoutSmallCaps(entry.label, {
    capHeight: FACTION_BAND.text.capHeight,
    smallCapRatio: 1,
    letterSpacing: 1,
    wordSpacing: 10,
    weight: FACTION_BAND.text.weight,
    maxWidth,
  })

  return (
    <>
      <KonvaImage image={band} y={y} listening={false} />
      <TextShape
        glyphs={glyphs}
        x={FACTION_BAND.text.x}
        baseline={y + FACTION_BAND.top + FACTION_BAND.height / 2 + FACTION_BAND.text.capHeight / 2}
        fill={FACTION_BAND.text.color}
        weight={FACTION_BAND.text.weight}
      />
    </>
  )
}
