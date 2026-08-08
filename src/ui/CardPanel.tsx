import { ICON_IDS, ICONS, type IconId } from '../assets/icons'
import {
  AGENT_ICON_IDS,
  AGENT_ICON_STYLE_IDS,
  AGENT_ICON_STYLES,
  AGENT_ICONS,
  type AgentIconStyle,
} from '../assets/icons/agents'
import {
  FACTION_COLORS,
  FACTION_IDS,
  FACTIONS,
  PLAY_ROWS,
  type Card,
  type Faction,
  type PlayRows,
} from '../model/card'
import { Choice, Field, MultiChoice, Section, Select, TextInput, Toggle } from './controls'

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

export function CardPanel({ card, onChange }: Props) {
  return (
    <>
      <Section title="Carta">
        <Field label="Nombre">
          <TextInput
            value={card.title}
            placeholder="Duncan Idaho"
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </Field>

        <Toggle
          label="Carta de mazo inicial"
          checked={card.starting}
          onChange={(starting) => onChange({ starting })}
        />
      </Section>

      <Section title="Facción">
        <Choice<Faction>
          value={card.faction}
          onChange={(faction) => onChange({ faction })}
          options={[
            { value: null, label: 'Ninguna' },
            ...FACTION_IDS.map((id) => ({
              value: id,
              label: FACTIONS[id],
              color: FACTION_COLORS[id],
            })),
          ]}
        />
      </Section>

      <Section title="Iconos de agente">
        <MultiChoice
          values={card.agentIcons}
          onChange={(agentIcons) => onChange({ agentIcons })}
          options={AGENT_ICON_IDS.map((id) => ({ value: id, label: AGENT_ICONS[id] }))}
        />
        <Field label="Estilo">
          <Choice<AgentIconStyle>
            value={card.agentIconStyle}
            onChange={(style) => onChange({ agentIconStyle: style ?? 'locations' })}
            options={AGENT_ICON_STYLE_IDS.map((id) => ({
              value: id,
              label: AGENT_ICON_STYLES[id],
            }))}
          />
        </Field>
      </Section>

      <Section title="Cajas de contenido">
        <Field label="Turno de agente">
          <Choice
            value={String(card.playRows)}
            columns={4}
            onChange={(rows) => onChange({ playRows: Number(rows ?? 0) as PlayRows })}
            options={PLAY_ROWS.map((rows) => ({
              value: String(rows),
              label: rows === 0 ? 'Sin caja' : `${rows} fila${rows > 1 ? 's' : ''}`,
            }))}
          />
        </Field>

        <Toggle
          label="Silueta del agente"
          checked={card.agentSilhouette}
          onChange={(agentSilhouette) => onChange({ agentSilhouette })}
        />
        <Toggle
          label="Banda de revelación"
          checked={card.revealBox}
          onChange={(revealBox) => onChange({ revealBox })}
        />
      </Section>

      <Section title="Costo de compra">
        <Toggle
          label="Tiene costo"
          checked={card.cost !== null}
          onChange={(has) => onChange({ cost: has ? 2 : null, purchaseBenefit: null })}
        />

        {card.cost !== null && (
          <>
            <Field label="Persuasión">
              <TextInput
                type="number"
                min={0}
                max={99}
                value={card.cost}
                onChange={(event) =>
                  onChange({ cost: Math.max(0, Math.min(99, Number(event.target.value))) })
                }
              />
            </Field>

            <Field label="Beneficio de compra">
              <Select
                value={card.purchaseBenefit ?? ''}
                onChange={(event) =>
                  onChange({ purchaseBenefit: (event.target.value || null) as IconId | null })
                }
              >
                <option value="">Ninguno</option>
                {ICON_IDS.map((id) => (
                  <option key={id} value={id}>
                    {ICONS[id].label}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}
      </Section>
    </>
  )
}
