import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import beneGesseritUrl from '../../assets/layers/faction-bene-gesserit.png'
import emperorUrl from '../../assets/layers/faction-emperor.png'
import fremenUrl from '../../assets/layers/faction-fremen.png'
import spacingGuildUrl from '../../assets/layers/faction-spacing-guild.png'
import { FACTION_IDS, type Faction } from '../../model/card'
import { FACTION_BAND_EDGES } from '../constants'

/**
 * El nombre de la facción viene dibujado en el PNG, y todas las bandas ya
 * fueron alineadas a la misma altura por `scripts/prepare_assets.py`.
 */
const BANDS: Record<Faction, string> = {
  emperor: emperorUrl,
  'spacing-guild': spacingGuildUrl,
  'bene-gesserit': beneGesseritUrl,
  fremen: fremenUrl,
}

/**
 * Apila una banda por facción hacia abajo, siempre en el orden canónico
 * (no en el orden en que las eligió el usuario), igual que la columna de
 * iconos de agente.
 *
 * El desplazamiento no es un paso fijo: cada banda se corre lo justo para que
 * su borde superior caiga sobre el inferior de la anterior. Ver
 * `FACTION_BAND_EDGES`.
 */
export function FactionBand({ factions }: { factions: Faction[] }) {
  const ordered = FACTION_IDS.filter((id) => factions.includes(id))

  const offsets: number[] = []
  ordered.forEach((id, index) => {
    const previous = ordered[index - 1]
    offsets.push(
      previous
        ? offsets[index - 1] + FACTION_BAND_EDGES[previous].bottom - FACTION_BAND_EDGES[id].top
        : 0,
    )
  })

  return (
    <>
      {ordered.map((id, index) => (
        <Band key={id} url={BANDS[id]} y={offsets[index]} />
      ))}
    </>
  )
}

// El componente interno existe para no llamar a useImage con src vacío.
function Band({ url, y }: { url: string; y: number }) {
  const [band] = useImage(url)
  return <KonvaImage image={band} y={y} listening={false} />
}
