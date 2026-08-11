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
import { Field, MultiChoice, NumberField, Section, Select, TextInput, Toggle } from './controls'

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

// Cubren el rango en el que cae la gran mayoría de las cartas reales; lo que
// quede afuera se escribe a mano en el campo de al lado.
const COST_QUICK_PICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const BENEFIT_AMOUNT_QUICK_PICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

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
      <Section
        title={t.cardPanel.name}
        action={
          <Toggle
            label={t.cardPanel.startingCard}
            checked={card.starting}
            onChange={(starting) => onChange({ starting })}
          />
        }
      >
        <TextInput
          value={card.title}
          placeholder={t.cardPanel.namePlaceholder}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </Section>

      <Section title={t.cardPanel.faction} hint={t.cardPanel.factionHint}>
        <MultiChoice<Faction>
          values={card.factions}
          onChange={(factions) => onChange({ factions })}
          columns={4}
          iconsOnly
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
              <NumberField
                value={card.cost}
                options={COST_QUICK_PICKS}
                otherLabel={t.cardPanel.otherValue}
                decreaseLabel={t.contentEditor.decrease(t.cardPanel.persuasion)}
                increaseLabel={t.contentEditor.increase(t.cardPanel.persuasion)}
                onChange={(cost) => onChange({ cost })}
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
                <NumberField
                  value={card.purchaseBenefitAmount}
                  options={BENEFIT_AMOUNT_QUICK_PICKS}
                  otherLabel={t.cardPanel.otherValue}
                  decreaseLabel={t.contentEditor.decrease(t.cardPanel.amount)}
                  increaseLabel={t.contentEditor.increase(t.cardPanel.amount)}
                  onChange={(purchaseBenefitAmount) => onChange({ purchaseBenefitAmount })}
                />
              </Field>
            )}
          </>
        )}
      </Section>
    </>
  )
}
