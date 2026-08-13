import type { IconId } from '../assets/icons'
import type { AgentIcon, AgentIconStyle } from '../assets/icons/agents'
import type { CustomFactionId } from './customFaction'
import type { CustomIconId } from './customIcon'
import type { Language } from './language'

/**
 * Un icono de la carta: alguno de los del PSD o uno que haya subido el usuario
 * al mazo. Los dos se nombran igual desde la carta; quién es cuál lo resuelve
 * el catálogo (`iconLibrary.ts`).
 */
export type AnyIconId = IconId | CustomIconId

/**
 * Giro de la imagen, en pasos de 90° y en sentido horario. Sólo esos cuatro:
 * lo que hace falta es enderezar una foto que vino acostada, no inclinarla.
 */
export type ArtRotation = 0 | 90 | 180 | 270

/**
 * Encuadre de la imagen del jugador dentro del Card Art Container.
 * x / y son coordenadas del lienzo de la carta (750 x 1039), no del recorte,
 * y apuntan al borde de arriba a la izquierda de la imagen **ya girada**.
 */
export type ArtTransform = {
  x: number
  y: number
  scale: number
  /**
   * Los dos van opcionales para que un archivo viejo —y el caso común, que es
   * una imagen sin tocar— no cargue dos campos más por carta. Ausente es cero
   * y `false`; quien haga cuentas usa `orientedSize` / `artPlacement`
   * (`model/art.ts`) y no los lee sueltos.
   */
  rotation?: ArtRotation
  /** Espejado horizontal, aplicado **después** del giro: espeja lo que se ve. */
  flip?: boolean
}

export type CardArt = {
  /** object URL de la imagen cargada por el usuario */
  src: string
  /** tamaño natural del archivo, necesario para reencuadrar */
  width: number
  height: number
  transform: ArtTransform
  /** Congela el encuadre: ignora rueda, arrastre y el slider de zoom. */
  locked?: boolean
}

/**
 * El orden de este objeto **es** el orden canónico de las facciones: en él se
 * apilan las bandas de una carta de varias facciones y en él se muestran los
 * botones del panel. Confirmado contra siete pares de cartas reales de dos y
 * tres facciones de `reference/cards/` (p.ej. *Throne Room Politics*, *Keys to
 * Power*, *Imperium Ceremony*, *Satellite Ban*): en todas, la de arriba es la
 * que aparece antes en esta lista.
 */
export type Faction = 'emperor' | 'spacing-guild' | 'bene-gesserit' | 'fremen'

/**
 * Una facción del juego base o una propia, subida por el usuario
 * (`customFaction.ts`). Las dos se nombran igual desde `card.factions`; quién
 * es cuál lo resuelve el catálogo (`factionLibrary.ts`), mismo patrón que
 * `AnyIconId`.
 */
export type AnyFactionId = Faction | CustomFactionId

/**
 * Un icono de agente del reglamento o una facción propia, usada como espacio
 * del tablero — mismo patrón que `AnyFactionId`: se resuelve por catálogo
 * (`factionLibrary.ts` para las propias, `AGENT_ICON_URLS` para las del
 * reglamento), no por tipo.
 */
export type AnyAgentIcon = AgentIcon | CustomFactionId

export const FACTIONS: Record<Faction, Record<Language, string>> = {
  emperor: {
    es: 'Emperador',
    en: 'Emperor',
    pt: 'Imperador',
    fr: 'Empereur',
    de: 'Imperator',
    it: 'Imperatore',
    pl: 'Cesarz',
    cs: 'Císař',
    hu: 'Császár',
    ru: 'Император',
    uk: 'Імператор',
    bg: 'Император',
  },
  'spacing-guild': {
    es: 'Cofradía Espacial',
    en: 'Spacing Guild',
    pt: 'Guilda Espacial',
    fr: 'Guilde Spatiale',
    de: 'Raumgilde',
    it: 'Gilda Spaziale',
    pl: 'Gildia Kosmiczna',
    cs: 'Kosmická gilda',
    hu: 'Űrgilda',
    ru: 'Космическая Гильдия',
    uk: 'Космічна Гільдія',
    bg: 'Космическа Гилдия',
  },
  'bene-gesserit': {
    es: 'Bene Gesserit',
    en: 'Bene Gesserit',
    pt: 'Bene Gesserit',
    fr: 'Bene Gesserit',
    de: 'Bene Gesserit',
    it: 'Bene Gesserit',
    pl: 'Bene Gesserit',
    cs: 'Bene Gesserit',
    hu: 'Bene Gesserit',
    ru: 'Бене Гессерит',
    uk: 'Бене Ґессерит',
    bg: 'Бене Гесерит',
  },
  fremen: {
    es: 'Fremen',
    en: 'Fremen',
    pt: 'Fremen',
    fr: 'Fremen',
    de: 'Fremen',
    it: 'Fremen',
    pl: 'Fremeni',
    cs: 'Fremeni',
    hu: 'Fremenek',
    ru: 'Фримены',
    uk: 'Фримени',
    bg: 'Фримени',
  },
}

