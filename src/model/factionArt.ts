import { useEffect, useState } from 'react'

import emperorBand1 from '../assets/layers/faction-bands/emperor-1.png'
import emperorBand2 from '../assets/layers/faction-bands/emperor-2.png'
import emperorBand3 from '../assets/layers/faction-bands/emperor-3.png'
import emperorBand4 from '../assets/layers/faction-bands/emperor-4.png'
import normalContainer from '../assets/layers/faction-badges/normal-container.png'
import pickerContainer from '../assets/layers/faction-badges/picker-container.png'
import infiltrateFill from '../assets/layers/faction-badges/infiltrate-fill.png'
import infiltrateBorder from '../assets/layers/faction-badges/infiltrate-border.png'
import { blankInfluenceUrl } from '../assets/icons/blanks'
import type { AgentIconStyle } from '../assets/icons/agents'
import { INFLUENCE_VARIANTS, type InfluenceVariant } from '../assets/icons/influence'
import { loadImage } from '../render/imageCache'
import { CUSTOM_ICON_PREFIX, isCustomIconId, type CustomIconId } from './customIcon'
import type { CustomFaction, CustomFactionId } from './customFaction'

/**
 * Arte generado en el navegador para las facciones propias, a partir de PNGs
 * que ya están en `src/assets/` — no hace falta tocar `scripts/prepare_assets.py`
 * ni volver a exportar nada del PSD para ninguno de los dos algoritmos de acá.
 */

// ---------------------------------------------------------------------------
// Tinte de la banda
// ---------------------------------------------------------------------------

const REFERENCE_URLS: Record<number, string> = {
  1: emperorBand1,
  2: emperorBand2,
  3: emperorBand3,
  4: emperorBand4,
}

/**
 * `FACTION_COLORS.emperor` (`card.ts`) es gris puro (`#636363`, R=G=B), así
 * que el PNG ya tinturado `faction-bands/emperor-{rank}.png` codifica
 * exactamente `ratio * 0x63` por canal, donde `ratio` es la proporción por
 * fila que arma `compose_faction_bands()` en Python (el píxel más claro de la
 * fila, a la izquierda, es 100%; degrada hacia la derecha).
 *
 * Dividir por `0x63` recupera esa proporción **directamente por píxel**, sin
 * tener que volver a buscar el borde izquierdo de cada fila: ese trabajo ya
 * está hecho, horneado en el PNG de referencia.
 */
const EMPEROR_GRAY = 0x63

type RatioGrid = { width: number; height: number; ratio: Float32Array; alpha: Uint8ClampedArray }

const ratioCache = new Map<number, Promise<RatioGrid>>()

function loadRatioGrid(rank: number): Promise<RatioGrid> {
  const cached = ratioCache.get(rank)
  if (cached) return cached

  const promise = decodeImage(REFERENCE_URLS[rank]).then((image) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = context(canvas)
    ctx.drawImage(image, 0, 0)
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const count = canvas.width * canvas.height
    const ratio = new Float32Array(count)
    const alpha = new Uint8ClampedArray(count)
    for (let i = 0; i < count; i++) {
      ratio[i] = Math.min(1, data[i * 4] / EMPEROR_GRAY)
      alpha[i] = data[i * 4 + 3]
    }
    return { width: canvas.width, height: canvas.height, ratio, alpha }
  })

  ratioCache.set(rank, promise)
  return promise
}

const tintedUrls = new Map<string, string>()
const tintedPending = new Map<string, Promise<string>>()

const tintKey = (color: string, rank: number) => `${rank}:${color}`

/** Síncrono: la banda tintada si ya se calentó, `undefined` mientras tanto. */
export function getTintedFactionBandUrl(color: string, rank: number): string | undefined {
  return tintedUrls.get(tintKey(color, rank))
}

/** Calienta (y cachea) el tinte de una combinación color × posición. */
export function warmTintedFactionBand(color: string, rank: number): Promise<string> {
  const key = tintKey(color, rank)
  const existing = tintedUrls.get(key)
  if (existing) return Promise.resolve(existing)

  const pending = tintedPending.get(key)
  if (pending) return pending

  const built = buildTintedBand(color, rank).then(async (url) => {
    // Seedea también la caché de `render/imageCache.ts`, para que
    // `useCardImage`/`toCanvas` la resuelvan sin async apenas esto termine.
    await loadImage(url)
    tintedUrls.set(key, url)
    return url
  })

  tintedPending.set(key, built)
  return built
}

