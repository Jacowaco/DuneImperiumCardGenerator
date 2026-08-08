import emblemBeneGesserit from './emblems/bene-gesserit.png'
import emblemCity from './emblems/city.png'
import emblemEmperor from './emblems/emperor.png'
import emblemFremen from './emblems/fremen.png'
import emblemLandsraad from './emblems/landsraad.png'
import emblemSpacingGuild from './emblems/spacing-guild.png'
import emblemSpiceTrade from './emblems/spice-trade.png'
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

/**
 * Los siete iconos de agente del reglamento, en el orden en que aparecen
 * apilados en el PSD. La columna de la carta respeta este orden, no el orden
 * en que se eligieron.
 */
export const AGENT_ICONS = {
  emperor: 'Emperador',
  'spacing-guild': 'Cofradía Espacial',
  'bene-gesserit': 'Bene Gesserit',
  fremen: 'Fremen',
  landsraad: 'Landsraad',
  city: 'Ciudad',
  'spice-trade': 'Comercio de especia',
} as const

export type AgentIcon = keyof typeof AGENT_ICONS

export const AGENT_ICON_IDS = Object.keys(AGENT_ICONS) as AgentIcon[]

/** El PSD trae dos estilos para la misma columna. */
export const AGENT_ICON_STYLES = {
  locations: 'Normal',
  infiltrate: 'Infiltrate',
} as const

export type AgentIconStyle = keyof typeof AGENT_ICON_STYLES

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
 * Los mismos siete emblemas sueltos, sin el tab de fondo crema y sin estilo.
 * No van en la carta: son para los botones del panel, donde el fondo del tab
 * ensucia contra el gris oscuro de la UI.
 */
export const AGENT_EMBLEM_URLS: Record<AgentIcon, string> = {
  emperor: emblemEmperor,
  'spacing-guild': emblemSpacingGuild,
  'bene-gesserit': emblemBeneGesserit,
  fremen: emblemFremen,
  landsraad: emblemLandsraad,
  city: emblemCity,
  'spice-trade': emblemSpiceTrade,
}
