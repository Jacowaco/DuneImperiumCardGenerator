import acquireFoldspace from './acquire-foldspace.png'
import acquireTech from './acquire-tech.png'
import acquireTechDiscountOne from './acquire-tech-discount-one.png'
import combat from './combat.png'
import discardCard from './discard-card.png'
import freighter from './freighter.png'
import geneticMarkerOne from './genetic-marker-one.png'
import geneticMarkerTwo from './genetic-marker-two.png'
import research from './research.png'
import specimen from './specimen.png'
import tleilaxu from './tleilaxu.png'
import trashIntrigue from './trash-intrigue.png'
import unit from './unit.png'
import costArrow from './cost-arrow.png'
import drawCard from './draw-card.png'
import drawIntrigue from './draw-intrigue.png'
import influenceGainOne from './influence-gain-one.png'
import influenceGainTwo from './influence-gain-two.png'
import influenceLoseOne from './influence-lose-one.png'
import influenceLoseTwo from './influence-lose-two.png'
import persuasion from './persuasion.png'
import signetRing from './signet-ring.png'
import solari from './solari.png'
import spice from './spice.png'
import sword from './sword.png'
import trash from './trash.png'
import troop from './troop.png'
import { INFLUENCE_ICONS, type InfluenceIconId } from './influence'
import victoryPoint from './victory-point.png'
import water from './water.png'
import type { Language } from '../../model/language'

/**
 * Iconos recortados de la hoja de símbolos por `scripts/prepare_assets.py`.
 *
 * `solari`, `spice` y `persuasion` vienen sin número: la cantidad la dibuja
 * la app encima.
 *
 * Los `influence-*` sin facción son los genéricos con "?" ("la facción que
 * elijas"); los rombos por facción se agregan desde `./influence`, donde se
 * generan por composición.
 */
/**
 * Toma los idiomas **por nombre y no por posición**: con cinco todavía se
 * podían leer doce comillas seguidas, con doce no, y un orden cambiado pasaba
 * el typecheck sin chistar. Así falta un idioma y el error cae en el icono que
 * lo tiene mal, no en la asignación de `ICONS` al final del archivo.
 */
const label = (labels: Record<Language, string>): Record<Language, string> => labels

