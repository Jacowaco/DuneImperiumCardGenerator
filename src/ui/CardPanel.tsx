import { useState } from 'react'
import { AGENT_BADGE_URLS } from '../assets/icons/agents'
import { useT } from '../i18n/strings'
import { FACTION_COLORS, FACTION_IDS, FACTIONS, type AnyFactionId, type Card } from '../model/card'
import { isCustomFactionId } from '../model/customFaction'
import { useFactionLibrary } from '../model/factionLibrary'
import { groupIconIds, useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { Field, MultiChoice, NumberField, Section, TextInput, Toggle } from './controls'
import { ChevronDownIcon } from './icons'
import { Grid } from './ContentPalette'

/** Ninguna banda tiene arte para una posición 5: no hay dónde apilarla. */
const MAX_FACTIONS = 4

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
  const factionLibrary = useFactionLibrary()
  const benefit = card.purchaseBenefit ? library[card.purchaseBenefit] : undefined
  const [picking, setPicking] = useState(false)
  const { custom, core, ix, immortality, influence } = groupIconIds(library)
  const customFactionIds = (Object.keys(factionLibrary) as AnyFactionId[]).filter(isCustomFactionId)

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
        <MultiChoice<AnyFactionId>
          values={card.factions}
          onChange={(next) => {
            // No hay arte para una quinta banda: un click de más que agregaría
            // se ignora en silencio, en vez de dejarlo entrar y romper el render.
            if (next.length > card.factions.length && next.length > MAX_FACTIONS) return
            onChange({ factions: next })
          }}
          columns={4}
          iconsOnly
          options={[
            /*
              Las built-in van con su placa negra y no el emblema pelado: el
              botón está pintado del color de la facción y el emblema solo se
              pierde ahí —medidos, los cuatro quedan a menos de 1,1 de
              contraste contra su propio color—. El negro lo despega de
              cualquier color que tenga atrás.
            */
            ...FACTION_IDS.map((id) => ({
              value: id as AnyFactionId,
              label: pick(FACTIONS[id], language),
              color: FACTION_COLORS[id],
              icon: AGENT_BADGE_URLS[id],
            })),
            /*
              Las propias van con el mismo tratamiento: el color que eligió
              el usuario pinta el botón, y el emblema se dibuja sobre una
              placa negra generada (`factionArt.ts`) en vez de la del PSD —
              mientras esa placa todavía se está calentando, cae al emblema
              crudo, mejor que un botón vacío.
            */
            ...customFactionIds.map((id) => ({
              value: id,
              label: factionLibrary[id].label,
              color: factionLibrary[id].color,
              icon: factionLibrary[id].badge ?? factionLibrary[id].emblem,
            })),
          ]}
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
              <button
                type="button"
                onClick={() => setPicking(!picking)}
                className="flex w-full items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none hover:border-sand-500"
              >
                {benefit ? (
                  <img src={benefit.url} alt="" className="size-6 shrink-0 object-contain" />
                ) : null}
                <span className={`min-w-0 flex-1 truncate text-left ${benefit ? '' : 'text-zinc-400'}`}>
                  {benefit
                    ? benefit.custom
                      ? t.cardPanel.custom(benefit.label)
                      : benefit.label
                    : t.cardPanel.none}
                </span>
                <span className="shrink-0 text-zinc-500">
                  <ChevronDownIcon />
                </span>
              </button>
            </Field>

            {picking && (
              <div className="flex flex-col gap-2 rounded-md bg-zinc-900 p-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ purchaseBenefit: null })
                    setPicking(false)
                  }}
                  className={`rounded px-2 py-1.5 text-left text-xs transition-colors ${
                    card.purchaseBenefit === null
                      ? 'bg-sand-500 font-medium text-zinc-950'
                      : 'text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {t.cardPanel.none}
                </button>

                {custom.length > 0 && (
                  <>
                    <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                      {t.contentEditor.custom}
                    </p>
                    <Grid
                      ids={custom}
                      library={library}
                      onPick={(icon) => {
                        onChange({ purchaseBenefit: icon })
                        setPicking(false)
                      }}
                    />
                  </>
                )}

                <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                  {t.contentEditor.core}
                </p>
                <Grid
                  ids={core}
                  library={library}
                  onPick={(icon) => {
                    onChange({ purchaseBenefit: icon })
                    setPicking(false)
                  }}
                />

                {ix.length > 0 && (
                  <>
                    <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                      Rise of Ix
                    </p>
                    <Grid
                      ids={ix}
                      library={library}
                      onPick={(icon) => {
                        onChange({ purchaseBenefit: icon })
                        setPicking(false)
                      }}
                    />
                  </>
                )}

                {immortality.length > 0 && (
                  <>
                    <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                      Immortality
                    </p>
                    <Grid
                      ids={immortality}
                      library={library}
                      onPick={(icon) => {
                        onChange({ purchaseBenefit: icon })
                        setPicking(false)
                      }}
                    />
                  </>
                )}

                {influence.length > 0 && (
                  <>
                    <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                      {t.contentEditor.influence}
                    </p>
                    <Grid
                      ids={influence}
                      library={library}
                      onPick={(icon) => {
                        onChange({ purchaseBenefit: icon })
                        setPicking(false)
                      }}
                    />
                  </>
                )}
              </div>
            )}

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
