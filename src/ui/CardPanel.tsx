import { AGENT_BADGE_URLS } from '../assets/icons/agents'
import { useT } from '../i18n/strings'
import {
  FACTION_COLORS,
  FACTION_IDS,
  FACTIONS,
  type AnyIconId,
  type Card,
  type Faction,
} from '../model/card'
import { useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { Field, Hint, MultiChoice, Section, Select, TextInput, Toggle } from './controls'

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

/**
 * Los datos de la carta: nombre, facción y qué cuesta comprarla. Son las tres
 * cosas que se dibujan **arriba** —placa del nombre, banda de facción y rombo
 * del costo—, igual que `RulesPanel` es todo lo de las cajas de abajo.
 *
 * La pestaña se llama "Encabezado" y no "Carta" porque en un editor de cartas
 * todo es la carta: el nombre no distinguía nada, y encima repetía el de la
 * sección de adentro.
 */
export function CardPanel({ card, onChange }: Props) {
  const t = useT()
  const { language } = useLanguage()
  const library = useIconLibrary()
  const benefit = card.purchaseBenefit ? library[card.purchaseBenefit] : undefined

  return (
    <>
      {/* Sin título: sería "Nombre" arriba de un campo que ya se llama así, y
          el interruptor de abajo se explica solo. */}
      <Section>
        <Field label={t.cardPanel.name}>
          <TextInput
            value={card.title}
            placeholder={t.cardPanel.namePlaceholder}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </Field>

        <Toggle
          label={t.cardPanel.startingCard}
          checked={card.starting}
          onChange={(starting) => onChange({ starting })}
        />
      </Section>

      <Section title={t.cardPanel.faction}>
        <MultiChoice<Faction>
          values={card.factions}
          onChange={(factions) => onChange({ factions })}
          /*
            El emblema va con su placa negra y no pelado: el botón está pintado
            del color de la facción y el emblema solo se pierde ahí —medidos,
            los cuatro quedan a menos de 1,1 de contraste contra su propio
            color, porque el color del botón sale de la banda de esa misma
            facción—. El negro lo despega de cualquier color que tenga atrás.
          */
          options={FACTION_IDS.map((id) => ({
            value: id,
            label: pick(FACTIONS[id], language),
            color: FACTION_COLORS[id],
            icon: AGENT_BADGE_URLS[id],
          }))}
        />
        <Hint>{t.cardPanel.factionHint}</Hint>
      </Section>

      <Section title={t.cardPanel.cost}>
        <Toggle
          label={t.cardPanel.hasCost}
          checked={card.cost !== null}
          onChange={(has) => onChange({ cost: has ? 2 : null, purchaseBenefit: null })}
        />

        {card.cost !== null && (
          <>
            <Field label={t.cardPanel.persuasion}>
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

            <Field label={t.cardPanel.purchaseBenefit}>
              <Select
                value={card.purchaseBenefit ?? ''}
                onChange={(event) =>
                  onChange({ purchaseBenefit: (event.target.value || null) as AnyIconId | null })
                }
              >
                <option value="">{t.cardPanel.none}</option>
                {Object.entries(library).map(([id, icon]) => (
                  <option key={id} value={id}>
                    {icon.custom ? t.cardPanel.custom(icon.label) : icon.label}
                  </option>
                ))}
              </Select>
            </Field>

            {benefit?.numberColor && (
              <Field label={t.cardPanel.amount}>
                <TextInput
                  type="number"
                  min={0}
                  max={99}
                  value={card.purchaseBenefitAmount}
                  onChange={(event) =>
                    onChange({
                      purchaseBenefitAmount: Math.max(
                        0,
                        Math.min(99, Number(event.target.value)),
                      ),
                    })
                  }
                />
              </Field>
            )}
          </>
        )}
      </Section>
    </>
  )
}
