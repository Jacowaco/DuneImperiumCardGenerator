import badgeBeneGesserit from './badges/bene-gesserit.png'
import badgeCity from './badges/city.png'
import badgeEmperor from './badges/emperor.png'
import badgeFremen from './badges/fremen.png'
import badgeLandsraad from './badges/landsraad.png'
import badgeSpacingGuild from './badges/spacing-guild.png'
import badgeSpiceTrade from './badges/spice-trade.png'
import infiltrateBeneGesserit from './infiltrate/bene-gesserit.png'
import infiltrateCity from './infiltrate/city.png'
import infiltrateEmperor from './infiltrate/emperor.png'
import infiltrateFremen from './infiltrate/fremen.png'
import infiltrateLandsraad from './infiltrate/landsraad.png'
import infiltrateSpacingGuild from './infiltrate/spacing-guild.png'
import infiltrateSpiceTrade from './infiltrate/spice-trade.png'
import locationBeneGesserit from './locations/bene-gesserit.png'
import locationCity from './locations/city.png'
import locationEmperor from './locations/emperor.png'
import locationFremen from './locations/fremen.png'
import locationLandsraad from './locations/landsraad.png'
import locationSpacingGuild from './locations/spacing-guild.png'
import locationSpiceTrade from './locations/spice-trade.png'
import type { Language } from '../../model/language'

/**
 * Los siete iconos de agente del reglamento, en el orden en que aparecen
 * apilados en el PSD. La columna de la carta respeta este orden, no el orden
 * en que se eligieron.
 */
export const AGENT_ICONS: Record<AgentIcon, Record<Language, string>> = {
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
  landsraad: {
    es: 'Landsraad',
    en: 'Landsraad',
    pt: 'Landsraad',
    fr: 'Landsraad',
    de: 'Landsraad',
    it: 'Landsraad',
    pl: 'Landsraad',
    cs: 'Landsraad',
    hu: 'Landsraad',
    ru: 'Ландсраад',
    uk: 'Ландсраад',
    bg: 'Ландсраад',
  },
  city: {
    es: 'Ciudad',
    en: 'City',
    pt: 'Cidade',
    fr: 'Ville',
    de: 'Stadt',
    it: 'Città',
    pl: 'Miasto',
    cs: 'Město',
    hu: 'Város',
    ru: 'Город',
    uk: 'Місто',
    bg: 'Град',
  },
  'spice-trade': {
    es: 'Comercio de especia',
    en: 'Spice Trade',
    pt: 'Comércio de Especiaria',
    fr: "Commerce d'Épice",
    de: 'Spice-Handel',
    it: 'Commercio delle Spezie',
    pl: 'Handel Przyprawą',
    cs: 'Obchod s kořením',
    hu: 'Fűszerkereskedelem',
    ru: 'Торговля пряностью',
    uk: 'Торгівля прянощами',
    bg: 'Търговия с подправка',
  },
}

export type AgentIcon =
  | 'emperor'
  | 'spacing-guild'
  | 'bene-gesserit'
  | 'fremen'
  | 'landsraad'
  | 'city'
  | 'spice-trade'

export const AGENT_ICON_IDS = Object.keys(AGENT_ICONS) as AgentIcon[]

export type AgentIconStyle = 'locations' | 'infiltrate'

/** El PSD trae dos estilos para la misma columna. */
export const AGENT_ICON_STYLES: Record<AgentIconStyle, Record<Language, string>> = {
  locations: {
    es: 'Normal',
    en: 'Normal',
    pt: 'Normal',
    fr: 'Normal',
    de: 'Normal',
    it: 'Normale',
    pl: 'Zwykły',
    cs: 'Normální',
    hu: 'Normál',
    ru: 'Обычный',
    uk: 'Звичайний',
    bg: 'Нормален',
  },
  infiltrate: {
    es: 'Infiltración',
    en: 'Infiltrate',
    pt: 'Infiltração',
    fr: 'Infiltration',
    de: 'Infiltration',
    it: 'Infiltrazione',
    pl: 'Infiltracja',
    cs: 'Infiltrace',
    hu: 'Beszivárgás',
    ru: 'Инфильтрация',
    uk: 'Інфільтрація',
    bg: 'Инфилтрация',
  },
}

export const AGENT_ICON_STYLE_IDS = Object.keys(AGENT_ICON_STYLES) as AgentIconStyle[]

export const AGENT_ICON_URLS: Record<AgentIconStyle, Record<AgentIcon, string>> = {
  locations: {
    emperor: locationEmperor,
    'spacing-guild': locationSpacingGuild,
    'bene-gesserit': locationBeneGesserit,
    fremen: locationFremen,
    landsraad: locationLandsraad,
    city: locationCity,
    'spice-trade': locationSpiceTrade,
  },
  infiltrate: {
    emperor: infiltrateEmperor,
    'spacing-guild': infiltrateSpacingGuild,
    'bene-gesserit': infiltrateBeneGesserit,
    fremen: infiltrateFremen,
    landsraad: infiltrateLandsraad,
    city: infiltrateCity,
    'spice-trade': infiltrateSpiceTrade,
  },
}

/**
 * Los mismos siete emblemas sobre su placa negra, sin el marco crema de
 * `locations`. **Es la versión que va en los botones del panel**: el negro
 * despega al emblema de cualquier color que tenga atrás, que es justo lo que
 * hace falta en los botones de facción, pintados del color de la facción.
 */
export const AGENT_BADGE_URLS: Record<AgentIcon, string> = {
  emperor: badgeEmperor,
  'spacing-guild': badgeSpacingGuild,
  'bene-gesserit': badgeBeneGesserit,
  fremen: badgeFremen,
  landsraad: badgeLandsraad,
  city: badgeCity,
  'spice-trade': badgeSpiceTrade,
}

// `icons/emblems/` —el emblema sin fondo de ninguna clase— no se importa desde
// acá: lo usa `prepare_assets.py` para componer los rombos de influencia. En la
// UI quedó el badge, que se lee sobre cualquier color.