const CORE_ICONS = {
  'victory-point': {
    url: victoryPoint,
    label: label({
      es: 'Punto de victoria',
      en: 'Victory Point',
      pt: 'Ponto de Vitória',
      fr: 'Point de Victoire',
      de: 'Siegpunkt',
      it: 'Punto Vittoria',
      pl: 'Punkt zwycięstwa',
      cs: 'Vítězný bod',
      hu: 'Győzelmi pont',
      ru: 'Победное очко',
      uk: 'Переможне очко',
      bg: 'Победна точка',
    }),
  },
  water: {
    url: water,
    label: label({
      es: 'Agua',
      en: 'Water',
      pt: 'Água',
      fr: 'Eau',
      de: 'Wasser',
      it: 'Acqua',
      pl: 'Woda',
      cs: 'Voda',
      hu: 'Víz',
      ru: 'Вода',
      uk: 'Вода',
      bg: 'Вода',
    }),
  },
  solari: {
    url: solari,
    label: label({
      es: 'Solari',
      en: 'Solari',
      pt: 'Solari',
      fr: 'Solari',
      de: 'Solari',
      it: 'Solari',
      pl: 'Solary',
      cs: 'Solary',
      hu: 'Solari',
      ru: 'Солари',
      uk: 'Солари',
      bg: 'Солари',
    }),
  },
  spice: {
    url: spice,
    label: label({
      es: 'Especia',
      en: 'Spice',
      pt: 'Especiaria',
      fr: 'Épice',
      de: 'Spice',
      it: 'Spezia',
      pl: 'Przyprawa',
      cs: 'Koření',
      hu: 'Fűszer',
      ru: 'Пряность',
      uk: 'Прянощі',
      bg: 'Подправка',
    }),
  },
  troop: {
    url: troop,
    label: label({
      es: 'Tropa',
      en: 'Troop',
      pt: 'Tropa',
      fr: 'Troupe',
      de: 'Truppe',
      it: 'Truppa',
      pl: 'Oddział',
      cs: 'Jednotka',
      hu: 'Csapat',
      ru: 'Отряд',
      uk: 'Загін',
      bg: 'Отряд',
    }),
  },
  'draw-card': {
    url: drawCard,
    label: label({
      es: 'Robar carta',
      en: 'Draw Card',
      pt: 'Comprar carta',
      fr: 'Piocher une carte',
      de: 'Karte ziehen',
      it: 'Pesca una carta',
      pl: 'Dobierz kartę',
      cs: 'Lízni si kartu',
      hu: 'Húzz egy lapot',
      ru: 'Взять карту',
      uk: 'Взяти карту',
      bg: 'Изтегляне на карта',
    }),
  },
  'draw-intrigue': {
    url: drawIntrigue,
    label: label({
      es: 'Robar intriga',
      en: 'Draw Intrigue',
      pt: 'Comprar intriga',
      fr: 'Piocher une intrigue',
      de: 'Intrige ziehen',
      it: 'Pesca un intrigo',
      pl: 'Dobierz intrygę',
      cs: 'Lízni si intriku',
      hu: 'Húzz egy intrikát',
      ru: 'Взять интригу',
      uk: 'Взяти інтригу',
      bg: 'Изтегляне на интрига',
    }),
  },
  trash: {
    url: trash,
    label: label({
      es: 'Descartar',
      en: 'Trash',
      pt: 'Descartar',
      fr: 'Détruire',
      de: 'Vernichten',
      it: 'Elimina',
      pl: 'Zniszcz',
      cs: 'Znič',
      hu: 'Semmisíts meg',
      ru: 'Уничтожить',
      uk: 'Знищити',
      bg: 'Унищожаване',
    }),
  },
  'acquire-foldspace': {
    url: acquireFoldspace,
    label: label({
      es: 'Foldspace',
      en: 'Foldspace',
      pt: 'Foldspace',
      fr: 'Foldspace',
      de: 'Foldspace',
      it: 'Foldspace',
      pl: 'Foldspace',
      cs: 'Foldspace',
      hu: 'Foldspace',
      ru: 'Фолдспейс',
      uk: 'Фолдспейс',
      bg: 'Фолдспейс',
    }),
  },
  'signet-ring': {
    url: signetRing,
    label: label({
      es: 'Anillo de sello',
      en: 'Signet Ring',
      pt: 'Anel de Sinete',
      fr: 'Anneau sigillaire',
      de: 'Siegelring',
      it: 'Anello con Sigillo',
      pl: 'Sygnet',
      cs: 'Pečetní prsten',
      hu: 'Pecsétgyűrű',
      ru: 'Перстень с печатью',
      uk: 'Перстень із печаткою',
      bg: 'Пръстен с печат',
    }),
  },
  persuasion: {
    url: persuasion,
    label: label({
      es: 'Persuasión',
      en: 'Persuasion',
      pt: 'Persuasão',
      fr: 'Persuasion',
      de: 'Überzeugung',
      it: 'Persuasione',
      pl: 'Perswazja',
      cs: 'Přesvědčování',
      hu: 'Meggyőzés',
      ru: 'Убеждение',
      uk: 'Переконання',
      bg: 'Убеждаване',
    }),
  },
  sword: {
    url: sword,
    label: label({
      es: 'Espada',
      en: 'Sword',
      pt: 'Espada',
      fr: 'Épée',
      de: 'Schwert',
      it: 'Spada',
      pl: 'Miecz',
      cs: 'Meč',
      hu: 'Kard',
      ru: 'Меч',
      uk: 'Меч',
      bg: 'Меч',
    }),
  },
  'influence-gain-one': {
    url: influenceGainOne,
    label: label({
      es: 'Ganar 1 influencia',
      en: 'Gain 1 Influence',
      pt: 'Ganhar 1 de influência',
      fr: 'Gagner 1 influence',
      de: 'Erhalte 1 Einfluss',
      it: 'Guadagna 1 influenza',
      pl: 'Zyskaj 1 wpływu',
      cs: 'Získej 1 vliv',
      hu: 'Szerezz 1 befolyást',
      ru: 'Получить 1 влияния',
      uk: 'Отримати 1 впливу',
      bg: 'Получаване на 1 влияние',
    }),
  },
  'influence-gain-two': {
    url: influenceGainTwo,
    label: label({
      es: 'Ganar 2 influencia',
      en: 'Gain 2 Influence',
      pt: 'Ganhar 2 de influência',
      fr: 'Gagner 2 influence',
      de: 'Erhalte 2 Einfluss',
      it: 'Guadagna 2 influenza',
      pl: 'Zyskaj 2 wpływu',
      cs: 'Získej 2 vlivy',
      hu: 'Szerezz 2 befolyást',
      ru: 'Получить 2 влияния',
      uk: 'Отримати 2 впливу',
      bg: 'Получаване на 2 влияние',
    }),
  },
  'influence-lose-one': {
    url: influenceLoseOne,
    label: label({
      es: 'Perder 1 influencia',
      en: 'Lose 1 Influence',
      pt: 'Perder 1 de influência',
      fr: 'Perdre 1 influence',
      de: 'Verliere 1 Einfluss',
      it: 'Perdi 1 influenza',
      pl: 'Strać 1 wpływu',
      cs: 'Ztrať 1 vliv',
      hu: 'Veszíts 1 befolyást',
      ru: 'Потерять 1 влияния',
      uk: 'Втратити 1 впливу',
      bg: 'Загуба на 1 влияние',
    }),
  },
  'influence-lose-two': {
    url: influenceLoseTwo,
    label: label({
      es: 'Perder 2 influencia',
      en: 'Lose 2 Influence',
      pt: 'Perder 2 de influência',
      fr: 'Perdre 2 influence',
      de: 'Verliere 2 Einfluss',
      it: 'Perdi 2 influenza',
      pl: 'Strać 2 wpływu',
      cs: 'Ztrať 2 vlivy',
      hu: 'Veszíts 2 befolyást',
      ru: 'Потерять 2 влияния',
      uk: 'Втратити 2 впливу',
      bg: 'Загуба на 2 влияние',
    }),
  },
  'cost-arrow': {
    url: costArrow,
    label: label({
      es: 'Flecha de costo',
      en: 'Cost Arrow',
      pt: 'Seta de custo',
      fr: 'Flèche de coût',
      de: 'Kostenpfeil',
      it: 'Freccia del costo',
      pl: 'Strzałka kosztu',
      cs: 'Šipka ceny',
      hu: 'Költségnyíl',
      ru: 'Стрелка стоимости',
      uk: 'Стрілка вартості',
      bg: 'Стрелка за цена',
    }),
  },
} as const

