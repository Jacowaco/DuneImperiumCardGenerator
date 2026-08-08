import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import agentSilhouetteUrl from '../../assets/layers/agent-icon.png'
import playBox1Url from '../../assets/layers/play-box-1.png'
import playBox2Url from '../../assets/layers/play-box-2.png'
import playBox3Url from '../../assets/layers/play-box-3.png'
import revealBoxUrl from '../../assets/layers/reveal-box.png'
import type { Card, PlayRows } from '../../model/card'

const PLAY_BOXES: Record<Exclude<PlayRows, 0>, string> = {
  1: playBox1Url,
  2: playBox2Url,
  3: playBox3Url,
}

/**
 * Las dos cajas de contenido de la mitad de abajo.
 *
 * La banda de reveal es única y va fija; la caja de play arranca siempre en
 * y=696 y crece hacia abajo, tapándola. Por eso el orden importa: reveal
 * primero, play encima — igual que en el PSD.
 */
export function ContentBoxes({ card }: { card: Card }) {
  return (
    <>
      {card.revealBox && <Layer url={revealBoxUrl} />}
      {card.playRows > 0 && <Layer url={PLAY_BOXES[card.playRows as Exclude<PlayRows, 0>]} />}
      {card.agentSilhouette && card.playRows > 0 && <Layer url={agentSilhouetteUrl} />}
    </>
  )
}

function Layer({ url }: { url: string }) {
  const [image] = useImage(url)
  return <KonvaImage image={image} listening={false} />
}
