import { useEffect, useRef, useState, type ReactNode } from 'react'

import { describeError, useT } from '../i18n/strings'
import { cardIconIds, type AnyFactionId, type Card } from '../model/card'
import {
  isCustomFactionId,
  loadCustomFactionEmblem,
  type CustomFaction,
} from '../model/customFaction'
import { factionIdFromInfluenceIconId, useTintedFactionBand } from '../model/factionArt'
import { useLanguage } from '../model/language'
import { CONTENT, FACTION_BAND } from '../render/constants'
import { useCardImage } from '../render/imageCache'
import { fontString, layoutSmallCaps } from '../render/text'
import { useFontsReady } from '../render/useFontsReady'
import { Action, Button, Hint, Section } from './controls'
import { CloseIcon, DownloadIcon, FolderIcon, SaveIcon, UploadIcon } from './icons'

/** El emblema alcanza para reconocer la facción; el que manda es el color. */
const PREVIEW_HEIGHT = 32

/**
 * La banda de la primera posición, que es la más ancha y la que se ve en una
 * carta de una sola facción. El recorte sale de las medidas del PNG: la banda
 * ocupa x 25–375, y 90–133 del lienzo de 750 × 1039.
 */
const BAND = {
  left: 25,
  width: FACTION_BAND.widths[1],
  top: FACTION_BAND.top,
  height: FACTION_BAND.height,
}

type Props = {
  /** Las del mazo abierto: las que el selector ofrece y la carta dibuja. */
  factions: CustomFaction[]
  /** Las de este navegador, para copiar de un mazo a otro. */
  library: CustomFaction[]
  /** Todas las cartas del mazo, para saber cuáles usan cada facción. */
  cards: Card[]
  onChange: (factions: CustomFaction[]) => void
  onLibraryChange: (factions: CustomFaction[]) => void
  onCopyToDeck: (faction: CustomFaction) => void
  onCopyToLibrary: (faction: CustomFaction) => void
  /** La biblioteca entera a un archivo, y de vuelta. Ver `libraryFile.ts`. */
  onExportLibrary: () => void
  onImportLibrary: () => void
  onError: (message: string) => void
}

/**
 * Facciones propias: las que arma el usuario para mazos con facciones que el
 * juego no trae.
 *
 * Dos listas y dos secciones, igual que `IconPanel` y por lo mismo: **en este
 * mazo** es lo que se dibuja y viaja en el archivo, **mi biblioteca** es de
 * este navegador y sólo sirve para copiar de un mazo a otro.
 */