const IX_ICONS = {
  'acquire-tech': {
    url: acquireTech,
    label: label({
      es: 'Adquirir tecnología',
      en: 'Acquire Tech',
      pt: 'Adquirir tecnologia',
      fr: 'Acquérir une technologie',
      de: 'Technologie erwerben',
      it: 'Acquisisci tecnologia',
      pl: 'Zdobądź technologię',
      cs: 'Získej technologii',
      hu: 'Szerezz technológiát',
      ru: 'Приобрести технологию',
      uk: 'Придбати технологію',
      bg: 'Придобиване на технология',
    }),
  },
  'acquire-tech-discount-one': {
    url: acquireTechDiscountOne,
    label: label({
      es: 'Adquirir tecnología (−1 especia)',
      en: 'Acquire Tech (−1 Spice)',
      pt: 'Adquirir tecnologia (−1 especiaria)',
      fr: 'Acquérir une technologie (−1 épice)',
      de: 'Technologie erwerben (−1 Spice)',
      it: 'Acquisisci tecnologia (−1 spezia)',
      pl: 'Zdobądź technologię (−1 przyprawa)',
      cs: 'Získej technologii (−1 koření)',
      hu: 'Szerezz technológiát (−1 fűszer)',
      ru: 'Приобрести технологию (−1 пряность)',
      uk: 'Придбати технологію (−1 прянощі)',
      bg: 'Придобиване на технология (−1 подправка)',
    }),
  },
  freighter: {
    url: freighter,
    label: label({
      es: 'Carguero',
      en: 'Freighter',
      pt: 'Cargueiro',
      fr: 'Cargo',
      de: 'Frachter',
      it: 'Cargo',
      pl: 'Frachtowiec',
      cs: 'Nákladní loď',
      hu: 'Teherhajó',
      ru: 'Грузовой корабль',
      uk: 'Вантажний корабель',
      bg: 'Товарен кораб',
    }),
  },
  unit: {
    url: unit,
    label: label({
      es: 'Acorazado',
      en: 'Unit',
      pt: 'Unidade',
      fr: 'Unité',
      de: 'Einheit',
      it: 'Unità',
      pl: 'Jednostka',
      cs: 'Jednotka',
      hu: 'Egység',
      ru: 'Боевая единица',
      uk: 'Бойова одиниця',
      bg: 'Бойна единица',
    }),
  },
  'discard-card': {
    url: discardCard,
    label: label({
      es: 'Descartar una carta',
      en: 'Discard a Card',
      pt: 'Descartar uma carta',
      fr: 'Défausser une carte',
      de: 'Karte abwerfen',
      it: 'Scarta una carta',
      pl: 'Odrzuć kartę',
      cs: 'Odhoď kartu',
      hu: 'Dobj el egy lapot',
      ru: 'Сбросить карту',
      uk: 'Скинути карту',
      bg: 'Изхвърляне на карта',
    }),
  },
} as const