/**
 * Igual que `useCardImage`: síncrono en cuanto el tinte se calentó una vez,
 * y mientras tanto dispara el calentado y fuerza un redibujo cuando llega.
 * `color` en `undefined` es el camino de una facción built-in, que no usa
 * tinte — no hace nada, para no ensuciar la caché con una clave sin sentido.
 */
export function useTintedFactionBand(color: string | undefined, rank: number): string | undefined {
  const [, redraw] = useState(0)

  useEffect(() => {
    if (!color || getTintedFactionBandUrl(color, rank)) return
    let alive = true
    void warmTintedFactionBand(color, rank).then(() => {
      if (alive) redraw((count) => count + 1)
    })
    return () => {
      alive = false
    }
  }, [color, rank])

  return color ? getTintedFactionBandUrl(color, rank) : undefined
}

export function warmAllFactionBandTints(factions: CustomFaction[]): Promise<void> {
  return Promise.all(
    factions.flatMap((faction) => [1, 2, 3, 4].map((rank) => warmTintedFactionBand(faction.color, rank))),
  ).then(() => {})
}

async function buildTintedBand(color: string, rank: number): Promise<string> {
  const grid = await loadRatioGrid(rank)
  const [r, g, b] = hexToRgb(color)

  const canvas = document.createElement('canvas')
  canvas.width = grid.width
  canvas.height = grid.height
  const ctx = context(canvas)
  const image = ctx.createImageData(grid.width, grid.height)

  for (let i = 0; i < grid.ratio.length; i++) {
    const ratio = grid.ratio[i]
    image.data[i * 4] = ratio * r
    image.data[i * 4 + 1] = ratio * g
    image.data[i * 4 + 2] = ratio * b
    image.data[i * 4 + 3] = grid.alpha[i]
  }

  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

/** Un color mal formado (archivo editado a mano) tiñe negro en vez de tirar. */
function hexToRgb(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return [0, 0, 0]
  const n = parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// ---------------------------------------------------------------------------
// Rombos de influencia
// ---------------------------------------------------------------------------

/** Qué porción del ancho del rombo ocupa el emblema. Igual que en Python. */
const EMBLEM_FILL = 0.58

/**
 * Dónde va el emblema dentro de cada rombo, y de qué tamaño el hueco.
 * MEDIDO, no estimado: sale de correr `emblem_slot()` de
 * `scripts/prepare_assets.py` una vez contra los PNG ya shippeados
 * (`influence-gain-one.png` etc. y `blanks/blank-gain-one.png` etc.), no de
 * geometría a ojo — el "?" no cae en el centro del rombo, el chevrón de
 * ganar/perder lo corre para un lado u otro.
 */
const INFLUENCE_EMBLEM_SLOTS: Record<InfluenceVariant, { cx: number; cy: number; width: number }> = {
  'gain-one': { cx: 43.0, cy: 58.0, width: 86 },
  'lose-one': { cx: 43.0, cy: 45.0, width: 84 },
  'gain-two': { cx: 36.5, cy: 60.0, width: 72 },
  'lose-two': { cx: 37.0, cy: 38.0, width: 73 },
}

/**
 * Id del rombo generado de una facción propia. Reusa el namespace `custom:`
 * de los iconos (no uno propio): es un icono de verdad, referenciado desde
 * `ContentPart` igual que cualquier otro, así que `AnyIconId` no necesita
 * ningún tipo nuevo para esto.
 */
export const factionInfluenceIconId = (
  factionId: CustomFactionId,
  variant: InfluenceVariant,
): CustomIconId => `${CUSTOM_ICON_PREFIX}${factionId}:${variant}`

const INFLUENCE_ICON_ID_RE = /^custom:(faction:[^:]+):(gain-one|lose-one|gain-two|lose-two)$/

/**
 * Inversa de `factionInfluenceIconId`. Hace falta para que `packFactions`
 * (`storage.ts`) detecte una facción referenciada sólo a través de uno de sus
 * rombos en una caja de contenido, sin que la carta tenga esa facción como
 * banda — si no, `packFactions` la descartaría al guardar.
 */
export function factionIdFromInfluenceIconId(iconId: string): CustomFactionId | null {
  if (!isCustomIconId(iconId)) return null
  const match = INFLUENCE_ICON_ID_RE.exec(iconId)
  return match ? (match[1] as CustomFactionId) : null
}

const diamondUrls = new Map<string, { url: string; width: number; height: number }>()
const diamondPending = new Map<string, Promise<{ url: string; width: number; height: number }>>()

const diamondKey = (factionId: CustomFactionId, variant: InfluenceVariant) => `${factionId}:${variant}`

export function getFactionInfluenceIcon(
  factionId: CustomFactionId,
  variant: InfluenceVariant,
): { url: string; width: number; height: number } | undefined {
  return diamondUrls.get(diamondKey(factionId, variant))
}

export function warmFactionInfluenceIcon(
  faction: CustomFaction,
  variant: InfluenceVariant,
): Promise<{ url: string; width: number; height: number }> {
  const key = diamondKey(faction.id, variant)
  const existing = diamondUrls.get(key)
  if (existing) return Promise.resolve(existing)

  const pending = diamondPending.get(key)
  if (pending) return pending

  const built = buildInfluenceDiamond(faction, variant).then(async (result) => {
    await loadImage(result.url)
    diamondUrls.set(key, result)
    return result
  })

  diamondPending.set(key, built)
  return built
}

export function warmFactionInfluenceIcons(factions: CustomFaction[]): Promise<void> {
  return Promise.all(
    factions.flatMap((faction) =>
      (Object.keys(INFLUENCE_VARIANTS) as InfluenceVariant[]).map((variant) =>
        warmFactionInfluenceIcon(faction, variant),
      ),
    ),
  ).then(() => {})
}

async function buildInfluenceDiamond(
  faction: CustomFaction,
  variant: InfluenceVariant,
): Promise<{ url: string; width: number; height: number }> {
  const slot = INFLUENCE_EMBLEM_SLOTS[variant]
  const [blank, emblem] = await Promise.all([
    decodeImage(blankInfluenceUrl(variant)),
    decodeImage(faction.emblem),
  ])

  const target = slot.width * EMBLEM_FILL
  const scale = Math.min(target / emblem.naturalWidth, target / emblem.naturalHeight)
  const width = Math.max(1, Math.round(emblem.naturalWidth * scale))
  const height = Math.max(1, Math.round(emblem.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = blank.naturalWidth
  canvas.height = blank.naturalHeight
  const ctx = context(canvas)
  ctx.drawImage(blank, 0, 0)
  ctx.drawImage(emblem, Math.round(slot.cx - width / 2), Math.round(slot.cy - height / 2), width, height)

  return { url: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
}

// ---------------------------------------------------------------------------
// Placas (emblema sobre un contenedor)
// ---------------------------------------------------------------------------

/**
 * Piezas exportadas a mano para esto — no salen del PSD como el resto, así
 * que viven en `psd-exports/factionbg.png` y las corta
 * `slice_faction_badges()` en `scripts/prepare_assets.py`. Cuatro piezas:
 *
 * - `normalContainer`: marco del icono de agente estilo Normal (equivalente a
 *   `locations/`), fijo, no se recolorea. Sólo se usa en la columna de la
 *   carta, no en los botones — ver `pickerContainer`.
 * - `pickerContainer`: la placa negra sola, sin marco — equivalente a
 *   `AGENT_BADGE_URLS` (las built-in también usan la versión sin marco en los
 *   botones, y la versión con marco de `locations/` sólo en la carta). Va en
 *   los botones de los dos selectores, y además adentro del marco anterior
 *   para el icono de agente estilo Normal en la carta.
 * - `infiltrateFill` / `infiltrateBorder`: estilo Infiltración (equivalente a
 *   `infiltrate/`), separado en relleno (a recolorear con el color de la
 *   facción) y borde (fijo, blanco, va encima) para poder mantener el borde
 *   blanco sea cual sea el color. Ya vienen alineadas al mismo lienzo desde
 *   el script — nada de centrado acá.
 */

/** Cuánto del lado más chico del contenedor ocupa el emblema, en Infiltración. */
const BADGE_EMBLEM_FILL = 0.62

/**
 * Cuánto del lado más chico de la placa ocupa el emblema en el botón y en el
 * icono de agente estilo Normal: más que 1 a propósito, para que sobresalga
 * por arriba y por abajo de la placa — como en las siete del reglamento, el
 * símbolo rompe el borde en vez de quedar contenido adentro.
 */
const PLATE_EMBLEM_FILL = 1.25

const pickerBadgeUrls = new Map<string, string>()
const pickerBadgePending = new Map<string, Promise<string>>()

/** Síncrono: la placa del botón si ya se calentó, `undefined` mientras tanto. */
export function getFactionPickerBadge(factionId: CustomFactionId): string | undefined {
  return pickerBadgeUrls.get(factionId)
}

export function warmFactionPickerBadge(faction: CustomFaction): Promise<string> {
  const existing = pickerBadgeUrls.get(faction.id)
  if (existing) return Promise.resolve(existing)

  const pending = pickerBadgePending.get(faction.id)
  if (pending) return pending

  const built = buildPickerBadge(faction).then(async (url) => {
    await loadImage(url)
    pickerBadgeUrls.set(faction.id, url)
    return url
  })

  pickerBadgePending.set(faction.id, built)
  return built
}

export function warmFactionPickerBadges(factions: CustomFaction[]): Promise<void> {
  return Promise.all(factions.map(warmFactionPickerBadge)).then(() => {})
}

/**
 * Sin marco: la placa negra sola con el emblema encima, del mismo modo que
 * las built-in usan `AGENT_BADGE_URLS` (no `AGENT_ICON_URLS.locations`) en
 * los botones de los dos selectores.
 *
 * El lienzo es del tamaño de `normalContainer` (el marco), no de la placa: no
 * se dibuja el marco acá, pero el margen que deja alrededor de la placa
 * centrada es lo que le da lugar al emblema para sobresalir sin que el
 * canvas lo recorte — mismo motivo que en `buildAgentIcon`, mismo margen.
 */
async function buildPickerBadge(faction: CustomFaction): Promise<string> {
  const [frame, plate, emblem] = await Promise.all([
    decodeImage(normalContainer),
    decodeImage(pickerContainer),
    decodeImage(faction.emblem),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth
  canvas.height = frame.naturalHeight
  const ctx = context(canvas)

  const px = (frame.width - plate.width) / 2
  const py = (frame.height - plate.height) / 2
  ctx.drawImage(plate, px, py)
  drawEmblemCentered(ctx, emblem, px, py, plate.width, plate.height, PLATE_EMBLEM_FILL)

  return canvas.toDataURL('image/png')
}

const agentIconUrls = new Map<string, string>()
const agentIconPending = new Map<string, Promise<string>>()

/**
 * El color entra en la clave: el estilo Infiltración sí se recolorea
 * (`infiltrate-fill`, con el color de la facción), así que cachear sólo por
 * id dejaría pegado el color de la primera vez que se calentó —el color por
 * defecto, antes de que el usuario elija el suyo— aunque después cambie. El
 * estilo Normal no usa el color para nada (ver `buildAgentIcon`), pero
 * comparte esta misma caché por simplicidad.
 */
const agentIconKey = (factionId: CustomFactionId, color: string, style: AgentIconStyle) =>
  `${style}:${color}:${factionId}`

/** Síncrono: el icono de agente si ya se calentó, `undefined` mientras tanto. */
export function getFactionAgentIcon(
  factionId: CustomFactionId,
  color: string,
  style: AgentIconStyle,
): string | undefined {
  return agentIconUrls.get(agentIconKey(factionId, color, style))
}

export function warmFactionAgentIcon(
  faction: CustomFaction,
  style: AgentIconStyle,
): Promise<string> {
  const key = agentIconKey(faction.id, faction.color, style)
  const existing = agentIconUrls.get(key)
  if (existing) return Promise.resolve(existing)

  const pending = agentIconPending.get(key)
  if (pending) return pending

  const built = buildAgentIcon(faction, style).then(async (url) => {
    await loadImage(url)
    agentIconUrls.set(key, url)
    return url
  })

  agentIconPending.set(key, built)
  return built
}

export function warmFactionAgentIcons(factions: CustomFaction[]): Promise<void> {
  const styles: AgentIconStyle[] = ['locations', 'infiltrate']
  return Promise.all(
    factions.flatMap((faction) => styles.map((style) => warmFactionAgentIcon(faction, style))),
  ).then(() => {})
}

async function buildAgentIcon(faction: CustomFaction, style: AgentIconStyle): Promise<string> {
  const emblem = await decodeImage(faction.emblem)

  if (style === 'locations') {
    // Dos capas fijas, ninguna se recolorea: el marco crema (`normalContainer`,
    // igual en las siete del reglamento) y adentro la placa negra
    // (`pickerContainer`, reusada tal cual — es la misma pieza que el botón
    // del selector). El color de la facción no entra acá: en las built-in el
    // color lo lleva el emblema, no el contenedor, y una propia hace lo mismo
    // con lo que subió el usuario.
    const [frame, plate] = await Promise.all([decodeImage(normalContainer), decodeImage(pickerContainer)])
    const canvas = document.createElement('canvas')
    canvas.width = frame.naturalWidth
    canvas.height = frame.naturalHeight
    const ctx = context(canvas)
    ctx.drawImage(frame, 0, 0)

    const px = (frame.width - plate.width) / 2
    const py = (frame.height - plate.height) / 2
    ctx.drawImage(plate, px, py)

    // El emblema se mide contra la placa (no el marco entero) y se deja
    // sobresalir por arriba y por abajo: en las siete del reglamento el
    // símbolo rompe el borde de la placa hacia el marco de los dos lados, no
    // queda contenido adentro.
    drawEmblemCentered(ctx, emblem, px, py, plate.width, plate.height, PLATE_EMBLEM_FILL)
    return canvas.toDataURL('image/png')
  }

  const [fill, border] = await Promise.all([decodeImage(infiltrateFill), decodeImage(infiltrateBorder)])
  const canvas = document.createElement('canvas')
  canvas.width = border.naturalWidth
  canvas.height = border.naturalHeight
  const ctx = context(canvas)
  ctx.drawImage(recolor(fill, faction.color), 0, 0)
  ctx.drawImage(border, 0, 0)
  drawEmblemCentered(ctx, emblem, 0, 0, canvas.width, canvas.height, BADGE_EMBLEM_FILL)
  return canvas.toDataURL('image/png')
}

/**
 * Reemplaza el color de una imagen de un solo color plano, conservando su
 * alpha (así el antialiasing del borde no cambia). Las cuatro piezas de
 * `factionbg.png` son de relleno parejo, sin gradiente — a diferencia de la
 * banda, no hace falta reconstruir una proporción por fila.
 */
function recolor(image: HTMLImageElement, color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = context(canvas)
  ctx.drawImage(image, 0, 0)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = /^#?[0-9a-f]{6}$/i.test(color.trim()) ? color : '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Centra el emblema sobre la caja `(x, y, width, height)`, escalado contra
 * `fill` de su lado más chico. El canvas no recorta, así que un `fill` > 1 o
 * una caja más chica que el contenedor entero (la placa, no el marco) es lo
 * que deja al emblema sobresalir por los bordes de esa caja a propósito.
 */
function drawEmblemCentered(
  ctx: CanvasRenderingContext2D,
  emblem: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
): void {
  const target = Math.min(width, height) * fill
  const scale = Math.min(target / emblem.naturalWidth, target / emblem.naturalHeight)
  const w = Math.max(1, Math.round(emblem.naturalWidth * scale))
  const h = Math.max(1, Math.round(emblem.naturalHeight * scale))
  ctx.drawImage(emblem, x + (width - w) / 2, y + (height - h) / 2, w, h)
}

// ---------------------------------------------------------------------------

function context(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('canvas-failed')
  return ctx
}

/** Igual que la caché de `render/imageCache.ts`, pero resuelve con el elemento. */
function decodeImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`No se pudo decodificar: ${url}`))
    image.src = url
  })
}
