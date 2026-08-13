import type Konva from 'konva'
import { createRef } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'

import { ICONS } from '../assets/icons'
import { AGENT_ICON_URLS } from '../assets/icons/agents'
import { FACTIONS, FACTION_IDS, type Card } from '../model/card'
import { AppError } from '../model/errors'
import {
  warmAllFactionBandTints,
  warmFactionAgentIcons,
  warmFactionInfluenceIcons,
  warmFactionPickerBadges,
} from '../model/factionArt'
import { FactionLibraryProvider, type FactionLibrary } from '../model/factionLibrary'
import { IconLibraryProvider, type IconLibrary } from '../model/iconLibrary'
import { LanguageProvider, type Language } from '../model/language'
import type { Deck } from '../model/storage'
import { CardStage } from '../render/CardStage'
import { preloadImages } from '../render/imageCache'
import { CARD_FONT_NAME } from '../render/text'

/**
 * Dibuja cartas que no están abiertas en el editor.
 *
 * La hoja de impresión necesita las nueve cartas de la página, y en pantalla
 * hay una sola. En vez de un renderer aparte —que se iría desincronizando del
 * preview— se monta el mismo `CardStage` en un contenedor fuera de pantalla:
 * la carta que se imprime es exactamente la que se ve.
 *
 * El truco para que salga completa es que no quede nada asíncrono al momento
 * de dibujar. `prepare` deja fuentes e imágenes cargadas de antemano, así que
 * el primer render del stage ya tiene todo, y `flushSync` obliga a React a
 * montarlo antes de seguir.
 */

/** Fuentes e imágenes que puede llegar a usar cualquier carta del mazo. */
const templateLayers = import.meta.glob('../assets/layers/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/**
 * Todo lo que las cartas del mazo pueden llegar a **escribir**: el título, el
 * texto de las cajas y el nombre de cada banda de facción.
 *
 * Hace falta porque Jost viene partida por `unicode-range` —latin, latin-ext y
 * cyrillic son tres archivos— y `document.fonts.load` sin texto sólo garantiza
 * el subset del espacio, o sea el latin. Una banda que diga «Космическая
 * гильдия», o una carta titulada en polaco, puede llegar a `toCanvas()` con su
 * archivo todavía sin bajar y salir en la fuente de respaldo. Pasando el texto
 * de verdad, el navegador baja los subsets que ese mazo necesita y ninguno más.
 */
function cardText({ cards, factions }: Deck, language: Language): string {
  const parts = [
    ...FACTION_IDS.map((id) => FACTIONS[id][language]),
    ...factions.map((faction) => faction.label),
    ...cards.flatMap((card) => [
      card.title,
      ...[...card.playContent, ...card.revealContent]
        .filter((part) => part.type === 'text')
        .map((part) => part.text),
    ]),
  ]
  return parts.join(' ')
}

export async function prepare(deck: Deck, language: Language): Promise<void> {
  const { cards, icons, factions } = deck
  const art = cards.map((card) => card.art?.src).filter((src): src is string => Boolean(src))
  const text = cardText(deck, language)

  await Promise.all([
    // Los dos pesos que usa la carta. Jost es variable, así que es el mismo
    // archivo, pero pedirlos por separado es lo que garantiza que estén.
    document.fonts.load(`400 16px '${CARD_FONT_NAME}'`, text),
    document.fonts.load(`500 16px '${CARD_FONT_NAME}'`, text),
    preloadImages([
      ...Object.values(templateLayers),
      ...Object.values(ICONS).map((icon) => icon.url),
      ...Object.values(AGENT_ICON_URLS).flatMap((style) => Object.values(style)),
      // Los iconos propios del mazo entran por acá: si no, salen como un hueco
      // sin que nadie se entere, que es justo lo que la caché vino a evitar.
      ...icons.map((icon) => icon.url),
      ...art,
    ]),
    // Las facciones propias del mazo: la banda tintada de cada color × rango,
    // los 4 rombos de influencia, la placa del selector y el icono de agente
    // (los dos estilos) de cada una, generados en canvas — mismo motivo que
    // los iconos, sin esto salen como un hueco en la hoja.
    warmAllFactionBandTints(factions),
    warmFactionInfluenceIcons(factions),
    warmFactionPickerBadges(factions),
    warmFactionAgentIcons(factions),
  ])
}

export type CardRenderer = {
  /** La carta a tamaño de template (750 × 1039), en un canvas propio. */
  draw: (card: Card) => HTMLCanvasElement
  dispose: () => void
}

/**
 * El contenedor va en el documento y no suelto: Konva mide el contenedor al
 * montar el stage. Queda fuera de la pantalla en vez de `display: none`
 * porque un contenedor oculto mide 0.
 */
export function createCardRenderer(
  library: IconLibrary,
  factionLibrary: FactionLibrary,
  language: Language,
  /** 1× para la hoja de impresión (300 DPI real); 2× para PNG suelto. */
  pixelRatio = 1,
): CardRenderer {
  const host = document.createElement('div')
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:750px;height:1039px;pointer-events:none;opacity:0'
  document.body.append(host)

  const root: Root = createRoot(host)
  const stageRef = createRef<Konva.Stage>()

  return {
    draw(card) {
      flushSync(() => {
        // Este root es aparte del de la app, así que el catálogo de iconos y el
        // idioma hay que volver a ponerlos: sin esto la carta se dibujaría con
        // los iconos del PSD nada más, en español siempre, y los propios del
        // mazo desaparecerían al imprimir.
        root.render(
          <LanguageProvider value={{ language, setLanguage: () => {} }}>
            <FactionLibraryProvider value={factionLibrary}>
              <IconLibraryProvider value={library}>
                <CardStage card={card} scale={1} stageRef={stageRef} />
              </IconLibraryProvider>
            </FactionLibraryProvider>
          </LanguageProvider>,
        )
      })

      const stage = stageRef.current
      if (!stage) throw new AppError('card-canvas-failed')

      // `toCanvas` dibuja la escena en un canvas nuevo, así que no depende del
      // redibujado diferido de Konva ni se pisa con la carta siguiente.
      return stage.toCanvas({ pixelRatio }) as HTMLCanvasElement
    },

    dispose() {
      root.unmount()
      host.remove()
    },
  }
}
