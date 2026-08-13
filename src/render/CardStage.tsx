import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { RefObject } from 'react'
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from 'react-konva'

import backgroundUrl from '../assets/layers/background.png'
import blackBorderUrl from '../assets/layers/black-border.png'
import cardArtContainerUrl from '../assets/layers/card-art-container.png'
import { NO_EXPORT } from '../export/exportPng'
import { useT } from '../i18n/strings'
import { artPlacement, artSize, clampArtScale, clampArtTransform } from '../model/art'
import type { ArtTransform, Card } from '../model/card'
import { ART_RECT, CARD_HEIGHT, CARD_WIDTH } from './constants'
import { useCardImage } from './imageCache'
import { AgentIcons } from './layers/AgentIcons'
import { CardTitle } from './layers/CardTitle'
import { ContentBoxes } from './layers/ContentBoxes'
import { ContentBlock } from './layers/ContentBlock'
import { CostBadge } from './layers/CostBadge'
import { FactionBand } from './layers/FactionBand'
import { useFontsReady } from './useFontsReady'

type Props = {
  card: Card
  /** Escala del preview. El export siempre sale al tamaño real del template. */
  scale: number
  stageRef?: RefObject<Konva.Stage | null>
  /**
   * Sin esto la carta se dibuja pero no se puede tocar: es el modo que usan
   * las miniaturas de la galería.
   */
  onArtChange?: (transform: ArtTransform) => void
  /** Sin imagen, tocar el hueco del arte abre el diálogo para elegir una. */
  onArtPick?: () => void
  /**
   * Si una pieza de texto vacía se dibuja con la palabra de relleno. Es una
   * ayuda del editor —por eso viene prendida con la carta editable— y se puede
   * apagar aparte: el PNG de la carta abierta sale de este mismo stage, y ahí
   * no alcanza con ocultar el relleno, porque el lugar que ocupaba correría el
   * resto del renglón.
   */
  placeholders?: boolean
}

const ZOOM_SPEED = 0.0015

/**
 * Dibuja la carta completa. El orden de los hijos del Layer es el orden de
 * apilado del PSD, de abajo hacia arriba — las capas nuevas se insertan en
 * el punto que les corresponde y nada más cambia.
 */
