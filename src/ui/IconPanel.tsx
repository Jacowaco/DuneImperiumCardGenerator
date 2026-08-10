import { useRef } from 'react'

import { describeError, useT } from '../i18n/strings'
import { cardIconIds, type Card } from '../model/card'
import { DEFAULT_CUSTOM_ICON_NUMBER_COLOR, loadCustomIcon, type CustomIcon } from '../model/customIcon'
import { customIconEntry } from '../model/iconLibrary'
import { useLanguage } from '../model/language'
import { CONTENT } from '../render/constants'
import { Action, Hint, Section } from './controls'
import { MinusIcon, PlusIcon, UploadIcon } from './icons'

/**
 * Cuánto se achica la carta para la previsualización: el icono nominal del
 * juego (99 px de carta) entra en 30 px de pantalla. Es **un solo factor para
 * todos**, como en la carta: si cada icono se dibujara al tamaño que le entra
 * en su ficha, la vista mentiría justo sobre lo único que hay que decidir acá.
 */
const PREVIEW_SCALE = 40 / CONTENT.nominalIconHeight

type Props = {
  icons: CustomIcon[]
  /** Todas las cartas del mazo, para saber cuáles usan cada icono. */
  cards: Card[]
  onChange: (icons: CustomIcon[]) => void
  onError: (message: string) => void
}

/**
 * Iconos propios: los que sube el usuario para escribir reglas que el juego no
 * trae.
 *
 * **Son del usuario, no del mazo.** Es una sola lista, guardada en el navegador
 * (`iconStore.ts`) y disponible en todos los mazos: no hay que traerlos ni
 * copiarlos de uno a otro. Que el archivo del mazo se lleve adentro los que sus
 * cartas usan es cosa de `packIcons` al guardar, y acá no se ve.
 *
 * Al subirlos se recortan al contenido para que se comporten como los del PSD
 * (`customIcon.ts`).
 */
