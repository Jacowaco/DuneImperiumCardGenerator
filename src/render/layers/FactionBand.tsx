import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import beneGesseritUrl from '../../assets/layers/faction-bene-gesserit.png'
import emperorUrl from '../../assets/layers/faction-emperor.png'
import fremenUrl from '../../assets/layers/faction-fremen.png'
import spacingGuildUrl from '../../assets/layers/faction-spacing-guild.png'
import type { Faction } from '../../model/card'

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

export function FactionBand({ faction }: { faction: Faction | null }) {
  // El componente interno existe para no llamar a useImage con src vacío.
  return faction ? <Band url={BANDS[faction]} /> : null
}

function Band({ url }: { url: string }) {
  const [band] = useImage(url)
  return <KonvaImage image={band} listening={false} />
}
