import {
  AGENT_ICON_IDS,
  AGENT_ICON_STYLES,
  AGENT_ICONS,
  AGENT_BADGE_URLS,
} from '../assets/icons/agents'
import { useT } from '../i18n/strings'
import { PLAY_ROWS, PLAY_ROWS_LABELS, type Card, type PlayRows } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { autoPlayRows } from '../render/contentLayout'
import { Choice, MultiChoice, Section, Toggle } from './controls'
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
        <MultiChoice
          values={card.agentIcons}
          iconsOnly
          columns={AGENT_ICON_IDS.length}
          onChange={(agentIcons) => onChange({ agentIcons })}
          options={AGENT_ICON_IDS.map((id) => ({
            value: id,
            label: pick(AGENT_ICONS[id], language),
            icon: AGENT_BADGE_URLS[id],
          }))}
        />
      </Section>

      <Section title={t.rulesPanel.playTurn}>
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
      </Section>
    </>
  )
}