/**
 * Una pieza del contenido de una caja. Los iconos y el texto van mezclados en
 * la misma línea, como en las cartas reales ("<icono> 2 Influence : <icono>"),
 * y el layout los va acomodando en renglones.
 */
export type ContentPart =
  /** `amount` sólo lo usan los iconos que salen vacíos del PSD; el resto lo ignora. */
  | { type: 'icon'; icon: AnyIconId; amount: number }
  | { type: 'text'; text: string }
  /** Corta el renglón a mano, para cuando el acomodo automático no alcanza. */
  | { type: 'break' }

export const iconPart = (icon: AnyIconId): ContentPart => ({ type: 'icon', icon, amount: 1 })
export const textPart = (text = ''): ContentPart => ({ type: 'text', text })

/**
 * Alturas disponibles de la caja del turno de agente, en filas de iconos.
 * No hay opción de sacarla: todas las cartas la llevan, aunque esté vacía.
 */
export const PLAY_ROWS = [1, 2, 3] as const
export type PlayRows = (typeof PLAY_ROWS)[number]

/**
 * Cómo se llaman esas alturas en la UI. El número de filas es cómo está hecha
 * la caja, no cómo se elige: lo que se ve es una caja más chica o más grande.
 */
export const PLAY_ROWS_LABELS: Record<PlayRows, Record<Language, string>> = {
  1: {
    es: 'Chica',
    en: 'Small',
    pt: 'Pequena',
    fr: 'Petite',
    de: 'Klein',
    it: 'Piccola',
    pl: 'Mała',
    cs: 'Malá',
    hu: 'Kicsi',
    ru: 'Малая',
    uk: 'Мала',
    bg: 'Малка',
  },
  2: {
    es: 'Media',
    en: 'Medium',
    pt: 'Média',
    fr: 'Moyenne',
    de: 'Mittel',
    it: 'Media',
    pl: 'Średnia',
    cs: 'Střední',
    hu: 'Közepes',
    ru: 'Средняя',
    uk: 'Середня',
    bg: 'Средна',
  },
  3: {
    es: 'Grande',
    en: 'Large',
    pt: 'Grande',
    fr: 'Grande',
    de: 'Groß',
    it: 'Grande',
    pl: 'Duża',
    cs: 'Velká',
    hu: 'Nagy',
    ru: 'Большая',
    uk: 'Велика',
    bg: 'Голяма',
  },
}

export const FACTION_IDS = Object.keys(FACTIONS) as Faction[]

/**
 * Color de cada facción, muestreado del extremo izquierdo de su banda en
 * `src/assets/layers/faction-*.png` (la banda degrada hacia negro a la
 * derecha, así que ese píxel es el color "puro"). Sólo lo usa la UI: en la
 * carta el color viene dentro del PNG.
 */
export const FACTION_COLORS: Record<Faction, string> = {
  'bene-gesserit': '#77588B',
  'spacing-guild': '#CD3A3D',
  emperor: '#636363',
  fremen: '#6A81B9',
}

/**
 * El modelo de la carta. Es la única fuente de verdad: el render es una
 * función pura de este objeto, así que guardar / cargar / exportar en lote
 * es simplemente serializar esto.
 */
