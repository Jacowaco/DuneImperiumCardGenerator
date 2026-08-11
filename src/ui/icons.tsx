/**
 * Iconos de la interfaz. Son SVG monocromos en `currentColor`, no emoji: el
 * único color de la pantalla tiene que ser el de la carta, y un emoji a todo
 * color al lado del arte del juego se lee como un adorno pegado.
 *
 * Van sólo en botones —donde hay un verbo— y nunca en títulos de sección ni en
 * etiquetas de campo, que ya se leen de corrido.
 */
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4 shrink-0"
    >
      {children}
    </svg>
  )
}

/** Abrir un mazo. */
export const FolderIcon = () => (
  <Icon>
    <path d="M2.25 12.75v-9.5h3.9l1.3 1.7h6.3v7.8z" />
  </Icon>
)

/** Guardar — el disquete de siempre. Lo comparte "Guardar como…": son la misma
 *  acción, y el texto es el que las distingue. */
export const SaveIcon = () => (
  <Icon>
    <path d="M2.75 3.75a1 1 0 0 1 1-1h6.9a1 1 0 0 1 .7.3l1.6 1.6a1 1 0 0 1 .3.7v6.9a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1z" />
    <path d="M5.25 2.75v3.5h4.5v-3.5" />
    <path d="M4.75 13.25v-4h6.5v4" />
  </Icon>
)

/** Exportar: el archivo baja a la máquina. */
export const DownloadIcon = () => (
  <Icon>
    <path d="M8 2.25v7.5m0 0 2.75-2.75M8 9.75 5.25 7" />
    <path d="M2.75 12.75h10.5" />
  </Icon>
)

export const PrinterIcon = () => (
  <Icon>
    <path d="M4.75 6.25v-3.5h6.5v3.5" />
    <path d="M2.75 6.25h10.5v4.5h-2v-2.5h-6.5v2.5h-2z" />
    <path d="M4.75 10.25h6.5v3h-6.5z" />
  </Icon>
)

/**
 * Iconos propios. Es el rombo del juego, no un "shapes" genérico: la forma de
 * los iconos de Dune es esa, y así el botón dice de qué iconos habla.
 */
export const DiamondIcon = () => (
  <Icon>
    <path d="M8 2.25 13.75 8 8 13.75 2.25 8z" />
    <circle cx="8" cy="8" r="1.5" />
  </Icon>
)

/**
 * Facciones propias. Un estandarte y no el rombo de `DiamondIcon`: ese ya
 * habla de iconos, y este botón es de otra cosa — la banda de arriba de la
 * carta.
 */
export const BannerIcon = () => (
  <Icon>
    <path d="M4.25 2.25v11.5" />
    <path d="M4.25 2.75h7.5l-2 2.75 2 2.75h-7.5z" />
  </Icon>
)

/** La carta como objeto: el marco, el nombre arriba y la caja de abajo. */
export const CardIcon = () => (
  <Icon>
    <path d="M3.5 2.25h9v11.5h-9z" />
    <path d="M5.5 5h5" />
    <path d="M5.25 9.5h5.5v2h-5.5z" />
  </Icon>
)

/** Reglas: la lista de lo que la carta hace. */
export const RulesIcon = () => (
  <Icon>
    <path d="M7 4.25h6.25M7 8h6.25M7 11.75h6.25" />
    <path d="M3.25 4.25h.75M3.25 8h.75M3.25 11.75h.75" />
  </Icon>
)

/** Elegir la imagen del jugador. */
export const ImageIcon = () => (
  <Icon>
    <path d="M2.75 3.75h10.5v8.5H2.75z" />
    <circle cx="6" cy="6.5" r="1" />
    <path d="M3 11.25 6.25 8l2.25 2 2-1.75 2.75 3" />
  </Icon>
)

/** Subir un icono propio: entra a la app, al revés que exportar. */
export const UploadIcon = () => (
  <Icon>
    <path d="M8 10.25v-7.5m0 0L5.25 5.5M8 2.75 10.75 5.5" />
    <path d="M2.75 12.75h10.5" />
  </Icon>
)

/** Marca de ayuda junto a un título: el texto completo va en el `title`. */
export const InfoIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="5.75" />
    <circle cx="8" cy="5.4" r="0.75" fill="currentColor" stroke="none" />
    <path d="M8 7.5v3.25" />
  </Icon>
)

export const PlusIcon = () => (
  <Icon>
    <path d="M8 3.25v9.5M3.25 8h9.5" />
  </Icon>
)

export const MinusIcon = () => (
  <Icon>
    <path d="M3.25 8h9.5" />
  </Icon>
)

/** Agregar texto a una caja de contenido: una T de letra suelta. */
export const TextIcon = () => (
  <Icon>
    <path d="M3.5 3.75h9M8 3.75v8.5" />
  </Icon>
)

/** Cortar el renglón a mano: la flecha de "Enter". */
export const BreakIcon = () => (
  <Icon>
    <path d="M12.25 4.25v4a1 1 0 0 1-1 1h-6" />
    <path d="M7.25 7.5 4.75 9.5l2.5 2" />
  </Icon>
)

/** Deshacer: la flecha sube desde abajo y da la vuelta para atrás. */
export const UndoIcon = () => (
  <Icon>
    <path d="M12.25 11.75v-4a1 1 0 0 0-1-1h-6" />
    <path d="M7.25 8.5 4.75 6.5l2.5-2" />
  </Icon>
)

/** Rehacer: la misma flecha, mirando para el otro lado. */
export const RedoIcon = () => (
  <Icon>
    <path d="M3.75 11.75v-4a1 1 0 0 1 1-1h6" />
    <path d="M8.75 8.5 11.25 6.5l-2.5-2" />
  </Icon>
)

/** Cambiarle el nombre a algo: el lápiz de siempre. */
export const EditIcon = () => (
  <Icon>
    <path d="M9.75 3.25 12.75 6.25 5.5 13.5H2.5v-3z" />
    <path d="M8.75 4.25 11.75 7.25" />
  </Icon>
)

/** Elegir el idioma: el globo de siempre. */
export const GlobeIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M2.25 8h11.5" />
    <path d="M8 2.25c1.9 1.7 2.95 3.6 2.95 5.75S9.9 12.05 8 13.75c-1.9-1.7-2.95-3.6-2.95-5.75S6.1 3.95 8 2.25z" />
  </Icon>
)

/** Marca que algo se despliega: el chevron de siempre. */
export const ChevronDownIcon = () => (
  <Icon>
    <path d="M4.25 6.25 8 10l3.75-3.75" />
  </Icon>
)

/** Agarradera para arrastrar y reordenar una fila de lista. */
export const GripIcon = () => (
  <Icon>
    <circle cx="6" cy="4" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="10" cy="4" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="6" cy="8" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="10" cy="8" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="6" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="10" cy="12" r="0.75" fill="currentColor" stroke="none" />
  </Icon>
)
