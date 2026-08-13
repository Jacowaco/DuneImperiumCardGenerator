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
    exporting: string
    export: string
    defaultFileName: string
    language: string
    undo: string
    redo: string
  }
  tabs: { front: string; rules: string }
  doneBanner: { locked: string; unlock: string }
  doneBadge: { done: string; markDone: string; reopenTitle: string; markDoneTitle: string }
  dialogs: { icons: string; factions: string; print: string }
  deckFooter: {
    deckGroup: string
    libraryGroup: string
    unsavedName: string
    renameTitle: string
    noNativeFsTooltip: string
    noNativeFsBadge: string
    new: string
    confirmNew: string
    open: string
    save: string
    saveAs: string
    icons: string
    factions: string
    print: string
    exportAll: string
    exportingAll: string
  }
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
    agentIcons: string
  }
  contentEditor: {
    empty: string
    textPlaceholder: string
    lineBreak: string
    deletedIcon: string
    addTo: string
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
    playTurn: string
    autoAdjust: string
    agentSilhouette: string
    reveal: string
    contentHint: string
  }
  artPanel: {
    image: string
    changeImage: string
    chooseImage: string
    remove: string
    dragHint: string
    zoom: string
    fit: string
    center: string
    dragZoomHint: string
    placeholder: string
    frame: string
    frameFree: string
    frameLocked: string
    lockedHint: string
  }
  iconPanel: {
    deckTitle: string
    deckHint: string
    libraryTitle: string
    libraryHint: string
    emptyLibraryHint: string
    usedIn: (cards: number) => string
    unused: string
    alreadyInDeck: string
    toLibraryLabel: (label: string) => string
    toDeckLabel: (label: string) => string
    forgetLabel: (label: string) => string
    confirmRemoveFromLibrary: (label: string) => string
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
  factionPanel: {
    deckTitle: string
    deckHint: string
    libraryTitle: string
    libraryHint: string
    emptyLibraryHint: string
    usedIn: (cards: number) => string
    unused: string
    alreadyInDeck: string
    toLibraryLabel: (label: string) => string
    toDeckLabel: (label: string) => string
    forgetLabel: (label: string) => string
    confirmRemoveFromLibrary: (label: string) => string
    emptyHint: string
    nameLabel: (label: string) => string
    colorTitle: string
    colorLabel: (label: string) => string
    hexLabel: (label: string) => string
    upload: string
    hint: string
    confirmRemove: (label: string, used: number) => string
    removeLabel: (label: string) => string
  }
  libraryFile: {
    export: string
    exportTitle: string
    import: string
    importTitle: string
    imported: (icons: number, factions: number) => string
  }
  printPanel: {
    perSheetSuffix: string
    fitsOnOne: string
    spansPages: (pages: number) => string
    copies: string
    copiesOtherValue: string
    copiesDecrease: string
    copiesIncrease: string
    copiesHint: (total: number) => string
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
    cardsFailed: string
    iconFailed: string
    permissionDenied: (fileName: string) => string
  }
}

