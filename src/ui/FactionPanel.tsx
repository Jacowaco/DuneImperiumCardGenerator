import { useRef } from 'react'

import { describeError, useT } from '../i18n/strings'
import { cardIconIds, type AnyFactionId, type Card } from '../model/card'
import {
  isCustomFactionId,
  loadCustomFactionEmblem,
  type CustomFaction,
} from '../model/customFaction'
import { factionIdFromInfluenceIconId } from '../model/factionArt'
import { useLanguage } from '../model/language'
import { CONTENT } from '../render/constants'
import { Action, Hint, Section } from './controls'
import { UploadIcon } from './icons'

/** Misma escala que `IconPanel`: el icono nominal del juego entra en 40 px. */
const PREVIEW_HEIGHT = 40

type Props = {
  factions: CustomFaction[]
  /** Todas las cartas del mazo, para saber cuáles usan cada facción. */
  cards: Card[]
  onChange: (factions: CustomFaction[]) => void
  onError: (message: string) => void
}

/**
 * Facciones propias: las que arma el usuario para mazos con facciones que el
 * juego no trae.
 *
 * **Son del usuario, no del mazo.** Mismo patrón que `IconPanel`: una sola
 * lista, guardada en el navegador (`factionStore.ts`) y disponible en todos
 * los mazos. Que el archivo del mazo se lleve adentro las que sus cartas usan
 * es cosa de `packFactions` al guardar, y acá no se ve.
 */
export function FactionPanel({ factions, cards, onChange, onError }: Props) {
  const t = useT()
  const { language } = useLanguage()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const usage = countUsage(cards)

  const add = async (files: FileList | null) => {
    if (!files?.length) return

    const results = await Promise.allSettled([...files].map(loadCustomFactionEmblem))
    const loaded = results
      .filter((result): result is PromiseFulfilledResult<CustomFaction> => result.status === 'fulfilled')
      .map((result) => result.value)

    if (loaded.length) onChange([...factions, ...loaded])

    const failed = results.find((result) => result.status === 'rejected')
    if (failed)
      onError(
        describeError((failed as PromiseRejectedResult).reason, language, t.errors.iconFailed),
      )
  }

  const update = (id: string, patch: Partial<CustomFaction>) =>
    onChange(factions.map((faction) => (faction.id === id ? { ...faction, ...patch } : faction)))

  const remove = (faction: CustomFaction) => {
    const used = usage[faction.id] ?? 0
    if (used > 0 && !confirm(t.factionPanel.confirmRemove(faction.label, used))) return

    onChange(factions.filter((item) => item.id !== faction.id))
  }

  return (
    <Section>
      {factions.length === 0 && <Hint>{t.factionPanel.emptyHint}</Hint>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
        {factions.map((faction) => (
          <div
            key={faction.id}
            className="relative flex flex-col gap-1.5 rounded-md bg-zinc-900/60 p-2"
          >
            <div
              style={{ backgroundColor: CONTENT.play.surface }}
              className="flex h-20 items-center justify-center rounded px-2"
            >
              <img
                src={faction.emblem}
                alt=""
                style={{ height: PREVIEW_HEIGHT }}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <input
              value={faction.label}
              aria-label={t.factionPanel.nameLabel(faction.label)}
              onChange={(event) => update(faction.id, { label: event.target.value })}
              className="w-full min-w-0 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
            />

            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              {t.factionPanel.colorLabel(faction.label)}
              <input
                type="color"
                value={faction.color}
                title={t.factionPanel.colorTitle}
                aria-label={t.factionPanel.colorLabel(faction.label)}
                onChange={(event) => update(faction.id, { color: event.target.value })}
                className="ml-auto size-5 shrink-0 cursor-pointer rounded border border-zinc-700 bg-zinc-950 p-0"
              />
            </label>

            <div className="absolute top-1 right-1">
              <Action label={t.factionPanel.removeLabel(faction.label)} onClick={() => remove(faction)}>
                ×
              </Action>
            </div>
          </div>
        ))}

        <button
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-700 p-2 text-xs font-medium text-zinc-400 transition-colors hover:border-sand-500 hover:bg-zinc-900/60 hover:text-sand-100"
        >
          <UploadIcon />
          {t.factionPanel.upload}
        </button>
      </div>

      <Hint>{t.factionPanel.hint}</Hint>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          void add(event.target.files)
          event.target.value = ''
        }}
      />
    </Section>
  )
}

/**
 * En cuántas cartas aparece cada facción propia, contando una vez por carta —
 * directo (`card.factions`) o sólo a través de uno de sus rombos generados
 * en una caja de contenido.
 */
function countUsage(cards: Card[]): Record<string, number> {
  const usage: Record<string, number> = {}

  for (const card of cards) {
    const used = new Set<AnyFactionId>()
    for (const id of card.factions) if (isCustomFactionId(id)) used.add(id)
    for (const id of card.agentIcons) if (isCustomFactionId(id)) used.add(id)
    for (const id of cardIconIds(card)) {
      const factionId = factionIdFromInfluenceIconId(id)
      if (factionId) used.add(factionId)
    }
    for (const id of used) usage[id] = (usage[id] ?? 0) + 1
  }

  return usage
}