export type Card = {
  title: string
  /** Cartas del mazo inicial: llevan el rombo antes del nombre. */
  starting: boolean
  /**
   * Una carta puede pertenecer a más de una facción. Las bandas se apilan
   * hacia abajo siempre en el orden de `FACTION_IDS` primero y las propias
   * después, no en el que se eligieron — y nunca más de cuatro, porque no hay
   * arte para una quinta banda (`FactionBand.tsx`).
   */
  factions: AnyFactionId[]
  /** null = carta sin costo de compra (las del mazo inicial, por ejemplo). */
  cost: number | null
  /** Icono del beneficio de compra. Si hay uno, se dibuja la cinta larga. */
  purchaseBenefit: AnyIconId | null
  /**
   * Cantidad dibujada encima del icono del beneficio. Sólo la usan los iconos
   * que salen vacíos del PSD (`iconTakesNumber`); para el resto se ignora.
   */
  purchaseBenefitAmount: number
  /**
   * Dónde se puede mandar el agente. Se apilan en la columna izquierda, los
   * del reglamento primero y las facciones propias después, y nunca más de
   * `AGENT_ICON_IDS.length` (7): la columna tiene exactamente esas ranuras.
   */
  agentIcons: AnyAgentIcon[]
  agentIconStyle: AgentIconStyle
  /**
   * Alto de la caja del turno de agente, en filas de iconos. La caja siempre
   * está: arranca en y=696 y crece hacia abajo, tapando la banda de reveal que
   * tiene debajo — por eso no hace falta una banda de reveal por altura.
   *
   * Sólo se usa con `playRowsAuto` en `false`: con el ajuste automático
   * prendido, la altura efectiva sale de `autoPlayRows` y este valor queda
   * de respaldo para cuando el usuario lo apaga.
   */
  playRows: PlayRows
  /**
   * Si está prendido (default), el alto de la caja de play sale solo del
   * contenido: la más chica que entra sin achicar el texto/iconos. Apagarlo
   * deja elegir `playRows` a mano.
   */
  playRowsAuto: boolean
  /** La silueta negra del agente, al costado izquierdo de la caja de play. */
  agentSilhouette: boolean
  /** Iconos dentro de cada caja, en el orden en que se dibujan. */
  playContent: ContentPart[]
  revealContent: ContentPart[]
  /**
   * Unload (Rise of Ix): la banda de revelación lleva la banderola roja con el
   * icono de descarte y el de destrucción. Marca dos formas más de cobrar la
   * revelación —al descartar y al destruir la carta— y no cambia lo que la
   * banda dice, así que es una marca de la banda y no una caja aparte.
   */
  unload: boolean
  art: CardArt | null
  /**
   * Marca de "ya está terminada", para saber cuáles del mazo no hay que tocar
   * más. Es una anotación de trabajo: no se dibuja ni sale en el PNG.
   */
  done: boolean
  /**
   * Cuántos ejemplares de esta carta tiene el mazo. Es del mazo y no de la
   * impresión —viaja en el archivo, como el resto de la carta—: que un mazo
   * lleve tres Espadachines es un hecho del mazo, y quien lo abra en otra
   * máquina tiene que imprimir los tres.
   *
   * Sólo la mira la hoja de impresión. El zip del export en lote saca **un**
   * PNG por carta: repetir el mismo archivo tres veces no agrega nada.
   */
  copies: number
}

/** Ninguna carta lleva menos de una, y el tope es para que no se cuelgue el PDF. */
export const MIN_COPIES = 1
export const MAX_COPIES = 99

export const clampCopies = (copies: number) =>
  Math.min(MAX_COPIES, Math.max(MIN_COPIES, Math.round(copies) || MIN_COPIES))

/** Los iconos que la carta nombra, sin repetir: contenido y beneficio de compra. */
export function cardIconIds(card: Card): Set<string> {
  const ids = new Set<string>()

  for (const part of [...card.playContent, ...card.revealContent]) {
    if (part.type === 'icon') ids.add(part.icon)
  }
  if (card.purchaseBenefit) ids.add(card.purchaseBenefit)

  return ids
}

export const emptyCard = (): Card => ({
  title: '',
  starting: false,
  factions: [],
  cost: 0,
  purchaseBenefit: null,
  purchaseBenefitAmount: 1,
  agentIcons: [],
  agentIconStyle: 'locations',
  playRows: 1,
  playRowsAuto: true,
  agentSilhouette: true,
  playContent: [],
  revealContent: [],
  unload: false,
  art: null,
  done: false,
  copies: 1,
})
