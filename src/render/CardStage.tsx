import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { RefObject } from 'react'
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from 'react-konva'
import useImage from 'use-image'

import blackBorderUrl from '../assets/layers/black-border.png'
import cardArtContainerUrl from '../assets/layers/card-art-container.png'
import { NO_EXPORT } from '../export/exportPng'
import { clampArtScale } from '../model/art'
import type { ArtTransform, Card } from '../model/card'
import { ART_RECT, CARD_HEIGHT, CARD_WIDTH } from './constants'

type Props = {
  card: Card
  /** Escala del preview. El export siempre sale al tamaño real del template. */
  scale: number
  stageRef: RefObject<Konva.Stage | null>
  onArtChange: (transform: ArtTransform) => void
}

const ZOOM_SPEED = 0.0015

/**
 * Dibuja la carta completa. El orden de los hijos del Layer es el orden de
 * apilado del PSD, de abajo hacia arriba — las capas nuevas se insertan en
 * el punto que les corresponde y nada más cambia.
 */
export function CardStage({ card, scale, stageRef, onArtChange }: Props) {
  const [artContainer] = useImage(cardArtContainerUrl)
  const [blackBorder] = useImage(blackBorderUrl)
  const [artImage] = useImage(card.art?.src ?? '')

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    if (!card.art) return
    event.evt.preventDefault()

    const stage = event.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) return

    // El puntero viene en píxeles de pantalla; lo pasamos a coordenadas de carta.
    const px = pointer.x / scale
    const py = pointer.y / scale

    const { x, y, scale: current } = card.art.transform
    const next = clampArtScale(current * Math.exp(-event.evt.deltaY * ZOOM_SPEED))

    // Mantiene fijo el punto bajo el cursor mientras se hace zoom.
    onArtChange({
      scale: next,
      x: px - ((px - x) / current) * next,
      y: py - ((py - y) / current) * next,
    })
  }

  const handleDrag = (event: KonvaEventObject<DragEvent>) => {
    if (!card.art) return
    onArtChange({ ...card.art.transform, x: event.target.x(), y: event.target.y() })
  }

  return (
    <Stage
      ref={stageRef}
      width={CARD_WIDTH * scale}
      height={CARD_HEIGHT * scale}
      scaleX={scale}
      scaleY={scale}
      onWheel={handleWheel}
    >
      <Layer>
        {/* Fondo del recorte de arte (capa "Card Art Container" del PSD) */}
        <KonvaImage image={artContainer} listening={false} />

        {/* Imagen del jugador, recortada al contenedor */}
        <Group clip={{ ...ART_RECT }}>
          {card.art && artImage && (
            <KonvaImage
              image={artImage}
              x={card.art.transform.x}
              y={card.art.transform.y}
              scaleX={card.art.transform.scale}
              scaleY={card.art.transform.scale}
              draggable
              onDragMove={handleDrag}
              onDragEnd={handleDrag}
            />
          )}
        </Group>

        {!card.art && <ArtPlaceholder />}

        {/* Borde negro: siempre la última capa, tapa lo que se desborde */}
        <KonvaImage image={blackBorder} listening={false} />
      </Layer>
    </Stage>
  )
}

function ArtPlaceholder() {
  return (
    <Group name={NO_EXPORT} listening={false}>
      <Rect
        {...ART_RECT}
        stroke="#a1a1aa"
        strokeWidth={3}
        dash={[14, 12]}
        cornerRadius={4}
      />
      <Text
        {...ART_RECT}
        text="Arrastrá una imagen acá"
        fontSize={34}
        fontFamily="system-ui, sans-serif"
        fill="#a1a1aa"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  )
}
