import { Image as KonvaImage } from 'react-konva'

import {
  AGENT_ICON_IDS,
  AGENT_ICON_URLS,
  type AgentIconStyle,
} from '../../assets/icons/agents'
import type { AnyAgentIcon } from '../../model/card'
import { isCustomFactionId } from '../../model/customFaction'
import { getFactionAgentIcon } from '../../model/factionArt'
import { findFaction, useFactionLibrary } from '../../model/factionLibrary'
import { AGENT_COLUMN } from '../constants'
import { useCardImage } from '../imageCache'

/**
 * Apila los iconos elegidos siempre en el orden canónico — los del reglamento
 * primero, en su orden, y las facciones propias después en el orden en que se
 * eligieron — no en el orden en que se eligieron los del reglamento.
 *
 * La columna tiene una ranura por icono del reglamento (`AGENT_ICON_IDS.length`,
 * 7) y se llena desde abajo: el último queda pegado a la caja de contenido y
 * los demás crecen hacia arriba, así que el hueco que sobra queda del lado
 * del arte. `.slice(0, 7)` es la misma defensa que ya tiene `FactionBand`: el
 * panel clampea la selección, pero un archivo editado a mano podría no
 * respetarlo, y no hay una octava ranura donde apilar nada.
 */
export function AgentIcons({
  icons,
  style,
}: {
  icons: AnyAgentIcon[]
  style: AgentIconStyle
}) {
  const column = AGENT_COLUMN[style]
  const factionLibrary = useFactionLibrary()

  const ordered = [
    ...AGENT_ICON_IDS.filter((id) => icons.includes(id)),
    ...icons.filter(isCustomFactionId).filter((id) => Boolean(findFaction(factionLibrary, id))),
  ].slice(0, AGENT_ICON_IDS.length)
  const firstSlot = AGENT_ICON_IDS.length - ordered.length

  return (
    <>
      {ordered.map((id, index) => {
        // Una facción propia sí tiene arte de marco por estilo (`factionArt.ts`,
        // compuesto de `psd-exports/factionbg.png` — no hay `AGENT_ICON_URLS`
        // para ella porque ese catálogo es sólo de las siete del reglamento).
        let url: string | undefined
        if (isCustomFactionId(id)) {
          const color = findFaction(factionLibrary, id)?.color
          url = color ? getFactionAgentIcon(id, color, style) : undefined
        } else {
          url = AGENT_ICON_URLS[style][id]
        }
        if (!url) return null

        return (
          <Icon
            key={id}
            url={url}
            x={column.x}
            y={column.top + (firstSlot + index) * column.pitch}
          />
        )
      })}
    </>
  )
}

function Icon({ url, x, y }: { url: string; x: number; y: number }) {
  const image = useCardImage(url)
  return <KonvaImage image={image} x={x} y={y} listening={false} />
}