export function FactionPanel({
  factions,
  library,
  cards,
  onChange,
  onLibraryChange,
  onCopyToDeck,
  onCopyToLibrary,
  onExportLibrary,
  onImportLibrary,
  onError,
}: Props) {
  const t = useT()
  const { language } = useLanguage()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const usage = countUsage(cards)
  const inDeck = new Set(factions.map((faction) => faction.id))

  const add = async (files: FileList | null) => {
    if (!files?.length) return

    const results = await Promise.allSettled([...files].map(loadCustomFactionEmblem))
    const loaded = results
      .filter((result): result is PromiseFulfilledResult<CustomFaction> => result.status === 'fulfilled')
      .map((result) => result.value)

    // Igual que un icono propio: subirla ya es decir que te importa, así que
    // además de entrar al mazo queda guardada en la biblioteca.
    if (loaded.length) {
      onChange([...factions, ...loaded])
      for (const faction of loaded) onCopyToLibrary(faction)
    }

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

  const removeFromLibrary = (faction: CustomFaction) => {
    if (!confirm(t.factionPanel.confirmRemoveFromLibrary(faction.label))) return
    onLibraryChange(library.filter((item) => item.id !== faction.id))
  }

  return (
    <>
      <Section title={t.factionPanel.deckTitle} hint={t.factionPanel.deckHint}>
        {factions.length === 0 && <Hint>{t.factionPanel.emptyHint}</Hint>}

        {/*
          Un poco más anchas que la grilla de `IconPanel`, porque acá lo que se
          decide es el color y un cuadradito de 20 px no deja verlo — pero no
          más: el ancho que pide la ficha es el de la banda, que se lee igual
          chica, así que entran tres por fila en el diálogo.
        */}
        <Grid>
          {factions.map((faction) => (
            <FactionTile
              key={faction.id}
              faction={faction}
              note={
                usage[faction.id]
                  ? t.factionPanel.usedIn(usage[faction.id])
                  : t.factionPanel.unused
              }
              action={
                <Action
                  label={t.factionPanel.toLibraryLabel(faction.label)}
                  onClick={() => onCopyToLibrary(faction)}
                >
                  <SaveIcon />
                </Action>
              }
              onUpdate={(patch) => update(faction.id, patch)}
              removeLabel={t.factionPanel.removeLabel(faction.label)}
              onRemove={() => remove(faction)}
            />
          ))}

          <button
            onClick={() => inputRef.current?.click()}
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-700 p-2 text-xs font-medium text-zinc-400 transition-colors hover:border-sand-500 hover:bg-zinc-900/60 hover:text-sand-100"
          >
            <UploadIcon />
            {t.factionPanel.upload}
          </button>
        </Grid>
      </Section>

      <Section title={t.factionPanel.libraryTitle} hint={t.factionPanel.libraryHint}>
        {library.length === 0 && <Hint>{t.factionPanel.emptyLibraryHint}</Hint>}

        <Grid>
          {library.map((faction) => (
            <FactionTile
              key={faction.id}
              faction={faction}
              note={inDeck.has(faction.id) ? t.factionPanel.alreadyInDeck : ''}
              action={
                <Action
                  label={t.factionPanel.toDeckLabel(faction.label)}
                  disabled={inDeck.has(faction.id)}
                  onClick={() => onCopyToDeck(faction)}
                >
                  <DownloadIcon />
                </Action>
              }
              removeLabel={t.factionPanel.forgetLabel(faction.label)}
              onRemove={() => removeFromLibrary(faction)}
            />
          ))}
        </Grid>

        {/* Al pie de la biblioteca y no arriba: son de todo lo que hay en la
            sección, y se usan mucho menos que copiar de un lado al otro. */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onExportLibrary}
            disabled={library.length === 0}
            title={t.libraryFile.exportTitle}
            className="px-2 text-xs"
          >
            <SaveIcon />
            {t.libraryFile.export}
          </Button>
          <Button onClick={onImportLibrary} title={t.libraryFile.importTitle} className="px-2 text-xs">
            <FolderIcon />
            {t.libraryFile.import}
          </Button>
        </div>
      </Section>

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
    </>
  )
}

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-2">{children}</div>
)

/**
 * Una facción: cómo se ve y, si es la del mazo, las dos cosas que se editan de
 * ella —el nombre y el color—. Sin `onUpdate` es la ficha de la biblioteca,
 * que se mira pero no se toca: para cambiarla, se la trae al mazo.
 *
 * Va en su propio componente porque el tinte de la banda es un hook
 * (`useTintedFactionBand`), y también porque cada ficha tiene el borrador del
 * campo hexadecimal, que es suyo y de nadie más.
 */
function FactionTile({
  faction,
  note,
  action,
  onUpdate,
  removeLabel,
  onRemove,
}: {
  faction: CustomFaction
  note: string
  action: ReactNode
  onUpdate?: (patch: Partial<CustomFaction>) => void
  /** Sacarla del mazo y sacarla de la biblioteca no son lo mismo, y la ficha
   *  es la misma: quién la usa dice qué está haciendo esa cruz. */
  removeLabel: string
  onRemove: () => void
}) {
  const t = useT()

  return (
    <div className="relative flex flex-col gap-1.5 rounded-md bg-zinc-900/60 p-2">
      {/* El emblema sobre el beige de la caja de turno, que es el fondo
          contra el que se ve en la carta —adentro de un rombo de influencia—
          y donde se nota un borde blanco que haya quedado del recorte. */}
      <div
        style={{ backgroundColor: CONTENT.play.surface }}
        className="flex h-12 items-center justify-center rounded px-2"
      >
        <img
          src={faction.emblem}
          alt=""
          style={{ height: PREVIEW_HEIGHT }}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <BandPreview color={faction.color} label={faction.label} />

      {onUpdate ? (
        <>
          <input
            value={faction.label}
            aria-label={t.factionPanel.nameLabel(faction.label)}
            onChange={(event) => onUpdate({ label: event.target.value })}
            className="w-full min-w-0 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-sand-500"
          />

          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={faction.color}
              title={t.factionPanel.colorTitle}
              aria-label={t.factionPanel.colorLabel(faction.label)}
              onChange={(event) => onUpdate({ color: event.target.value })}
              className="h-8 min-w-0 flex-1 cursor-pointer rounded border border-zinc-700 bg-zinc-950 p-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
            />
            <HexField
              value={faction.color}
              label={t.factionPanel.hexLabel(faction.label)}
              onChange={(color) => onUpdate({ color })}
            />
          </div>
        </>
      ) : (
        <p className="truncate text-xs text-zinc-300" title={faction.label}>
          {faction.label}
        </p>
      )}

      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-500">{note}</span>
        {action}
      </div>

      <div className="absolute top-1 right-1">
        <Action label={removeLabel} onClick={onRemove}>
                    <CloseIcon />
        </Action>
      </div>
    </div>
  )
}

