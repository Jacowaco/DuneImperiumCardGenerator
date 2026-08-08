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
 * Apila los iconos elegidos desde el tope de la columna, siempre en el orden
 * canónico del reglamento (no en el orden en que los eligió el usuario).
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

  return (
    <>
      {ordered.map((id, index) => (
        <Icon
          key={id}
          url={AGENT_ICON_URLS[style][id]}
          x={column.x}
          y={column.top + index * column.pitch}
        />
      ))}
    </>
  )
}

function Icon({ url, x, y }: { url: string; x: number; y: number }) {
  const [image] = useImage(url)
  return <KonvaImage image={image} x={x} y={y} listening={false} />
}
