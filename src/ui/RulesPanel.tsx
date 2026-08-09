import {
  AGENT_ICON_IDS,
  AGENT_ICON_STYLE_IDS,
  AGENT_ICON_STYLES,
  AGENT_ICONS,
  AGENT_BADGE_URLS,
  type AgentIconStyle,
} from '../assets/icons/agents'
import { useT } from '../i18n/strings'
import { PLAY_ROWS, PLAY_ROWS_LABELS, type Card, type PlayRows } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { autoPlayRows } from '../render/contentLayout'
import { Choice, Field, Hint, MultiChoice, Section, Toggle } from './controls'
import { ContentEditor } from './ContentEditor'

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

/**
 * Lo que la carta hace: dónde puede mandar el agente y qué dicen las dos
 * cajas. Las secciones van en el mismo orden en que se leen en la carta —
 * columna de agente, caja del turno, banda de revelación.
 */
export function RulesPanel({ card, onChange }: Props) {
  const t = useT()
  const { language } = useLanguage()
  const library = useIconLibrary()

  return (
    <>
      <Section title={t.rulesPanel.agentIcons}>
        <MultiChoice
          values={card.agentIcons}
          iconsOnly
          columns={4}
          onChange={(agentIcons) => onChange({ agentIcons })}
          options={AGENT_ICON_IDS.map((id) => ({
            value: id,
            label: pick(AGENT_ICONS[id], language),
            icon: AGENT_BADGE_URLS[id],
          }))}
        />
        <Field label={t.rulesPanel.style}>
          <Choice<AgentIconStyle>
            value={card.agentIconStyle}
            onChange={(style) => onChange({ agentIconStyle: style ?? 'locations' })}
            options={AGENT_ICON_STYLE_IDS.map((id) => ({
              value: id,
              label: pick(AGENT_ICON_STYLES[id], language),
            }))}
          />
        </Field>
      </Section>

      <Section title={t.rulesPanel.playTurn}>
        <Field label={t.rulesPanel.boxHeight}>
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

          {card.playRowsAuto ? (
            <Hint>
              {t.rulesPanel.autoHint(
                pick(PLAY_ROWS_LABELS[autoPlayRows(card.playContent, library)], language),
              )}
            </Hint>
          ) : (
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
        </Field>

        <Toggle
          label={t.rulesPanel.agentSilhouette}
          checked={card.agentSilhouette}
          onChange={(agentSilhouette) => onChange({ agentSilhouette })}
        />

        <ContentEditor
          parts={card.playContent}
          onChange={(playContent) => onChange({ playContent })}
        />
      </Section>

      <Section title={t.rulesPanel.reveal}>
        <ContentEditor
          parts={card.revealContent}
          onChange={(revealContent) => onChange({ revealContent })}
        />
        <Hint>{t.rulesPanel.alwaysBothHint}</Hint>
      </Section>
    </>
  )
}