export function CardStage({
  card,
  scale,
  stageRef,
  onArtChange,
  onArtPick,
  placeholders = Boolean(onArtChange),
}: Props) {
  const background = useCardImage(backgroundUrl)
  const artContainer = useCardImage(cardArtContainerUrl)
  const blackBorder = useCardImage(blackBorderUrl)
  const t = useT()
  const placeholderText = t.artPanel.placeholder
  useFontsReady()

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    if (!card.art || !onArtChange || card.art.locked) return
    event.evt.preventDefault()

    const stage = event.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) return

    // El puntero viene en píxeles de pantalla; lo pasamos a coordenadas de carta.
    const px = pointer.x / scale
    const py = pointer.y / scale

    const { x, y, scale: current } = card.art.transform
    // Las cuentas de encuadre van sobre la imagen ya girada, no sobre el
    // archivo: con 90° o 270° el alto y el ancho están cambiados.
    const { width, height } = artSize(card.art)
    const next = clampArtScale(
      current * Math.exp(-event.evt.deltaY * ZOOM_SPEED),
      width,
      height,
    )

    // Mantiene fijo el punto bajo el cursor mientras se hace zoom; el clamp
    // después lo empuja de vuelta adentro si el zoom destapó un borde.
    onArtChange(
      clampArtTransform(
        {
          scale: next,
          x: px - ((px - x) / current) * next,
          y: py - ((py - y) / current) * next,
        },
        width,
        height,
      ),
    )
  }

  const handleDrag = (event: KonvaEventObject<DragEvent>) => {
    if (!card.art || !onArtChange || card.art.locked) return
    // El nodo está corrido respecto de la caja que ocupa la imagen cuando hay
    // giro (`artPlacement`), así que se le suma la misma diferencia para volver
    // a la esquina de la caja, que es lo que guarda el modelo.
    const { minX, minY } = artPlacement(card.art)
    const { width, height } = artSize(card.art)
    onArtChange(
      clampArtTransform(
        { ...card.art.transform, x: event.target.x() + minX, y: event.target.y() + minY },
        width,
        height,
      ),
    )
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
        <KonvaImage image={background} listening={false} />

        {/* Fondo del recorte de arte (capa "Card Art Container" del PSD) */}
        <KonvaImage image={artContainer} listening={false} />

        {/* Imagen del jugador, recortada al contenedor */}
        <Group clip={{ ...ART_RECT }}>
          {card.art && (
            <ArtImage
              art={card.art}
              stageScale={scale}
              draggable={Boolean(onArtChange) && !card.art.locked}
              onDrag={handleDrag}
            />
          )}
        </Group>

        {!card.art && onArtChange && <ArtPlaceholder onPick={onArtPick} placeholder={placeholderText} />}

        <ContentBoxes card={card} />
        {/* La galería y las hojas de impresión no la piden, así que ven la
            carta igual que el PNG exportado. */}
        <ContentBlock card={card} placeholder={placeholders ? t.contentEditor.emptyText : undefined} />
        <AgentIcons icons={card.agentIcons} style={card.agentIconStyle} />
        <FactionBand factions={card.factions} />
        <CardTitle card={card} placeholder={placeholders ? t.cardPanel.name : undefined} />
        <CostBadge card={card} />

        {/* Borde negro: siempre la última capa, tapa lo que se desborde */}
        <KonvaImage image={blackBorder} listening={false} />
      </Layer>
    </Stage>
  )
}

function ArtImage({
  art,
  stageScale,
  draggable,
  onDrag,
}: {
  art: NonNullable<Card['art']>
  stageScale: number
  draggable: boolean
  onDrag: (event: KonvaEventObject<DragEvent>) => void
}) {
  const image = useCardImage(art.src)
  const { konvaX, konvaY, minX, minY, rotation, scaleX, scaleY } = artPlacement(art)
  const { width, height } = artSize(art)
  if (!image) return null

  return (
    <KonvaImage
      image={image}
      x={konvaX}
      y={konvaY}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      draggable={draggable}
      // Konva mueve el nodo por su cuenta durante el arrastre, así que el
      // límite tiene que aplicarse acá y no sólo al guardar el transform.
      // La posición viene en píxeles de pantalla; el modelo está en píxeles
      // de carta, y apunta a la esquina de la imagen girada y no a la del nodo.
      dragBoundFunc={(pos) => {
        const clamped = clampArtTransform(
          { ...art.transform, x: pos.x / stageScale + minX, y: pos.y / stageScale + minY },
          width,
          height,
        )
        return { x: (clamped.x - minX) * stageScale, y: (clamped.y - minY) * stageScale }
      }}
      onDragMove={onDrag}
      onDragEnd={onDrag}
    />
  )
}

function ArtPlaceholder({ onPick, placeholder }: { onPick?: () => void; placeholder: string }) {
  const setCursor = (cursor: string) => (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage()
    if (stage) stage.container().style.cursor = cursor
  }

  return (
    <Group
      name={NO_EXPORT}
      listening={Boolean(onPick)}
      onClick={onPick}
      onTap={onPick}
      onMouseEnter={setCursor('pointer')}
      onMouseLeave={setCursor('default')}
    >
      <Rect
        {...ART_RECT}
        stroke="#a1a1aa"
        strokeWidth={3}
        dash={[14, 12]}
        cornerRadius={4}
      />
      <Text
        {...ART_RECT}
        text={placeholder}
        fontSize={34}
        fontFamily="system-ui, sans-serif"
        fill="#a1a1aa"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  )
}
