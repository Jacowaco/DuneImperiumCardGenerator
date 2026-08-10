import { AppError, type ErrorCode } from '../model/errors'
import { useLanguage, type Language } from '../model/language'

/**
 * Catálogo de textos de la UI, aparte de los datos del juego (facciones,
 * iconos, papeles), que se traducen donde viven —`card.ts`, `agents.ts`,
 * `influence.ts`, `assets/icons/index.ts`, `paper.ts`— porque además de la UI
 * los necesita el render de la carta o el catálogo de iconos.
 *
 * Es un objeto por idioma y no un diccionario `clave -> {es, en}`: así
 * TypeScript obliga a que los dos idiomas tengan exactamente los mismos
 * campos, con el mismo tipo — a una función le falta un parámetro en un solo
 * idioma y ya no compila.
 */
type Strings = {
  topBar: {
    title: string
    subtitle: string
    unsavedName: string
    renameTitle: string
    noNativeFsTooltip: string
    noNativeFsBadge: string
    open: string
    save: string
    saveAs: string
    exporting: string
    export: string
    defaultFileName: string
    language: string
  }
  tabs: { art: string; card: string; rules: string }
  doneBanner: { locked: string; unlock: string }
  doneBadge: { done: string; markDone: string; reopenTitle: string; markDoneTitle: string }
  dialogs: { icons: string; print: string }
  deckFooter: { icons: string; print: string }
  gallery: {
    title: string
    newCardTitle: string
    newButton: string
    unnamed: string
    duplicate: string
    remove: string
    doneStamp: string
    reopenTitle: string
    markDoneTitle: string
    markPendingAria: string
  }
  cardPanel: {
    name: string
    namePlaceholder: string
    startingCard: string
    faction: string
    factionHint: string
    cost: string
    hasCost: string
    persuasion: string
    purchaseBenefit: string
    none: string
    custom: (label: string) => string
    amount: string
    otherValue: string
  }
  contentEditor: {
    empty: string
    textPlaceholder: string
    lineBreak: string
    deletedIcon: string
    close: string
    addIcon: string
    addText: string
    addLineBreak: string
    remove: string
    custom: string
    core: string
    influence: string
    decrease: (label: string) => string
    increase: (label: string) => string
  }
  rulesPanel: {
    agentIcons: string
    style: string
    playTurn: string
    boxHeight: string
    autoAdjust: string
    autoHint: (label: string) => string
    agentSilhouette: string
    reveal: string
    alwaysBothHint: string
  }
  artPanel: {
    image: string
    changeImage: string
    chooseImage: string
    remove: string
    dragHint: string
    frame: string
    zoom: string
    fit: string
    center: string
    dragZoomHint: string
    placeholder: string
  }
  iconPanel: {
    emptyHint: string
    nameLabel: (label: string) => string
    heightTitle: string
    heightLabel: (label: string) => string
    decreaseHeightLabel: (label: string) => string
    increaseHeightLabel: (label: string) => string
    showNumberText: string
    showNumberLabel: (label: string) => string
    numberColorTitle: string
    numberColorLabel: (label: string) => string
    upload: string
    hint: string
    confirmRemove: (label: string, used: number) => string
    removeLabel: (label: string) => string
  }
  printPanel: {
    perSheetSuffix: string
    fitsOnOne: string
    spansPages: (pages: number) => string
    bleedToggle: string
    bleedOnHint: string
    bleedOffHint: string
    buildingPdf: string
    downloadPdf: string
    pdfSizeHintBefore: string
    pdfSizeHintBold: string
    pdfSizeHintAfter: string
    cardSizeHint: (widthPx: number, heightPx: number) => string
  }
  errors: Record<ErrorCode, (params: Record<string, string>) => string> & {
    openFailed: string
    artFailed: string
    sheetFailed: string
    iconFailed: string
    permissionDenied: (fileName: string) => string
  }
}

