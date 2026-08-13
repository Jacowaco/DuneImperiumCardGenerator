import { useT } from '../i18n/strings'
import { PLAY_ROWS, PLAY_ROWS_LABELS, type Card, type PlayRows } from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { autoPlayRows } from '../render/contentLayout'
import { Choice, Section, Toggle } from './controls'
import { ContentEditor } from './ContentEditor'
import { ContentPalette } from './ContentPalette'

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

/**
 * Lo que dicen las dos cajas de abajo: la del turno de agente y la banda de
 * revelación, en el mismo orden en que se leen en la carta. La columna de
 * agente no está acá: es de quién es la carta, así que va con el nombre y la
 * facción en `CardPanel`.
 */
export function RulesPanel({ card, onChange }: Props) {
  const t = useT()
  const { language } = useLanguage()
  const library = useIconLibrary()

  return (
    <>
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

        <ContentEditor box="play" />
      </Section>

      <Section title={t.rulesPanel.reveal} hint={t.rulesPanel.contentHint}>
        <ContentEditor box="reveal" />
      </Section>

      <ContentPalette />
    </>
  )
}
