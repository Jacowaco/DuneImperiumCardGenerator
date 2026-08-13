import { useEffect, useRef, useState } from 'react'
import {
  AGENT_BADGE_URLS,
  AGENT_ICON_IDS,
  AGENT_ICON_STYLES,
  AGENT_ICONS,
} from '../assets/icons/agents'
import { useT } from '../i18n/strings'
import {
  clampCopies,
  FACTION_COLORS,
  FACTION_IDS,
  FACTIONS,
  type AnyAgentIcon,
  type AnyFactionId,
  type Card,
} from '../model/card'
import { isCustomFactionId } from '../model/customFaction'
import { useFactionLibrary } from '../model/factionLibrary'
import { groupIconIds, useIconLibrary } from '../model/iconLibrary'
import { pick, useLanguage } from '../model/language'
import { Field, MultiChoice, NumberField, Section, TextInput, Toggle } from './controls'
import { ChevronDownIcon } from './icons'
import { Grid } from './ContentPalette'

/** Ninguna banda tiene arte para una posición 5: no hay dónde apilarla. */
const MAX_FACTIONS = 4

/** La columna tiene exactamente esta cantidad de ranuras — ver `AgentIcons.tsx`. */
const MAX_AGENT_ICONS = AGENT_ICON_IDS.length

type Props = {
  card: Card
  onChange: (patch: Partial<Card>) => void
}

// Cubren el rango en el que cae la gran mayoría de las cartas reales; lo que
// quede afuera se escribe a mano en el campo de al lado.
const COST_QUICK_PICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const BENEFIT_AMOUNT_QUICK_PICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
/** Arranca en 1: una carta que el mazo no lleva se borra, no se pone en cero. */
const COPIES_QUICK_PICKS = [1, 2, 3, 4, 5, 6]

/**
 * Quién es la carta: nombre, facción, a qué espacios puede mandar el agente y
 * qué cuesta comprarla. `RulesPanel` se quedó con lo que dicen las dos cajas
 * de abajo.
 *
 * Los iconos de agente son de la identidad y no de las reglas: dicen a dónde
 * puede ir esa carta, no qué pasa cuando se juega. Van pegados a la facción
 * —y no al final— porque se eligen de la mano: los siete emblemas son los
 * mismos de las facciones, y una carta de una facción suele mandar agentes a
 * los espacios de esa misma facción.
 *
 * La pestaña se llama "Identidad" y no "Carta" porque en un editor de cartas
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

  /*
    El beneficio de compra es el último campo de la última sección, así que la
    grilla se abre abajo de todo: medida, quedaba enteramente fuera del alto
    visible del panel —cero píxeles a la vista, tanto en 1440 × 800 como en
    1024 × 640—, y el clic parecía no hacer nada.

    La paleta de las cajas no tiene el problema porque está `sticky` al pie; esta
    es inline, así que hay que traerla a la vista a mano. `block: 'nearest'`
    scrollea lo mínimo, y sólo cuando se abre — al cerrarse no se mueve nada.
  */
  const pickerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (picking) pickerRef.current?.scrollIntoView({ block: 'nearest' })
  }, [picking])

  return (
    <>
      <Section
        title={t.cardPanel.name}
        action={
          <Toggle
            label={t.cardPanel.startingCard}
            hint={t.cardPanel.startingCardHint}
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

      <Section
        title={t.cardPanel.agentIcons}
        action={
          <Toggle
            label={pick(AGENT_ICON_STYLES.infiltrate, language)}
            hint={t.cardPanel.infiltrateHint}
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
              <div ref={pickerRef} className="flex flex-col gap-2 rounded-md bg-zinc-900 p-2">
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

      {/*
        Cuántos ejemplares de esta carta lleva el mazo. Es una propiedad de la
        carta —viaja en el archivo y se edita con la carta abierta, como todo
        lo de este panel— y no una opción de impresión: que un mazo lleve tres
        Espadachines es un hecho del mazo, no de cómo se lo imprime hoy.

        Lo único que la mira es la hoja de impresión. El zip del export en lote
        saca un PNG por carta: el mismo archivo repetido tres veces no agrega
        nada.
      */}
      <Section title={t.cardPanel.copies} hint={t.cardPanel.copiesHint}>
        <NumberField
          value={card.copies}
          options={COPIES_QUICK_PICKS}
          otherLabel={t.cardPanel.otherValue}
          decreaseLabel={t.contentEditor.decrease(t.cardPanel.copies)}
          increaseLabel={t.contentEditor.increase(t.cardPanel.copies)}
          onChange={(copies) => onChange({ copies: clampCopies(copies) })}
        />
      </Section>
    </>
  )
}