const STRINGS: Record<Language, Strings> = {
  es: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      unsavedName: 'Mazo sin guardar',
      renameTitle: 'Cambiarle el nombre al mazo',
      noNativeFsTooltip:
        'Acá no se pueden sobrescribir archivos, así que «Guardar» y «Guardar como…» bajan una copia nueva. La API sólo está en Chrome y Edge, y no en la vista previa embebida del editor: abriendo la app en una ventana del navegador, «Guardar» escribe sobre el archivo abierto sin preguntar.',
      noNativeFsBadge: 'Acá «Guardar» baja una copia',
      open: 'Abrir…',
      save: 'Guardar',
      saveAs: 'Guardar como…',
      exporting: 'Exportando…',
      export: 'Exportar PNG',
      defaultFileName: 'carta',
      language: 'Idioma',
    },
    tabs: { art: 'Imagen', card: 'Encabezado', rules: 'Reglas' },
    doneBanner: {
      locked: 'Carta terminada, bloqueada para no tocarla de más.',
      unlock: 'Desbloquear',
    },
    doneBadge: {
      done: '✓ Terminada',
      markDone: 'Marcar terminada',
      reopenTitle: 'Terminada — clic para reabrir',
      markDoneTitle: 'Marcar como terminada',
    },
    dialogs: { icons: 'Iconos propios', print: 'Imprimir el mazo' },
    deckFooter: { icons: 'Iconos…', print: 'Imprimir…' },
    gallery: {
      title: 'Mazo',
      newCardTitle: 'Carta nueva',
      newButton: 'Nueva',
      unnamed: 'Sin nombre',
      duplicate: 'Duplicar',
      remove: 'Eliminar',
      doneStamp: 'Terminada',
      reopenTitle: 'Terminada — clic para reabrir',
      markDoneTitle: 'Marcar como terminada',
      markPendingAria: 'Marcar como pendiente',
    },
    cardPanel: {
      name: 'Nombre',
      namePlaceholder: 'Duncan Idaho',
      startingCard: 'Carta de mazo inicial',
      faction: 'Facción',
      factionHint: 'Se apilan hacia abajo en este mismo orden, sin importar en qué orden las elijas.',
      cost: 'Costo de compra',
      hasCost: 'Tiene costo',
      persuasion: 'Persuasión',
      purchaseBenefit: 'Beneficio de compra',
      none: 'Ninguno',
      custom: (label) => `Propio · ${label}`,
      amount: 'Cantidad',
      otherValue: 'Otro valor',
    },
    contentEditor: {
      empty: 'Caja vacía.',
      textPlaceholder: 'Texto…',
      lineBreak: '— corte de renglón —',
      deletedIcon: 'Icono borrado',
      close: 'Cerrar',
      addIcon: 'Icono…',
      addText: 'Texto',
      addLineBreak: 'Renglón',
      remove: 'Quitar',
      custom: 'Propios',
      core: 'Dune Imperium',
      influence: 'Influencia por facción',
      decrease: (label) => `Restar ${label}`,
      increase: (label) => `Sumar ${label}`,
    },
    rulesPanel: {
      agentIcons: 'Iconos de agente',
      style: 'Estilo',
      playTurn: 'Turno de agente',
      boxHeight: 'Alto de la caja',
      autoAdjust: 'Ajuste automático',
      autoHint: (label) => `Se ajusta sola según el contenido: por ahora, ${label.toLowerCase()}.`,
      agentSilhouette: 'Silueta del agente',
      reveal: 'Revelación',
      alwaysBothHint:
        'Las dos cajas van siempre, aunque queden vacías: toda carta tiene turno de agente y banda de revelación.',
    },
    artPanel: {
      image: 'Imagen',
      changeImage: 'Cambiar imagen…',
      chooseImage: 'Elegir imagen…',
      remove: 'Quitar',
      dragHint: 'También podés arrastrar un archivo sobre la carta.',
      frame: 'Encuadre',
      zoom: 'Zoom',
      fit: 'Ajustar',
      center: 'Centrar',
      dragZoomHint: 'Arrastrá la imagen sobre la carta para moverla; la rueda hace zoom.',
      placeholder: 'Arrastrá una imagen acá\no tocá para elegirla',
    },
    iconPanel: {
      emptyHint:
        'Para reglas que el juego no trae. Quedan disponibles en todos tus mazos y aparecen al final del selector de iconos.',
      nameLabel: (label) => `Nombre de ${label}`,
      heightTitle: 'Alto en la carta, en % del icono del juego',
      heightLabel: (label) => `Alto de ${label} en la carta, en % del icono del juego`,
      decreaseHeightLabel: (label) => `Achicar ${label}`,
      increaseHeightLabel: (label) => `Agrandar ${label}`,
      showNumberText: 'Número',
      showNumberLabel: (label) => `Mostrar número sobre ${label}`,
      numberColorTitle: 'Color del número',
      numberColorLabel: (label) => `Color del número de ${label}`,
      upload: 'Subir icono…',
      hint: 'PNG con transparencia, se recortan solos al contenido. El % es el alto en la carta comparado con un icono del juego. Quedan guardados en este navegador, y el mazo se lleva adentro los que sus cartas usan.',
      confirmRemove: (label, used) =>
        `«${label}» está en ${pluralCards(used, 'es')} de este mazo. Si lo borrás, esas cartas lo pierden.`,
      removeLabel: (label) => `Borrar ${label}`,
    },
    printPanel: {
      perSheetSuffix: 'por hoja.',
      fitsOnOne: 'El mazo entra en una.',
      spansPages: (pages) => `El mazo ocupa ${pages}.`,
      bleedToggle: 'Sangrado de 3 mm (imprenta)',
      bleedOnHint:
        'Cada carta se dibuja 3 mm más grande de negro por lado y se corta sola: si la guillotina se corre, sale negro y no un filo blanco. Entran menos por hoja.',
      bleedOffHint:
        'Las cartas van pegadas y comparten el corte, así que un corte sirve para dos. Entran más por hoja, pero cualquier desvío se nota.',
      buildingPdf: 'Armando el PDF…',
      downloadPdf: 'Bajar PDF para imprimir',
      pdfSizeHintBefore:
        'El PDF lleva el tamaño de la hoja adentro, así que se imprime a escala real. Igual, en el diálogo de impresión elegí ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' o «tamaño real», nunca «ajustar a la página».',
      cardSizeHint: (w, h) => `Cada carta suelta sale de ${w} × ${h} px — 63,5 × 88 mm al doble de 300 DPI.`,
    },
    errors: {
      openFailed: 'No se pudo abrir el archivo.',
      artFailed: 'No se pudo cargar la imagen.',
      sheetFailed: 'No se pudo armar la hoja.',
      iconFailed: 'No se pudo cargar el icono.',
      permissionDenied: (fileName) =>
        `Chrome pide permiso para escribir sobre ${fileName}. Apretá Guardar de nuevo y elegí «Editar archivo», o usá Guardar como… para elegir otro.`,
      'not-a-card': () => 'El archivo no es una carta de Dune: Imperium.',
      'no-cards': () => 'El archivo no tiene ninguna carta.',
      'empty-image': ({ name }) => `La imagen está vacía: ${name}`,
      'read-failed': ({ name }) => `No se pudo leer el archivo: ${name}`,
      'invalid-image': ({ name }) => `No es una imagen válida: ${name}`,
      'canvas-failed': () => 'El navegador no pudo preparar la imagen.',
      'png-failed': () => 'El navegador no pudo generar el PNG.',
      'sheet-canvas-failed': () => 'El navegador no pudo preparar la hoja.',
      'sheet-read-failed': () => 'El navegador no pudo leer la hoja.',
      'card-canvas-failed': () => 'No se pudo preparar el lienzo de la carta.',
    },
  },
  en: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      unsavedName: 'Unsaved deck',
      renameTitle: 'Rename the deck',
      noNativeFsTooltip:
        'Files can\'t be overwritten here, so "Save" and "Save as…" download a new copy. The API only exists in Chrome and Edge, and not in the editor\'s embedded preview: opening the app in a browser window makes "Save" write to the open file without asking.',
      noNativeFsBadge: 'Here, "Save" downloads a copy',
      open: 'Open…',
      save: 'Save',
      saveAs: 'Save as…',
      exporting: 'Exporting…',
      export: 'Export PNG',
      defaultFileName: 'card',
      language: 'Language',
    },
    tabs: { art: 'Image', card: 'Header', rules: 'Rules' },
    doneBanner: {
      locked: "Finished card, locked so it doesn't get edited by mistake.",
      unlock: 'Unlock',
    },
    doneBadge: {
      done: '✓ Finished',
      markDone: 'Mark finished',
      reopenTitle: 'Finished — click to reopen',
      markDoneTitle: 'Mark as finished',
    },
    dialogs: { icons: 'Custom icons', print: 'Print the deck' },
    deckFooter: { icons: 'Icons…', print: 'Print…' },
    gallery: {
      title: 'Deck',
      newCardTitle: 'New card',
      newButton: 'New',
      unnamed: 'Unnamed',
      duplicate: 'Duplicate',
      remove: 'Delete',
      doneStamp: 'Finished',
      reopenTitle: 'Finished — click to reopen',
      markDoneTitle: 'Mark as finished',
      markPendingAria: 'Mark as pending',
    },
    cardPanel: {
      name: 'Name',
      namePlaceholder: 'Duncan Idaho',
      startingCard: 'Starting deck card',
      faction: 'Faction',
      factionHint: 'They stack downward in this same order, no matter what order you pick them in.',
      cost: 'Acquire Cost',
      hasCost: 'Has a cost',
      persuasion: 'Persuasion',
      purchaseBenefit: 'Acquire Bonus',
      none: 'None',
      custom: (label) => `Custom · ${label}`,
      amount: 'Amount',
      otherValue: 'Custom value',
    },
    contentEditor: {
      empty: 'Empty box.',
      textPlaceholder: 'Text…',
      lineBreak: '— line break —',
      deletedIcon: 'Deleted icon',
      close: 'Close',
      addIcon: 'Icon…',
      addText: 'Text',
      addLineBreak: 'Line break',
      remove: 'Remove',
      custom: 'Custom',
      core: 'Dune Imperium',
      influence: 'Influence by Faction',
      decrease: (label) => `Decrease ${label}`,
      increase: (label) => `Increase ${label}`,
    },
    rulesPanel: {
      agentIcons: 'Agent Icons',
      style: 'Style',
      playTurn: 'Agent Turn',
      boxHeight: 'Box Height',
      autoAdjust: 'Auto-adjust',
      autoHint: (label) => `Adjusts itself to fit the content: currently, ${label.toLowerCase()}.`,
      agentSilhouette: 'Agent Silhouette',
      reveal: 'Reveal',
      alwaysBothHint:
        'Both boxes are always there, even when empty: every card has an agent turn and a reveal band.',
    },
    artPanel: {
      image: 'Image',
      changeImage: 'Change image…',
      chooseImage: 'Choose image…',
      remove: 'Remove',
      dragHint: 'You can also drag a file onto the card.',
      frame: 'Framing',
      zoom: 'Zoom',
      fit: 'Fit',
      center: 'Center',
      dragZoomHint: 'Drag the image over the card to move it; the wheel zooms.',
      placeholder: 'Drag an image here\nor tap to choose one',
    },
    iconPanel: {
      emptyHint:
        "For rules the game doesn't include. They stay available in all your decks and show up at the end of the icon picker.",
      nameLabel: (label) => `Name of ${label}`,
      heightTitle: "Height on the card, as a % of the game's icon",
      heightLabel: (label) => `Height of ${label} on the card, as a % of the game's icon`,
      decreaseHeightLabel: (label) => `Shrink ${label}`,
      increaseHeightLabel: (label) => `Grow ${label}`,
      showNumberText: 'Number',
      showNumberLabel: (label) => `Show number over ${label}`,
      numberColorTitle: 'Number color',
      numberColorLabel: (label) => `Number color for ${label}`,
      upload: 'Upload icon…',
      hint: "Transparent PNGs, auto-cropped to content. The % is the height on the card compared to a game icon. They're saved in this browser, and the deck carries along the ones its cards use.",
      confirmRemove: (label, used) =>
        `"${label}" is used in ${pluralCards(used, 'en')} of this deck. Deleting it removes it from those cards.`,
      removeLabel: (label) => `Delete ${label}`,
    },
    printPanel: {
      perSheetSuffix: 'per sheet.',
      fitsOnOne: 'The deck fits on one.',
      spansPages: (pages) => `The deck spans ${pages}.`,
      bleedToggle: '3 mm bleed (print shop)',
      bleedOnHint:
        "Each card is drawn 3 mm bigger in black on every side and cut on its own: if the guillotine drifts, it cuts into black instead of a white edge. Fewer fit per sheet.",
      bleedOffHint:
        'Cards are placed edge to edge and share the cut, so one cut serves two. More fit per sheet, but any drift shows.',
      buildingPdf: 'Building the PDF…',
      downloadPdf: 'Download PDF to print',
      pdfSizeHintBefore:
        'The PDF carries the sheet size inside, so it prints at real scale. Still, in the print dialog choose ',
      pdfSizeHintBold: '100%',
      pdfSizeHintAfter: ' or "actual size", never "fit to page".',
      cardSizeHint: (w, h) => `Each loose card comes out at ${w} × ${h} px — 63.5 × 88 mm at double 300 DPI.`,
    },
    errors: {
      openFailed: "Couldn't open the file.",
      artFailed: "Couldn't load the image.",
      sheetFailed: "Couldn't build the sheet.",
      iconFailed: "Couldn't load the icon.",
      permissionDenied: (fileName) =>
        `Chrome needs permission to write to ${fileName}. Press Save again and choose "Edit file", or use Save as… to pick another.`,
      'not-a-card': () => "The file isn't a Dune: Imperium card.",
      'no-cards': () => 'The file has no cards.',
      'empty-image': ({ name }) => `The image is empty: ${name}`,
      'read-failed': ({ name }) => `Couldn't read the file: ${name}`,
      'invalid-image': ({ name }) => `Not a valid image: ${name}`,
      'canvas-failed': () => "The browser couldn't prepare the image.",
      'png-failed': () => "The browser couldn't generate the PNG.",
      'sheet-canvas-failed': () => "The browser couldn't prepare the sheet.",
      'sheet-read-failed': () => "The browser couldn't read the sheet.",
      'card-canvas-failed': () => "Couldn't prepare the card canvas.",
    },
  },
}

/** El texto de una cantidad de cartas, con el número adelante. */
export function pluralCards(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 card' : `${n} cards`
  return n === 1 ? '1 carta' : `${n} cartas`
}

/** Sólo la palabra, para cuando el número ya va aparte en el texto. */
export function cardWord(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? 'card' : 'cards'
  return n === 1 ? 'carta' : 'cartas'
}

/** Cuántas cartas están marcadas como terminadas, con el número adelante. */
export function pluralDone(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 finished' : `${n} finished`
  return n === 1 ? '1 terminada' : `${n} terminadas`
}

export const useT = (): Strings => STRINGS[useLanguage().language]

export const stringsFor = (language: Language): Strings => STRINGS[language]

/**
 * Traduce lo que se le puede mostrar al usuario: un `AppError` con su código,
 * o cualquier otro `Error` cuyo mensaje ya viene armado (los que tira el propio
 * navegador, por ejemplo `DOMException`) — ésos se muestran tal cual porque no
 * hay forma de traducir algo que no se vio venir.
 */
export function describeError(cause: unknown, language: Language, fallback: string): string {
  if (cause instanceof AppError) return STRINGS[language].errors[cause.code](cause.params)
  return cause instanceof Error ? cause.message : fallback
}