/**
 * La banda tal como sale impresa: el mismo sprite tintado que dibuja la carta
 * (`useTintedFactionBand`) y el nombre encima con la misma tipografía y el
 * mismo acomodo que `FactionBand` — `layoutSmallCaps` con los números de
 * `FACTION_BAND`. El color no es un valor abstracto: es un degradé sobre la
 * plantilla con el nombre en versalitas, y una muestra plana no dice cómo va
 * a quedar.
 *
 * Se dibuja en canvas y no con HTML por eso mismo: acá el texto se posiciona
 * con la misma función que la carta, en las mismas coordenadas, así que la
 * vista no puede irse quedando atrás del render. El canvas mide lo que mide
 * la banda de la primera posición —la más ancha, la de una carta de una sola
 * facción— y CSS lo estira al ancho de la ficha.
 */
const PREVIEW_PIXEL_RATIO = 2

function BandPreview({ color, label }: { color: string; label: string }) {
  const tinted = useTintedFactionBand(color, 1)
  const band = useCardImage(tinted)
  const fontsReady = useFontsReady()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.setTransform(PREVIEW_PIXEL_RATIO, 0, 0, PREVIEW_PIXEL_RATIO, 0, 0)
    ctx.clearRect(0, 0, BAND.width, BAND.height)

    // Del lienzo entero de la carta sale el recorte de la banda, que es lo
    // único que se está mirando acá.
    if (band) {
      ctx.drawImage(band, BAND.left, BAND.top, BAND.width, BAND.height, 0, 0, BAND.width, BAND.height)
    }

    const { glyphs } = layoutSmallCaps(label, {
      capHeight: FACTION_BAND.text.capHeight,
      smallCapRatio: 1,
      letterSpacing: 1,
      wordSpacing: 10,
      weight: FACTION_BAND.text.weight,
      maxWidth: BAND.width - (FACTION_BAND.text.x - BAND.left) - FACTION_BAND.text.rightPadding,
    })

    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = FACTION_BAND.text.color
    const baseline = BAND.height / 2 + FACTION_BAND.text.capHeight / 2
    for (const glyph of glyphs) {
      ctx.font = fontString(glyph.size, FACTION_BAND.text.weight)
      ctx.fillText(glyph.char, FACTION_BAND.text.x - BAND.left + glyph.x, baseline)
    }
    // `fontsReady` no se usa adentro: está para volver a dibujar cuando la
    // fuente de la carta termina de cargar, porque el canvas ya escribió con
    // la de reemplazo y no se entera solo.
  }, [band, label, fontsReady])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      width={BAND.width * PREVIEW_PIXEL_RATIO}
      height={BAND.height * PREVIEW_PIXEL_RATIO}
      className="block h-auto w-full rounded"
    />
  )
}

/**
 * El color en hexadecimal, al lado de la muestra: es lo que deja copiar un
 * color de otro lado o repetir el mismo en dos facciones, que con el selector
 * del sistema es a ojo.
 *
 * Escribe sobre un borrador propio porque un hexadecimal se tipea de a un
 * carácter: mandar cada tecla al modelo pintaría la banda de negro
 * (`hexToRgb` no perdona) hasta terminar de escribirlo.
 */
function HexField({
  value,
  label,
  onChange,
}: {
  value: string
  label: string
  onChange: (color: string) => void
}) {
  const [draft, setDraft] = useState(value)

  // El color puede cambiar desde la muestra de al lado, o al deshacer.
  useEffect(() => setDraft(value), [value])

  const commit = (text: string) => {
    setDraft(text)
    const match = /^#?([0-9a-f]{6})$/i.exec(text.trim())
    if (match) onChange(`#${match[1].toLowerCase()}`)
  }

  return (
    <input
      value={draft}
      aria-label={label}
      spellCheck={false}
      onChange={(event) => commit(event.target.value)}
      // Lo que quedó a medio escribir vuelve al color vigente: el campo no
      // puede quedar diciendo algo que la carta no está usando.
      onBlur={() => setDraft(value)}
      className="w-[4.75rem] shrink-0 rounded border border-zinc-700 bg-zinc-950 px-1 py-1 text-center font-mono text-[11px] text-zinc-100 uppercase outline-none focus:border-sand-500"
    />
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
