import { ICON_IDS, ICONS, type IconId } from '../assets/icons'
import { FACTION_IDS, FACTIONS, type Card, type Faction } from '../model/card'
import { Choice, Field, Section, Select, TextInput, Toggle } from './controls'

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
            ...FACTION_IDS.map((id) => ({ value: id, label: FACTIONS[id] })),
          ]}
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
