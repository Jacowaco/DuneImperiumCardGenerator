import { useState } from 'react'

import {
  AGENT_ICON_IDS,
  AGENT_ICON_STYLES,
  AGENT_ICONS,
  AGENT_BADGE_URLS,
} from '../assets/icons/agents'
import { useT } from '../i18n/strings'
import {
  PLAY_ROWS,
  PLAY_ROWS_LABELS,
  type AnyAgentIcon,
  type Card,
  type ContentPart,
  type PlayRows,
} from '../model/card'
import { isCustomFactionId } from '../model/customFaction'
import { useFactionLibrary } from '../model/factionLibrary'
import { useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { autoPlayRows } from '../render/contentLayout'
import { Choice, MultiChoice, Section, Toggle } from './controls'
import { ContentEditor } from './ContentEditor'
import {
  ContentPalette,
  newPartFor,
  type ContentBox,
  type DragSource,
  type DropTarget,
} from './ContentPalette'

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

/** Qué campo de la carta es cada caja. */
const patchBox = (box: ContentBox, parts: ContentPart[]): Partial<Card> =>
  box === 'play' ? { playContent: parts } : { revealContent: parts }

const insert = (parts: ContentPart[], at: number, part: ContentPart) => [
  ...parts.slice(0, at),
  part,
  ...parts.slice(at),
]

/** La columna tiene exactamente esta cantidad de ranuras — ver `AgentIcons.tsx`. */
const MAX_AGENT_ICONS = AGENT_ICON_IDS.length

/**
 * Lo que la carta hace: dónde puede mandar el agente y qué dicen las dos
 * cajas. Las secciones van en el mismo orden en que se leen en la carta —
 * columna de agente, caja del turno, banda de revelación.
 */
export function RulesPanel({ card, onChange }: Props) {
  const t = useT()
  const { language } = useLanguage()
  const library = useIconLibrary()
  const factionLibrary = useFactionLibrary()
  const customFactionIds = Object.keys(factionLibrary).filter(isCustomFactionId)

  // El arrastre y el destino de la paleta son de las dos cajas a la vez, así
  // que viven acá: una pieza puede salir de una y terminar en la otra, y
  // ninguna de las dos puede resolver eso sola.
  const [target, setTarget] = useState<ContentBox>('play')
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const content = { play: card.playContent, reveal: card.revealContent }

  const add = (part: ContentPart) => onChange(patchBox(target, [...content[target], part]))

  /**
   * Soltar en `box`, en la posición `at`. Los tres casos son distintos:
   * reordenar adentro de una caja, mover una pieza de una caja a la otra, y
   * insertar algo nuevo que viene de la paleta.
   */
  const drop = (box: ContentBox, at: number) => {
    if (dragSource === null) return

    if (dragSource.kind === 'reorder' && dragSource.box === box) {
      const rest = content[box].filter((_, i) => i !== dragSource.index)
      // Sacar la pieza corre un lugar todo lo que venía después.
      onChange(patchBox(box, insert(rest, dragSource.index < at ? at - 1 : at, content[box][dragSource.index])))
    } else if (dragSource.kind === 'reorder') {
      const moved = content[dragSource.box][dragSource.index]
      onChange({
        ...patchBox(dragSource.box, content[dragSource.box].filter((_, i) => i !== dragSource.index)),
        ...patchBox(box, insert(content[box], at, moved)),
      })
    } else {
      const part = newPartFor(dragSource)
      if (part) onChange(patchBox(box, insert(content[box], at, part)))
    }

    // Lo que se soltó en una caja deja a esa caja como destino: es la que se
    // está llenando.
    setTarget(box)
    setDragSource(null)
    setDropTarget(null)
  }

  const editorProps = (box: ContentBox) => ({
    box,
    parts: content[box],
    onChange: (parts: ContentPart[]) => onChange(patchBox(box, parts)),
    active: target === box,
    onActivate: () => setTarget(box),
    dragSource,
    dropTarget,
    onDropTarget: setDropTarget,
    onDrop: drop,
    onDragSource: setDragSource,
  })

  return (
    <>
      <Section
        title={t.rulesPanel.agentIcons}
        action={
          <Toggle
            label={pick(AGENT_ICON_STYLES.infiltrate, language)}
            checked={card.agentIconStyle === 'infiltrate'}
            onChange={(checked) => onChange({ agentIconStyle: checked ? 'infiltrate' : 'locations' })}
          />
        }
      >
        <MultiChoice<AnyAgentIcon>
          values={card.agentIcons}
          iconsOnly
          columns={AGENT_ICON_IDS.length}
          onChange={(next) => {
            // La columna tiene exactamente MAX_AGENT_ICONS ranuras: un click
            // de más que agregaría se ignora, no hay dónde apilarlo.
            if (next.length > card.agentIcons.length && next.length > MAX_AGENT_ICONS) return
            onChange({ agentIcons: next })
          }}
          options={[
            ...AGENT_ICON_IDS.map((id) => ({
              value: id as AnyAgentIcon,
              label: pick(AGENT_ICONS[id], language),
              icon: AGENT_BADGE_URLS[id],
            })),
            /*
              Sin arte de marco (`locations`/`infiltrate`) para una facción
              propia: usan la misma placa negra generada que el selector de
              facción, sea cual sea el estilo elegido arriba.
            */
            ...customFactionIds.map((id) => ({
              value: id as AnyAgentIcon,
              label: factionLibrary[id].label,
              icon: factionLibrary[id].badge ?? factionLibrary[id].emblem,
            })),
          ]}
        />
      </Section>

      <Section title={t.rulesPanel.playTurn} hint={t.rulesPanel.contentHint}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Toggle
            label={t.rulesPanel.autoAdjust}
            checked={card.playRowsAuto}
            onChange={(playRowsAuto) =>
              onChange(
                playRowsAuto
                  ? { playRowsAuto }
                  : { playRowsAuto, playRows: autoPlayRows(card.playContent, library) },
              )
            }
          />

          {!card.playRowsAuto && (
            <Choice
              value={String(card.playRows)}
              columns={3}
              onChange={(rows) => onChange({ playRows: Number(rows ?? 1) as PlayRows })}
              options={PLAY_ROWS.map((rows) => ({
                value: String(rows),
                label: pick(PLAY_ROWS_LABELS[rows], language),
              }))}
            />
          )}

          <Toggle
            label={t.rulesPanel.agentSilhouette}
            checked={card.agentSilhouette}
            onChange={(agentSilhouette) => onChange({ agentSilhouette })}
          />
        </div>

        <ContentEditor {...editorProps('play')} />
      </Section>

      <Section title={t.rulesPanel.reveal} hint={t.rulesPanel.contentHint}>
        <ContentEditor {...editorProps('reveal')} />
      </Section>

      <ContentPalette
        target={target}
        onTarget={setTarget}
        onAdd={add}
        onDragSource={setDragSource}
      />
    </>
  )
}
