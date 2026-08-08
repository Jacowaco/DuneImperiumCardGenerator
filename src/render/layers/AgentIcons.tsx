import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

import {
  AGENT_ICON_IDS,
  AGENT_ICON_URLS,
  type AgentIcon,
  type AgentIconStyle,
} from '../../assets/icons/agents'
import { AGENT_COLUMN } from '../constants'

/**
 * Apila los iconos elegidos siempre en el orden canónico del reglamento (no en
 * el orden en que los eligió el usuario).
 *
 * La columna tiene una ranura por icono del reglamento y se llena desde abajo:
 * el último queda pegado a la caja de contenido y los demás crecen hacia
 * arriba, así que el hueco que sobra queda del lado del arte.
 */
export function AgentIcons({
  icons,
  style,
}: {
  icons: AgentIcon[]
  style: AgentIconStyle
}) {
  const column = AGENT_COLUMN[style]
  const ordered = AGENT_ICON_IDS.filter((id) => icons.includes(id))
  const firstSlot = AGENT_ICON_IDS.length - ordered.length

  return (
    <>
      {ordered.map((id, index) => (
        <Icon
          key={id}
          url={AGENT_ICON_URLS[style][id]}
          x={column.x}
          y={column.top + (firstSlot + index) * column.pitch}
        />
      ))}
    </>
  )
}

function Icon({ url, x, y }: { url: string; x: number; y: number }) {
  const [image] = useImage(url)
  return <KonvaImage image={image} x={x} y={y} listening={false} />
}