const IMMORTALITY_ICONS = {
  research: {
    url: research,
    label: label({
      es: 'Investigación',
      en: 'Research',
      pt: 'Pesquisa',
      fr: 'Recherche',
      de: 'Forschung',
      it: 'Ricerca',
      pl: 'Badania',
      cs: 'Výzkum',
      hu: 'Kutatás',
      ru: 'Исследование',
      uk: 'Дослідження',
      bg: 'Проучване',
    }),
  },
  tleilaxu: {
    url: tleilaxu,
    label: label({
      es: 'Tleilaxu',
      en: 'Tleilaxu',
      pt: 'Tleilaxu',
      fr: 'Tleilaxu',
      de: 'Tleilaxu',
      it: 'Tleilaxu',
      pl: 'Tleilaxu',
      cs: 'Tleilaxu',
      hu: 'Tleilaxu',
      ru: 'Тлейлаксу',
      uk: 'Тлейлаксу',
      bg: 'Тлейлаксу',
    }),
  },
  specimen: {
    url: specimen,
    label: label({
      es: 'Espécimen',
      en: 'Specimen',
      pt: 'Espécime',
      fr: 'Spécimen',
      de: 'Exemplar',
      it: 'Esemplare',
      pl: 'Okaz',
      cs: 'Vzorek',
      hu: 'Példány',
      ru: 'Образец',
      uk: 'Зразок',
      bg: 'Образец',
    }),
  },
  combat: {
    url: combat,
    label: label({
      es: 'Combate',
      en: 'Combat',
      pt: 'Combate',
      fr: 'Combat',
      de: 'Kampf',
      it: 'Combattimento',
      pl: 'Walka',
      cs: 'Boj',
      hu: 'Harc',
      ru: 'Битва',
      uk: 'Битва',
      bg: 'Битка',
    }),
  },
  'trash-intrigue': {
    url: trashIntrigue,
    label: label({
      es: 'Descartar intriga',
      en: 'Trash Intrigue',
      pt: 'Descartar intriga',
      fr: 'Détruire une intrigue',
      de: 'Intrige vernichten',
      it: 'Elimina un intrigo',
      pl: 'Zniszcz intrygę',
      cs: 'Znič intriku',
      hu: 'Semmisíts meg egy intrikát',
      ru: 'Уничтожить интригу',
      uk: 'Знищити інтригу',
      bg: 'Унищожаване на интрига',
    }),
  },
  'genetic-marker-one': {
    url: geneticMarkerOne,
    label: label({
      es: 'Marcador genético 1',
      en: 'Genetic Marker 1',
      pt: 'Marcador genético 1',
      fr: 'Marqueur génétique 1',
      de: 'Genetischer Marker 1',
      it: 'Marcatore genetico 1',
      pl: 'Znacznik genetyczny 1',
      cs: 'Genetický znak 1',
      hu: 'Genetikai jelölő 1',
      ru: 'Генетический маркер 1',
      uk: 'Генетичний маркер 1',
      bg: 'Генетичен маркер 1',
    }),
  },
  'genetic-marker-two': {
    url: geneticMarkerTwo,
    label: label({
      es: 'Marcador genético 2',
      en: 'Genetic Marker 2',
      pt: 'Marcador genético 2',
      fr: 'Marqueur génétique 2',
      de: 'Genetischer Marker 2',
      it: 'Marcatore genetico 2',
      pl: 'Znacznik genetyczny 2',
      cs: 'Genetický znak 2',
      hu: 'Genetikai jelölő 2',
      ru: 'Генетический маркер 2',
      uk: 'Генетичний маркер 2',
      bg: 'Генетичен маркер 2',
    }),
  },
} as const

const BASE_ICONS = { ...CORE_ICONS, ...IX_ICONS, ...IMMORTALITY_ICONS } as const

export const ICONS: Record<IconId, { url: string; label: Record<Language, string> }> = {
  ...BASE_ICONS,
  ...INFLUENCE_ICONS,
}

export type IconId = keyof typeof BASE_ICONS | InfluenceIconId

export const ICON_IDS = Object.keys(ICONS) as IconId[]

/** Para agrupar el selector de iconos del editor por expansión. */
export const IX_ICON_IDS = Object.keys(IX_ICONS) as IconId[]
export const IMMORTALITY_ICON_IDS = Object.keys(IMMORTALITY_ICONS) as IconId[]
export const INFLUENCE_ICON_IDS = Object.keys(INFLUENCE_ICONS) as IconId[]

/**
 * Los iconos que vienen vacíos necesitan que la app les dibuje la cantidad
 * encima. El valor es el color del número, elegido para contrastar con el
 * fondo del icono: el solari es plateado, la especia naranja y la persuasión
 * azul.
 */
export const ICON_NUMBER_COLORS: Partial<Record<IconId, string>> = {
  solari: '#2b2b2b',
  spice: '#ffffff',
  persuasion: '#ffffff',
}

export const iconTakesNumber = (icon: IconId) => icon in ICON_NUMBER_COLORS