const STRINGS: Record<Language, Strings> = {
  es: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Exportando…',
      export: 'Exportar PNG',
      defaultFileName: 'carta',
      language: 'Idioma',
      undo: 'Deshacer (Ctrl+Z)',
      redo: 'Rehacer (Ctrl+Mayús+Z)',
    },
    tabs: { front: 'Identidad', rules: 'Reglas' },
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
    dialogs: { icons: 'Iconos propios', factions: 'Facciones propias', print: 'Imprimir el mazo' },
    deckFooter: {
      deckGroup: 'Mazo',
      libraryGroup: 'Biblioteca',
      unsavedName: 'Mazo sin guardar',
      renameTitle: 'Cambiarle el nombre al mazo',
      noNativeFsTooltip:
        'Acá no se pueden sobrescribir archivos, así que «Guardar» y «Guardar como…» bajan una copia nueva. La API sólo está en Chrome y Edge, y no en la vista previa embebida del editor: abriendo la app en una ventana del navegador, «Guardar» escribe sobre el archivo abierto sin preguntar.',
      noNativeFsBadge: 'Acá «Guardar» baja una copia',
      new: 'Nuevo',
      confirmNew:
        'Hay cambios sin guardar en este mazo. ¿Empezar un mazo nuevo de todas formas?',
      open: 'Abrir…',
      save: 'Guardar',
      saveAs: 'Guardar como…',
      icons: 'Iconos…',
      factions: 'Facciones…',
      print: 'Imprimir…',
      exportAll: 'Exportar PNGs…',
      exportingAll: 'Exportando…',
    },
    gallery: {
      title: 'Mazo',
      newCardTitle: 'Carta nueva',
      newButton: 'Nueva carta',
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
      startingCard: 'Inicial',
      faction: 'Facción',
      factionHint:
        'Se apilan hacia abajo en este mismo orden, sin importar en qué orden las elijas. Hasta 4 por carta.',
      cost: 'Costo de compra',
      hasCost: 'Tiene costo',
      persuasion: 'Persuasión',
      purchaseBenefit: 'Beneficio de compra',
      none: 'Ninguno',
      custom: (label) => `Propio · ${label}`,
      amount: 'Cantidad',
      otherValue: 'Otro valor',
      agentIcons: 'Iconos de agente',
    },
    contentEditor: {
      empty: 'Caja vacía.',
      textPlaceholder: 'Texto…',
      lineBreak: '— corte de renglón —',
      deletedIcon: 'Icono borrado',
      addTo: 'Agregar a',
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
      playTurn: 'Turno de agente',
      autoAdjust: 'Alto automático',
      agentSilhouette: 'Silueta del agente',
      reveal: 'Revelación',
      contentHint: 'Arrastrá iconos, texto y renglones para agregarlos o para reordenarlos.',
    },
    artPanel: {
      image: 'Imagen',
      changeImage: 'Cambiar imagen…',
      chooseImage: 'Elegir imagen…',
      remove: 'Quitar',
      dragHint: 'También podés arrastrar un archivo sobre la carta.',
      zoom: 'Zoom',
      fit: 'Ajustar',
      center: 'Centrar',
      dragZoomHint: 'Arrastrá la imagen sobre la carta para moverla; la rueda hace zoom.',
      placeholder: 'Arrastrá una imagen acá\no tocá para elegirla',
      frame: 'Encuadre',
      frameFree: 'Encuadre libre',
      frameLocked: 'Encuadre bloqueado',
      lockedHint: 'Encuadre bloqueado: desbloqueálo para mover o hacer zoom.',
    },
    iconPanel: {
      deckTitle: 'En este mazo',
      deckHint:
        'Los que este mazo tiene disponibles: son los que ofrece el selector de las cajas y los que viajan adentro del archivo, así que el mazo se ve igual en otra máquina. El tamaño y el nombre son de acá y no tocan la biblioteca.',
      libraryTitle: 'Mi biblioteca',
      libraryHint:
        'Los que subiste alguna vez, guardados en este navegador. No viajan con el mazo y no se dibujan: es de donde copiar para no volver a subir lo mismo en cada mazo.',
      emptyLibraryHint: 'Todavía no guardaste ningún icono en la biblioteca.',
      usedIn: (cards) => `En ${pluralCards(cards, 'es')}`,
      unused: 'Sin usar',
      alreadyInDeck: 'Ya está en el mazo',
      toLibraryLabel: (label) => `Guardar ${label} en mi biblioteca`,
      toDeckLabel: (label) => `Traer ${label} a este mazo`,
      forgetLabel: (label) => `Sacar ${label} de mi biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sale de tu biblioteca y no vas a poder traerlo a otros mazos. Los mazos que ya lo tienen adentro no cambian. ¿Sacarlo?`,
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
    factionPanel: {
      deckTitle: 'En este mazo',
      deckHint:
        'Las que este mazo tiene disponibles: son las que ofrece el selector de facción y las que viajan adentro del archivo. El nombre y el color son de acá y no tocan la biblioteca.',
      libraryTitle: 'Mi biblioteca',
      libraryHint:
        'Las que armaste alguna vez, guardadas en este navegador. No viajan con el mazo: es de donde copiar para no volver a subir el emblema en cada mazo.',
      emptyLibraryHint: 'Todavía no guardaste ninguna facción en la biblioteca.',
      usedIn: (cards) => `En ${pluralCards(cards, 'es')}`,
      unused: 'Sin usar',
      alreadyInDeck: 'Ya está en el mazo',
      toLibraryLabel: (label) => `Guardar ${label} en mi biblioteca`,
      toDeckLabel: (label) => `Traer ${label} a este mazo`,
      forgetLabel: (label) => `Sacar ${label} de mi biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sale de tu biblioteca y no vas a poder traerla a otros mazos. Los mazos que ya la tienen adentro no cambian. ¿Sacarla?`,
      emptyHint:
        'Para mazos con facciones que el juego no trae. Quedan disponibles en todos tus mazos, y generan solas los 4 rombos de "+1/-1 Influencia" de esa facción para usar en el contenido de una carta.',
      nameLabel: (label) => `Nombre de ${label}`,
      colorTitle: 'Color de la banda',
      colorLabel: (label) => `Color de la banda de ${label}`,
      hexLabel: (label) => `Color de la banda de ${label} en hexadecimal`,
      upload: 'Subir emblema…',
      hint: 'PNG con transparencia, se recorta solo al contenido. Quedan guardadas en este navegador, y el mazo se lleva adentro las que sus cartas usan. Como icono de agente van sobre una placa negra simple, sin el marco de las del reglamento.',
      confirmRemove: (label, used) =>
        `«${label}» está en ${pluralCards(used, 'es')} de este mazo. Si la borrás, esas cartas pierden la banda, el icono de agente o el rombo que la nombra.`,
      removeLabel: (label) => `Borrar ${label}`,
    },
    libraryFile: {
      export: 'Exportar…',
      exportTitle:
        'Guarda tu biblioteca entera —iconos y facciones— en un archivo, para llevarla a otra computadora o tener una copia. La biblioteca vive en este navegador nada más.',
      import: 'Importar…',
      importTitle:
        'Trae a tu biblioteca lo que tenga un archivo de biblioteca. Lo que ya tenías con el mismo id se conserva como está.',
      imported: (icons, factions) =>
        `Se sumaron ${pluralIcons(icons, 'es')} y ${pluralFactions(factions, 'es')} a tu biblioteca.`,
    },
    printPanel: {
      perSheetSuffix: 'por hoja.',
      fitsOnOne: 'El mazo entra en una.',
      spansPages: (pages) => `El mazo ocupa ${pages}.`,
      copies: 'Copias por carta',
      copiesOtherValue: 'Otra cantidad',
      copiesDecrease: 'Restar una copia',
      copiesIncrease: 'Sumar una copia',
      copiesHint: (total) => `${pluralCards(total, 'es')} en total.`,
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
      cardsFailed: 'No se pudieron exportar las cartas.',
      iconFailed: 'No se pudo cargar el icono.',
      permissionDenied: (fileName) =>
        `Chrome pide permiso para escribir sobre ${fileName}. Apretá Guardar de nuevo y elegí «Editar archivo», o usá Guardar como… para elegir otro.`,
      'not-a-card': () => 'El archivo no es una carta de Dune: Imperium.',
      'not-a-library': () => 'Ese archivo no es una biblioteca de Dune: Imperium.',
      'empty-library': () => 'Esa biblioteca no tiene iconos ni facciones adentro.',
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
      exporting: 'Exporting…',
      export: 'Export PNG',
      defaultFileName: 'card',
      language: 'Language',
      undo: 'Undo (Ctrl+Z)',
      redo: 'Redo (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Identity', rules: 'Rules' },
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
    dialogs: { icons: 'Custom icons', factions: 'Custom factions', print: 'Print the deck' },
    deckFooter: {
      deckGroup: 'Deck',
      libraryGroup: 'Library',
      unsavedName: 'Unsaved deck',
      renameTitle: 'Rename the deck',
      noNativeFsTooltip:
        'Files can\'t be overwritten here, so "Save" and "Save as…" download a new copy. The API only exists in Chrome and Edge, and not in the editor\'s embedded preview: opening the app in a browser window makes "Save" write to the open file without asking.',
      noNativeFsBadge: 'Here, "Save" downloads a copy',
      new: 'New',
      confirmNew: 'This deck has unsaved changes. Start a new deck anyway?',
      open: 'Open…',
      save: 'Save',
      saveAs: 'Save as…',
      icons: 'Icons…',
      factions: 'Factions…',
      print: 'Print…',
      exportAll: 'Export PNGs…',
      exportingAll: 'Exporting…',
    },
    gallery: {
      title: 'Deck',
      newCardTitle: 'New card',
      newButton: 'New card',
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
      startingCard: 'Starting',
      faction: 'Faction',
      factionHint:
        'They stack downward in this same order, no matter what order you pick them in. Up to 4 per card.',
      cost: 'Acquire Cost',
      hasCost: 'Has a cost',
      persuasion: 'Persuasion',
      purchaseBenefit: 'Acquire Bonus',
      none: 'None',
      custom: (label) => `Custom · ${label}`,
      amount: 'Amount',
      otherValue: 'Custom value',
      agentIcons: 'Agent Icons',
    },
    contentEditor: {
      empty: 'Empty box.',
      textPlaceholder: 'Text…',
      lineBreak: '— line break —',
      deletedIcon: 'Deleted icon',
      addTo: 'Add to',
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
      playTurn: 'Agent Turn',
      autoAdjust: 'Auto height',
      agentSilhouette: 'Agent Silhouette',
      reveal: 'Reveal',
      contentHint: 'Drag icons, text and line breaks to add them or to reorder them.',
    },
    artPanel: {
      image: 'Image',
      changeImage: 'Change image…',
      chooseImage: 'Choose image…',
      remove: 'Remove',
      dragHint: 'You can also drag a file onto the card.',
      zoom: 'Zoom',
      fit: 'Fit',
      center: 'Center',
      dragZoomHint: 'Drag the image over the card to move it; the wheel zooms.',
      placeholder: 'Drag an image here\nor tap to choose one',
      frame: 'Frame',
      frameFree: 'Free frame',
      frameLocked: 'Frame locked',
      lockedHint: 'Frame locked: unlock it to move or zoom.',
    },
    iconPanel: {
      deckTitle: 'En este mazo',
      deckHint:
        'Los que este mazo tiene disponibles: son los que ofrece el selector de las cajas y los que viajan adentro del archivo, así que el mazo se ve igual en otra máquina. El tamaño y el nombre son de acá y no tocan la biblioteca.',
      libraryTitle: 'Mi biblioteca',
      libraryHint:
        'Los que subiste alguna vez, guardados en este navegador. No viajan con el mazo y no se dibujan: es de donde copiar para no volver a subir lo mismo en cada mazo.',
      emptyLibraryHint: 'Todavía no guardaste ningún icono en la biblioteca.',
      usedIn: (cards) => `En ${pluralCards(cards, 'es')}`,
      unused: 'Sin usar',
      alreadyInDeck: 'Ya está en el mazo',
      toLibraryLabel: (label) => `Guardar ${label} en mi biblioteca`,
      toDeckLabel: (label) => `Traer ${label} a este mazo`,
      forgetLabel: (label) => `Sacar ${label} de mi biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sale de tu biblioteca y no vas a poder traerlo a otros mazos. Los mazos que ya lo tienen adentro no cambian. ¿Sacarlo?`,
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
    factionPanel: {
      deckTitle: 'En este mazo',
      deckHint:
        'Las que este mazo tiene disponibles: son las que ofrece el selector de facción y las que viajan adentro del archivo. El nombre y el color son de acá y no tocan la biblioteca.',
      libraryTitle: 'Mi biblioteca',
      libraryHint:
        'Las que armaste alguna vez, guardadas en este navegador. No viajan con el mazo: es de donde copiar para no volver a subir el emblema en cada mazo.',
      emptyLibraryHint: 'Todavía no guardaste ninguna facción en la biblioteca.',
      usedIn: (cards) => `En ${pluralCards(cards, 'es')}`,
      unused: 'Sin usar',
      alreadyInDeck: 'Ya está en el mazo',
      toLibraryLabel: (label) => `Guardar ${label} en mi biblioteca`,
      toDeckLabel: (label) => `Traer ${label} a este mazo`,
      forgetLabel: (label) => `Sacar ${label} de mi biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sale de tu biblioteca y no vas a poder traerla a otros mazos. Los mazos que ya la tienen adentro no cambian. ¿Sacarla?`,
      emptyHint:
        "For decks with factions the game doesn't include. They stay available in all your decks, and their emblem alone generates the 4 \"+1/-1 Influence\" diamonds for that faction, ready to use as card content.",
      nameLabel: (label) => `Name of ${label}`,
      colorTitle: 'Band color',
      colorLabel: (label) => `Band color for ${label}`,
      hexLabel: (label) => `Band color for ${label} in hex`,
      upload: 'Upload emblem…',
      hint: "Transparent PNG, auto-cropped to content. They're saved in this browser, and the deck carries along the ones its cards use. As an agent icon they sit on a plain black plate, without the frame the rulebook ones have.",
      confirmRemove: (label, used) =>
        `"${label}" is used in ${pluralCards(used, 'en')} of this deck. Deleting it removes the band, agent icon, or diamond that names it from those cards.`,
      removeLabel: (label) => `Delete ${label}`,
    },
    libraryFile: {
      export: 'Export…',
      exportTitle:
        'Saves your whole library —icons and factions— to a file, to carry it to another computer or keep a backup. The library lives in this browser only.',
      import: 'Import…',
      importTitle:
        'Brings whatever a library file carries into your library. Anything you already had under the same id is kept as it is.',
      imported: (icons, factions) =>
        `Added ${pluralIcons(icons, 'en')} and ${pluralFactions(factions, 'en')} to your library.`,
    },
    printPanel: {
      perSheetSuffix: 'per sheet.',
      fitsOnOne: 'The deck fits on one.',
      spansPages: (pages) => `The deck spans ${pages}.`,
      copies: 'Copies per card',
      copiesOtherValue: 'Custom amount',
      copiesDecrease: 'Remove one copy',
      copiesIncrease: 'Add one copy',
      copiesHint: (total) => `${pluralCards(total, 'en')} in total.`,
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
      cardsFailed: "Couldn't export the cards.",
      iconFailed: "Couldn't load the icon.",
      permissionDenied: (fileName) =>
        `Chrome needs permission to write to ${fileName}. Press Save again and choose "Edit file", or use Save as… to pick another.`,
      'not-a-card': () => "The file isn't a Dune: Imperium card.",
      'not-a-library': () => "That file isn't a Dune: Imperium library.",
      'empty-library': () => 'That library has no icons or factions inside.',
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
  pt: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Exportando…',
      export: 'Exportar PNG',
      defaultFileName: 'carta',
      language: 'Idioma',
      undo: 'Desfazer (Ctrl+Z)',
      redo: 'Refazer (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Identidade', rules: 'Regras' },
    doneBanner: {
      locked: 'Carta finalizada, bloqueada para não ser alterada por engano.',
      unlock: 'Desbloquear',
    },
    doneBadge: {
      done: '✓ Finalizada',
      markDone: 'Marcar como finalizada',
      reopenTitle: 'Finalizada — clique para reabrir',
      markDoneTitle: 'Marcar como finalizada',
    },
    dialogs: { icons: 'Ícones próprios', factions: 'Facções próprias', print: 'Imprimir o baralho' },
    deckFooter: {
      deckGroup: 'Baralho',
      libraryGroup: 'Biblioteca',
      unsavedName: 'Baralho não salvo',
      renameTitle: 'Renomear o baralho',
      noNativeFsTooltip:
        'Aqui não é possível sobrescrever arquivos, então «Salvar» e «Salvar como…» baixam uma cópia nova. A API só existe no Chrome e no Edge, e não na prévia incorporada do editor: abrindo o app numa janela do navegador, «Salvar» grava no arquivo aberto sem perguntar.',
      noNativeFsBadge: 'Aqui, «Salvar» baixa uma cópia',
      new: 'Novo',
      confirmNew:
        'Este baralho tem alterações não salvas. Começar um baralho novo mesmo assim?',
      open: 'Abrir…',
      save: 'Salvar',
      saveAs: 'Salvar como…',
      icons: 'Ícones…',
      factions: 'Facções…',
      print: 'Imprimir…',
      exportAll: 'Exportar PNGs…',
      exportingAll: 'Exportando…',
    },
    gallery: {
      title: 'Baralho',
      newCardTitle: 'Carta nova',
      newButton: 'Nova carta',
      unnamed: 'Sem nome',
      duplicate: 'Duplicar',
      remove: 'Excluir',
      doneStamp: 'Finalizada',
      reopenTitle: 'Finalizada — clique para reabrir',
      markDoneTitle: 'Marcar como finalizada',
      markPendingAria: 'Marcar como pendente',
    },
    cardPanel: {
      name: 'Nome',
      namePlaceholder: 'Duncan Idaho',
      startingCard: 'Inicial',
      faction: 'Facção',
      factionHint:
        'Empilham para baixo nessa mesma ordem, não importa em que ordem você as escolha. Até 4 por carta.',
      cost: 'Custo de aquisição',
      hasCost: 'Tem custo',
      persuasion: 'Persuasão',
      purchaseBenefit: 'Bônus de aquisição',
      none: 'Nenhum',
      custom: (label) => `Próprio · ${label}`,
      amount: 'Quantidade',
      otherValue: 'Outro valor',
      agentIcons: 'Ícones de agente',
    },
    contentEditor: {
      empty: 'Caixa vazia.',
      textPlaceholder: 'Texto…',
      lineBreak: '— quebra de linha —',
      deletedIcon: 'Ícone excluído',
      addTo: 'Adicionar a',
      close: 'Fechar',
      addIcon: 'Ícone…',
      addText: 'Texto',
      addLineBreak: 'Quebra de linha',
      remove: 'Remover',
      custom: 'Próprios',
      core: 'Dune Imperium',
      influence: 'Influência por facção',
      decrease: (label) => `Diminuir ${label}`,
      increase: (label) => `Aumentar ${label}`,
    },
    rulesPanel: {
      playTurn: 'Turno de agente',
      autoAdjust: 'Altura automática',
      agentSilhouette: 'Silhueta do agente',
      reveal: 'Revelação',
      contentHint: 'Arraste ícones, texto e quebras de linha para adicioná-los ou reordená-los.',
    },
    artPanel: {
      image: 'Imagem',
      changeImage: 'Trocar imagem…',
      chooseImage: 'Escolher imagem…',
      remove: 'Remover',
      dragHint: 'Você também pode arrastar um arquivo sobre a carta.',
      zoom: 'Zoom',
      fit: 'Ajustar',
      center: 'Centralizar',
      dragZoomHint: 'Arraste a imagem sobre a carta para movê-la; a roda faz zoom.',
      placeholder: 'Arraste uma imagem aqui\nou toque para escolher',
      frame: 'Moldura',
      frameFree: 'Moldura livre',
      frameLocked: 'Moldura bloqueada',
      lockedHint: 'Moldura bloqueada: desbloqueie-a para mover ou ampliar.',
    },
    iconPanel: {
      deckTitle: 'En este mazo',
      deckHint:
        'Los que este mazo tiene disponibles: son los que ofrece el selector de las cajas y los que viajan adentro del archivo, así que el mazo se ve igual en otra máquina. El tamaño y el nombre son de acá y no tocan la biblioteca.',
      libraryTitle: 'Mi biblioteca',
      libraryHint:
        'Los que subiste alguna vez, guardados en este navegador. No viajan con el mazo y no se dibujan: es de donde copiar para no volver a subir lo mismo en cada mazo.',
      emptyLibraryHint: 'Todavía no guardaste ningún icono en la biblioteca.',
      usedIn: (cards) => `En ${pluralCards(cards, 'es')}`,
      unused: 'Sin usar',
      alreadyInDeck: 'Ya está en el mazo',
      toLibraryLabel: (label) => `Guardar ${label} en mi biblioteca`,
      toDeckLabel: (label) => `Traer ${label} a este mazo`,
      forgetLabel: (label) => `Sacar ${label} de mi biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sale de tu biblioteca y no vas a poder traerlo a otros mazos. Los mazos que ya lo tienen adentro no cambian. ¿Sacarlo?`,
      emptyHint:
        'Para regras que o jogo não traz. Ficam disponíveis em todos os seus baralhos e aparecem no final do seletor de ícones.',
      nameLabel: (label) => `Nome de ${label}`,
      heightTitle: 'Altura na carta, em % do ícone do jogo',
      heightLabel: (label) => `Altura de ${label} na carta, em % do ícone do jogo`,
      decreaseHeightLabel: (label) => `Diminuir ${label}`,
      increaseHeightLabel: (label) => `Aumentar ${label}`,
      showNumberText: 'Número',
      showNumberLabel: (label) => `Mostrar número sobre ${label}`,
      numberColorTitle: 'Cor do número',
      numberColorLabel: (label) => `Cor do número de ${label}`,
      upload: 'Enviar ícone…',
      hint: 'PNGs com transparência, recortados automaticamente ao conteúdo. O % é a altura na carta comparada a um ícone do jogo. Ficam salvos neste navegador, e o baralho leva junto os que suas cartas usam.',
      confirmRemove: (label, used) =>
        `«${label}» está em ${pluralCards(used, 'pt')} deste baralho. Se você excluir, essas cartas o perdem.`,
      removeLabel: (label) => `Excluir ${label}`,
    },
    factionPanel: {
      deckTitle: 'En este mazo',
      deckHint:
        'Las que este mazo tiene disponibles: son las que ofrece el selector de facción y las que viajan adentro del archivo. El nombre y el color son de acá y no tocan la biblioteca.',
      libraryTitle: 'Mi biblioteca',
      libraryHint:
        'Las que armaste alguna vez, guardadas en este navegador. No viajan con el mazo: es de donde copiar para no volver a subir el emblema en cada mazo.',
      emptyLibraryHint: 'Todavía no guardaste ninguna facción en la biblioteca.',
      usedIn: (cards) => `En ${pluralCards(cards, 'es')}`,
      unused: 'Sin usar',
      alreadyInDeck: 'Ya está en el mazo',
      toLibraryLabel: (label) => `Guardar ${label} en mi biblioteca`,
      toDeckLabel: (label) => `Traer ${label} a este mazo`,
      forgetLabel: (label) => `Sacar ${label} de mi biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sale de tu biblioteca y no vas a poder traerla a otros mazos. Los mazos que ya la tienen adentro no cambian. ¿Sacarla?`,
      emptyHint:
        'Para baralhos com facções que o jogo não traz. Ficam disponíveis em todos os seus baralhos, e o emblema sozinho gera os 4 losangos de "+1/-1 Influência" dessa facção, prontos para usar como conteúdo de carta.',
      nameLabel: (label) => `Nome de ${label}`,
      colorTitle: 'Cor da faixa',
      colorLabel: (label) => `Cor da faixa de ${label}`,
      hexLabel: (label) => `Cor da faixa de ${label} em hexadecimal`,
      upload: 'Enviar emblema…',
      hint: 'PNG com transparência, recortado automaticamente ao conteúdo. Ficam salvas neste navegador, e o baralho leva junto as que suas cartas usam. Como ícone de agente ficam sobre uma placa preta simples, sem a moldura das do regulamento.',
      confirmRemove: (label, used) =>
        `«${label}» está em ${pluralCards(used, 'pt')} deste baralho. Se você excluir, essas cartas perdem a faixa, o ícone de agente ou o losango que a nomeia.`,
      removeLabel: (label) => `Excluir ${label}`,
    },
    libraryFile: {
      export: 'Exportar…',
      exportTitle:
        'Salva sua biblioteca inteira —ícones e facções— em um arquivo, para levá-la a outro computador ou ter uma cópia. A biblioteca vive só neste navegador.',
      import: 'Importar…',
      importTitle:
        'Traz para a sua biblioteca o que um arquivo de biblioteca tiver. O que você já tinha com o mesmo id fica como está.',
      imported: (icons, factions) =>
        `Foram somados ${pluralIcons(icons, 'pt')} e ${pluralFactions(factions, 'pt')} à sua biblioteca.`,
    },
    printPanel: {
      perSheetSuffix: 'por folha.',
      fitsOnOne: 'O baralho cabe em uma.',
      spansPages: (pages) => `O baralho ocupa ${pages}.`,
      copies: 'Cópias por carta',
      copiesOtherValue: 'Outra quantidade',
      copiesDecrease: 'Tirar uma cópia',
      copiesIncrease: 'Somar uma cópia',
      copiesHint: (total) => `${pluralCards(total, 'pt')} no total.`,
      bleedToggle: 'Sangria de 3 mm (gráfica)',
      bleedOnHint:
        'Cada carta é desenhada 3 mm maior em preto de cada lado e cortada sozinha: se a guilhotina desviar, sai preto em vez de uma borda branca. Cabem menos por folha.',
      bleedOffHint:
        'As cartas ficam coladas e compartilham o corte, então um corte serve para duas. Cabem mais por folha, mas qualquer desvio aparece.',
      buildingPdf: 'Montando o PDF…',
      downloadPdf: 'Baixar PDF para imprimir',
      pdfSizeHintBefore:
        'O PDF leva o tamanho da folha embutido, então imprime em escala real. Mesmo assim, na caixa de diálogo de impressão escolha ',
      pdfSizeHintBold: '100%',
      pdfSizeHintAfter: ' ou «tamanho real», nunca «ajustar à página».',
      cardSizeHint: (w, h) => `Cada carta solta sai em ${w} × ${h} px — 63,5 × 88 mm ao dobro de 300 DPI.`,
    },
    errors: {
      openFailed: 'Não foi possível abrir o arquivo.',
      artFailed: 'Não foi possível carregar a imagem.',
      sheetFailed: 'Não foi possível montar a folha.',
      cardsFailed: 'Não foi possível exportar as cartas.',
      iconFailed: 'Não foi possível carregar o ícone.',
      permissionDenied: (fileName) =>
        `O Chrome pede permissão para gravar em ${fileName}. Aperte Salvar de novo e escolha «Editar arquivo», ou use Salvar como… para escolher outro.`,
      'not-a-card': () => 'O arquivo não é uma carta de Dune: Imperium.',
      'not-a-library': () => 'Esse arquivo não é uma biblioteca de Dune: Imperium.',
      'empty-library': () => 'Essa biblioteca não tem ícones nem facções dentro.',
      'no-cards': () => 'O arquivo não tem nenhuma carta.',
      'empty-image': ({ name }) => `A imagem está vazia: ${name}`,
      'read-failed': ({ name }) => `Não foi possível ler o arquivo: ${name}`,
      'invalid-image': ({ name }) => `Não é uma imagem válida: ${name}`,
      'canvas-failed': () => 'O navegador não conseguiu preparar a imagem.',
      'png-failed': () => 'O navegador não conseguiu gerar o PNG.',
      'sheet-canvas-failed': () => 'O navegador não conseguiu preparar a folha.',
      'sheet-read-failed': () => 'O navegador não conseguiu ler a folha.',
      'card-canvas-failed': () => 'Não foi possível preparar a tela da carta.',
    },
  },
}

/** El texto de una cantidad de cartas, con el número adelante. */
/**
 * Los dos números del aviso de "biblioteca importada". Van juntos y no en
 * `Strings` porque son la misma cuenta en los tres idiomas: singular o plural
 * de dos palabras.
 */
export function pluralIcons(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 icon' : `${n} icons`
  if (language === 'pt') return n === 1 ? '1 ícone' : `${n} ícones`
  return n === 1 ? '1 icono' : `${n} iconos`
}

export function pluralFactions(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 faction' : `${n} factions`
  if (language === 'pt') return n === 1 ? '1 facção' : `${n} facções`
  return n === 1 ? '1 facción' : `${n} facciones`
}

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
  if (language === 'pt') return n === 1 ? '1 finalizada' : `${n} finalizadas`
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
