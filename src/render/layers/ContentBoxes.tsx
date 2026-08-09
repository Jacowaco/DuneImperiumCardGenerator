import { Image as KonvaImage } from 'react-konva'

import agentSilhouetteUrl from '../../assets/layers/agent-icon.png'
import playBox1Url from '../../assets/layers/play-box-1.png'
import playBox2Url from '../../assets/layers/play-box-2.png'
import playBox3Url from '../../assets/layers/play-box-3.png'
import revealBoxUrl from '../../assets/layers/reveal-box.png'
import type { Card, PlayRows } from '../../model/card'
import { useIconLibrary } from '../../model/iconLibrary'
import { effectivePlayRows } from '../contentLayout'
import { useCardImage } from '../imageCache'

const PLAY_BOXES: Record<PlayRows, string> = {
  1: playBox1Url,
  2: playBox2Url,
  3: playBox3Url,
}

/**
 * Las dos cajas de contenido de la mitad de abajo. Las dos van siempre: toda
 * carta tiene turno de agente y banda de revelación, aunque queden vacías.
 *
 * La banda de reveal es única y va fija; la caja de play arranca siempre en
 * y=696 y crece hacia abajo, tapándola. Por eso el orden importa: reveal
 * primero, play encima — igual que en el PSD.
 */
export function ContentBoxes({ card }: { card: Card }) {
  const library = useIconLibrary()
  const rows = effectivePlayRows(card, library)

  return (
    <>
      <Layer url={revealBoxUrl} />
      <Layer url={PLAY_BOXES[rows]} />
      {card.agentSilhouette && <Layer url={agentSilhouetteUrl} />}
    </>
  )
}

function Layer({ url }: { url: string }) {
  const image = useCardImage(url)
  return <KonvaImage image={image} listening={false} />
}
