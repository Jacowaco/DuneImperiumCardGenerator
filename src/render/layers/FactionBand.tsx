import { Image as KonvaImage } from 'react-konva'

import { factionBandUrl } from '../../assets/layers/factionBands'
import { FACTIONS, FACTION_IDS, type Faction } from '../../model/card'
import { pick, useLanguage } from '../../model/language'
import { FACTION_BAND } from '../constants'
import { useCardImage } from '../imageCache'
import { layoutSmallCaps } from '../text'
import { TextShape } from './TextShape'

/**
 * Apila una banda por facción hacia abajo, siempre en el orden canónico
 * (no en el orden en que las eligió el usuario), igual que la columna de
 * iconos de agente.
 *
 * Cada facción ocupa la posición que le toca según cuántas la preceden
 * *entre las elegidas* — no su posición absoluta en `FACTION_IDS` — así que
 * si sólo se eligen dos, la primera sigue siendo la ancha de arriba.
 */
export function FactionBand({ factions }: { factions: Faction[] }) {
  const ordered = FACTION_IDS.filter((id) => factions.includes(id))

  return (
    <>
      {ordered.map((id, index) => {
        const rank = index + 1
        return <Band key={id} faction={id} rank={rank} y={FACTION_BAND.offsets[rank]} />
      })}
    </>
  )
}

function Band({ faction, rank, y }: { faction: Faction; rank: number; y: number }) {
  const { language } = useLanguage()
  const band = useCardImage(factionBandUrl(faction, rank))

  const width = FACTION_BAND.widths[rank]
  const maxWidth = width - (FACTION_BAND.text.x - 25) - FACTION_BAND.text.rightPadding
  const { glyphs } = layoutSmallCaps(pick(FACTIONS[faction], language), {
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
