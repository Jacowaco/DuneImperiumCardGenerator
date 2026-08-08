import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import beneGesseritUrl from '../../assets/layers/faction-bene-gesserit.png'
import emperorUrl from '../../assets/layers/faction-emperor.png'
import fremenUrl from '../../assets/layers/faction-fremen.png'
import spacingGuildUrl from '../../assets/layers/faction-spacing-guild.png'
import { FACTION_IDS, type Faction } from '../../model/card'
import { FACTION_BAND_PITCH } from '../constants'

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
 */
export function FactionBand({ factions }: { factions: Faction[] }) {
  const ordered = FACTION_IDS.filter((id) => factions.includes(id))

  return (
    <>
      {ordered.map((id, index) => (
        <Band key={id} url={BANDS[id]} y={index * FACTION_BAND_PITCH} />
      ))}
    </>
  )
}

// El componente interno existe para no llamar a useImage con src vacío.
function Band({ url, y }: { url: string; y: number }) {
  const [band] = useImage(url)
  return <KonvaImage image={band} y={y} listening={false} />
}