export function IconPanel({ icons, cards, onChange, onError }: Props) {
  const t = useT()
  const { language } = useLanguage()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const usage = countUsage(cards)

  const add = async (files: FileList | null) => {
    if (!files?.length) return

    // Los que fallan no frenan a los demás: si de cinco PNG uno está vacío,
    // entran los otros cuatro y el aviso nombra al que quedó afuera.
    const results = await Promise.allSettled([...files].map(loadCustomIcon))
    const loaded = results
      .filter((result): result is PromiseFulfilledResult<CustomIcon> => result.status === 'fulfilled')
      .map((result) => result.value)

    if (loaded.length) onChange([...icons, ...loaded])

    const failed = results.find((result) => result.status === 'rejected')
    if (failed)
      onError(
        describeError((failed as PromiseRejectedResult).reason, language, t.errors.iconFailed),
      )
  }

  const update = (id: string, patch: Partial<CustomIcon>) =>
    onChange(icons.map((icon) => (icon.id === id ? { ...icon, ...patch } : icon)))

  const remove = (icon: CustomIcon) => {
    const used = usage[icon.id] ?? 0
    // Borrarlo es para siempre y en todos los mazos, así que se avisa cuántas
    // cartas del que está abierto se quedan sin él. De los otros no se puede
    // saber sin abrirlos.
    if (used > 0 && !confirm(t.iconPanel.confirmRemove(icon.label, used))) return

    onChange(icons.filter((item) => item.id !== icon.id))
  }

  return (
    <Section>
      {icons.length === 0 && <Hint>{t.iconPanel.emptyHint}</Hint>}

      {/*
        En grilla y no en lista: lo que se busca acá es *el dibujo*, y una fila
        de 36 px lo deja del tamaño de una viñeta.

        Las fichas se acomodan solas con un ancho mínimo en vez de un número
        fijo de columnas: el icono se dibuja a escala de carta —30 px— así que
        una ficha ancha es todo aire alrededor. Con `auto-fill` entran las que
        entren y ninguna se estira de más.
      */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
        {icons.map((icon) => (
          <div key={icon.id} className="relative flex flex-col gap-1.5 rounded-md bg-zinc-900/60 p-2">
            {/*
              A escala de carta y no al tamaño que dé la ficha: así el % se ve
              como lo que significa. Todos se dibujan con el mismo factor, como
              en la carta, y por eso uno al 50% se ve la mitad que otro al 100%.

              El fondo es el de la caja del turno de agente, no un damero de
              transparencia: la pregunta que se contesta acá es cómo va a
              quedar en la carta, y contra el beige claro se ve lo que contra
              el damero no —un icono claro que se pierde, un borde blanco que
              quedó del recorte—.
            */}
            <div
              style={{ backgroundColor: CONTENT.play.surface }}
              // El alto da justo para el máximo (200%): así ninguna ficha
              // recorta ni miente sobre el tamaño, que es lo que se viene a
              // mirar acá.
              className="flex h-20 items-center justify-center rounded px-2"
            >
              <img
                src={icon.url}
                alt=""
                style={{ height: customIconEntry(icon).height * PREVIEW_SCALE }}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <input
              value={icon.label}
              aria-label={t.iconPanel.nameLabel(icon.label)}
              onChange={(event) => update(icon.id, { label: event.target.value })}
              className="w-full min-w-0 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
            />

            {/* El alto no se puede deducir de la imagen: un icono recortado no
                dice qué tan grande quiere verse al lado del texto.

                El "%" va escrito al lado del campo y no sólo en el tooltip: un
                número suelto no dice de qué es. */}
            <div
              title={t.iconPanel.heightTitle}
              className="flex min-w-0 items-center gap-1 text-xs text-zinc-500"
            >
              <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded border border-zinc-700 bg-zinc-950">
                <button
                  type="button"
                  aria-label={t.iconPanel.decreaseHeightLabel(icon.label)}
                  disabled={icon.size <= 20}
                  onClick={() => update(icon.id, { size: Math.max(20, icon.size - 5) })}
                  className="flex size-5 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
                >
                  <MinusIcon />
                </button>
                <input
                  type="number"
                  min={20}
                  max={200}
                  step={5}
                  aria-label={t.iconPanel.heightLabel(icon.label)}
                  value={icon.size}
                  onChange={(event) =>
                    update(icon.id, {
                      size: Math.max(20, Math.min(200, Number(event.target.value) || 100)),
                    })
                  }
                  className="w-full min-w-0 bg-transparent px-0.5 py-1 text-center text-xs text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label={t.iconPanel.increaseHeightLabel(icon.label)}
                  disabled={icon.size >= 200}
                  onClick={() => update(icon.id, { size: Math.min(200, icon.size + 5) })}
                  className="flex size-5 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
                >
                  <PlusIcon />
                </button>
              </div>
              %
            </div>

            {/* Si el icono ya representa una cantidad fija (un "1" dibujado
                adentro, por ejemplo) no hace falta el número encima; si no, el
                usuario lo prende acá. El color es aparte porque el fondo de un
                icono propio puede ser cualquier cosa, a diferencia de los del
                PSD donde ya se eligió uno que contrasta. */}
            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={icon.showNumber ?? false}
                aria-label={t.iconPanel.showNumberLabel(icon.label)}
                onChange={(event) =>
                  update(icon.id, {
                    showNumber: event.target.checked,
                    numberColor: icon.numberColor ?? DEFAULT_CUSTOM_ICON_NUMBER_COLOR,
                  })
                }
                className="size-3.5 shrink-0 accent-sand-500"
              />
              {t.iconPanel.showNumberText}
              {icon.showNumber && (
                <input
                  type="color"
                  value={icon.numberColor ?? DEFAULT_CUSTOM_ICON_NUMBER_COLOR}
                  title={t.iconPanel.numberColorTitle}
                  aria-label={t.iconPanel.numberColorLabel(icon.label)}
                  onChange={(event) => update(icon.id, { numberColor: event.target.value })}
                  className="ml-auto size-5 shrink-0 cursor-pointer rounded border border-zinc-700 bg-zinc-950 p-0"
                />
              )}
            </label>

            {/* En la esquina y no en la fila de abajo: con la ficha angosta, el
                botón le comía el ancho al campo del tamaño. */}
            <div className="absolute top-1 right-1">
              <Action label={t.iconPanel.removeLabel(icon.label)} onClick={() => remove(icon)}>
                ×
              </Action>
            </div>
          </div>
        ))}

        {/* Subir es una ficha más y va al final de la grilla, donde termina lo
            que ya tenés: es el lugar donde va a aparecer el que subas. */}
        <button
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-700 p-2 text-xs font-medium text-zinc-400 transition-colors hover:border-sand-500 hover:bg-zinc-900/60 hover:text-sand-100"
        >
          <UploadIcon />
          {t.iconPanel.upload}
        </button>
      </div>

      <Hint>{t.iconPanel.hint}</Hint>

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

/** En cuántas cartas aparece cada icono propio, contando una vez por carta. */
function countUsage(cards: Card[]): Record<string, number> {
  const usage: Record<string, number> = {}

  for (const card of cards) {
    for (const id of cardIconIds(card)) usage[id] = (usage[id] ?? 0) + 1
  }

  return usage
}
