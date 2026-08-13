import { AppError, type ErrorCode } from '../model/errors'
import { useLanguage, type Language } from '../model/language'

/**
 * Catálogo de textos de la UI, aparte de los datos del juego (facciones,
 * iconos, papeles), que se traducen donde viven —`card.ts`, `agents.ts`,
 * `influence.ts`, `assets/icons/index.ts`, `paper.ts`— porque además de la UI
 * los necesita el render de la carta o el catálogo de iconos.
 *
 * Es un objeto por idioma y no un diccionario `clave -> {es, en, …}`: así
 * TypeScript obliga a que todos los idiomas tengan exactamente los mismos
 * campos, con el mismo tipo — a una función le falta un parámetro en un solo
 * idioma y ya no compila.
 */
type Strings = {
  topBar: {
    title: string
    subtitle: string
    exporting: string
    export: string
    /**
     * El formato va en el título y no en la etiqueta: lo que distingue este
     * botón del del pie del mazo es el alcance —esta carta contra el mazo
     * entero—, y cuando los dos decían «Exportar PNG(s)» se confundían.
     */
    exportTitle: string
    defaultFileName: string
    language: string
    undo: string
    redo: string
  }
  tabs: { front: string; rules: string }
  doneBanner: { locked: string; unlock: string }
  doneBadge: { done: string; markDone: string; reopenTitle: string; markDoneTitle: string }
  dialogs: { icons: string; factions: string; print: string; about: string; close: string }
  /**
   * El descargo: esto es un proyecto de fans y las marcas son de otros. Va
   * entero acá y no en un `<p>` suelto del componente porque, como cualquier
   * texto de la UI, tiene que verse en los tres idiomas.
   */
  about: {
    fanMade: string
    ownership: string
    notAffiliated: string
    personalUse: string
    takedown: string
    source: string
  }
  deckFooter: {
    deckGroup: string
    libraryGroup: string
    libraryGroupHint: string
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
    /** Igual que `topBar.exportTitle`: el formato, que ya no va en la etiqueta. */
    exportAllTitle: string
    /**
     * Vale para los dos botones de sacar el mazo: el PDF y el zip. El número
     * de terminadas no va en la etiqueta —lo muestra el contador de la
     * derecha—, así que acá va sólo el nombre.
     */
    onlyDone: string
    onlyDoneTitle: (done: number, pending: number) => string
    onlyDoneEmpty: string
  }
  gallery: {
    /**
     * «Cartas» y no «Mazo»: el pie de esta misma columna ya se titula «Mazo»
     * —es el nombre del mazo y sus acciones de archivo—, y dos títulos iguales
     * a media columna de distancia no distinguían nada. Acá arriba lo que se
     * lista son las cartas.
     */
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
    /** El «×N» de la miniatura: cuántos ejemplares lleva el mazo. */
    copiesStamp: (copies: number) => string
  }
  cardPanel: {
    name: string
    namePlaceholder: string
    /** El tirador del nombre sobre la carta, además del campo del panel. */
    editOnCard: string
    startingCard: string
    startingCardHint: string
    faction: string
    factionHint: string
    cost: string
    hasCost: string
    persuasion: string
    /** El tirador del número del rombo sobre la carta, como el del nombre. */
    costOnCard: string
    purchaseBenefit: string
    none: string
    custom: (label: string) => string
    amount: string
    otherValue: string
    agentIcons: string
    /** Qué es el estilo Infiltración, que va de acción del título de arriba. */
    infiltrateHint: string
    copies: string
    copiesHint: string
  }
  contentEditor: {
    empty: string
    textPlaceholder: string
    /** Con qué palabra se dibuja en la carta una pieza de texto todavía vacía. */
    emptyText: string
    /** Tocar la pieza sobre la carta para escribirla ahí mismo. */
    editOnCard: string
    /** Tocar el número de un icono sobre la carta para cambiar la cantidad. */
    amountOnCard: string
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
    autoAdjustHint: string
    agentSilhouette: string
    agentSilhouetteHint: string
    reveal: string
    contentHint: string
    unload: string
    unloadHint: string
  }
  artPanel: {
    image: string
    changeImage: string
    chooseImage: string
    remove: string
    zoom: string
    fit: string
    center: string
    rotate: string
    flip: string
    dragZoomHint: string
    placeholder: string
    frame: string
    frameFree: string
    frameLocked: string
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
    /** Cuando la biblioteca todavía no tiene nombre. */
    unnamed: string
    renameTitle: string
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
    /**
     * Cuántas veces se imprime el mazo entero. Las copias de **cada carta** se
     * eligen en la carta (`cardPanel.copies`), porque son parte del mazo y
     * viajan en el archivo; esto es de esta impresión nada más.
     */
    deckCopies: string
    onlyDoneHint: (cards: number) => string
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
    /** El autoguardado no entró en el cupo del navegador. */
    autosaveFull: string
    /** Se pidió sacar el mazo con el filtro puesto y no hay ninguna terminada. */
    noneFinished: string
    permissionDenied: (fileName: string) => string
  }
}

const STRINGS: Record<Language, Strings> = {
  es: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Exportando carta…',
      export: 'Exportar carta',
      exportTitle: 'Exportar la carta abierta como PNG',
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
      done: 'Terminada',
      markDone: 'Marcar terminada',
      reopenTitle: 'Terminada — clic para reabrir',
      markDoneTitle: 'Marcar como terminada',
    },
    dialogs: {
      icons: 'Iconos propios',
      factions: 'Facciones propias',
      print: 'Imprimir el mazo',
      about: 'Acerca de',
      close: 'Cerrar',
    },
    about: {
      fanMade:
        'Este es un proyecto de fans para fans, sin fines de lucro: es gratis, no tiene publicidad y no se cobra nada por usarlo.',
      ownership:
        'Dune: Imperium, sus expansiones, su arte, sus iconos y su diseño gráfico son propiedad de Dire Wolf Digital, LLC. «Dune» y el universo de la novela pertenecen a Herbert Properties LLC. Todas las marcas y los derechos son de sus respectivos dueños.',
      notAffiliated:
        'Esta app no está afiliada a Dire Wolf Digital ni a los titulares de la marca Dune, ni cuenta con su patrocinio ni con su aprobación.',
      personalUse:
        'Las cartas que armes acá son para uso personal: jugar en casa, probar ideas y compartirlas con tu grupo. No son para venderlas ni para producirlas comercialmente. Si te gusta el juego, comprá el original y apoyá a quienes lo hicieron.',
      takedown:
        'Si tenés derechos sobre alguno de estos materiales y querés que algo se dé de baja, escribinos por el repositorio y lo resolvemos.',
      source: 'Código y contacto',
    },
    deckFooter: {
      deckGroup: 'Mazo',
      libraryGroup: 'Biblioteca',
      libraryGroupHint:
        'Tus iconos y facciones, guardados en este navegador para reusarlos entre mazos. No viajan con el archivo: traer uno lo copia al mazo, y el mazo se lleva el PNG adentro.',
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
      exportAll: 'Exportar mazo…',
      exportingAll: 'Exportando mazo…',
      exportAllTitle: 'Exportar todas las cartas como PNGs sueltos, en un zip',
      onlyDone: 'Sólo las terminadas',
      onlyDoneTitle: (done, pending) =>
        `El PDF y el zip llevan sólo las ${done} terminadas; las otras ${pending} quedan afuera.`,
      onlyDoneEmpty: 'Todavía no hay ninguna carta marcada como terminada.',
    },
    gallery: {
      title: 'Cartas',
      newCardTitle: 'Carta nueva',
      newButton: 'Nueva carta',
      unnamed: 'Sin nombre',
      duplicate: 'Duplicar',
      remove: 'Eliminar',
      doneStamp: 'Terminada',
      reopenTitle: 'Terminada — clic para reabrir',
      markDoneTitle: 'Marcar como terminada',
      markPendingAria: 'Marcar como pendiente',
      copiesStamp: (copies) => `${copies} ejemplares en el mazo`,
    },
    cardPanel: {
      name: 'Nombre',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Escribir el nombre',
      startingCard: 'Inicial',
      startingCardHint:
        'Las cartas del mazo inicial llevan un rombo antes del nombre, y el título arranca más a la derecha para dejarle lugar.',
      faction: 'Facción',
      factionHint:
        'Se apilan hacia abajo en este mismo orden, sin importar en qué orden las elijas. Hasta 4 por carta.',
      cost: 'Costo de compra',
      hasCost: 'Tiene costo',
      persuasion: 'Persuasión',
      costOnCard: 'Cambiar el costo',
      purchaseBenefit: 'Beneficio de compra',
      none: 'Ninguno',
      custom: (label) => `Propio · ${label}`,
      amount: 'Cantidad',
      otherValue: 'Otro valor',
      agentIcons: 'Iconos de agente',
      infiltrateHint:
        'Rise of Ix: el agente puede ir a un espacio que ya ocupa un rival. Son los mismos siete iconos, con otro marco.',
      copies: 'Ejemplares',
      copiesHint:
        'Cuántas veces está esta carta en el mazo. Se guarda en el archivo y lo usa la hoja de impresión; el zip de PNGs saca uno solo por carta.',
    },
    contentEditor: {
      empty: 'Caja vacía.',
      textPlaceholder: 'Texto…',
      emptyText: 'Texto',
      editOnCard: 'Escribir el texto',
      amountOnCard: 'Cambiar la cantidad',
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
      autoAdjustHint:
        'La caja tiene tres altos —1, 2 o 3 filas— y con esto queda el más chico donde entre el contenido. Apagalo para fijarlo a mano.',
      agentSilhouette: 'Silueta del agente',
      agentSilhouetteHint:
        'La figura que va detrás del contenido de la caja. En la carta terminada los iconos la tapan casi entera: sola se ve más marcada de lo que se va a ver después.',
      reveal: 'Revelación',
      contentHint: 'Arrastrá iconos, texto y renglones para agregarlos o para reordenarlos.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: la revelación también se cobra al descartar y al destruir la carta. La banderola ocupa el arranque de la banda, así que el contenido entra más angosto.',
    },
    artPanel: {
      image: 'Imagen',
      changeImage: 'Cambiar imagen…',
      chooseImage: 'Elegir imagen…',
      remove: 'Quitar',
      zoom: 'Zoom',
      fit: 'Ajustar',
      center: 'Centrar',
      rotate: 'Girar un cuarto de vuelta',
      flip: 'Espejar',
      dragZoomHint:
        'Arrastrá la imagen sobre la carta para moverla; la rueda hace zoom. También podés pegar una imagen con Ctrl+V.',
      placeholder: 'Arrastrá una imagen acá\no tocá para elegirla',
      frame: 'Encuadre',
      frameFree: 'Encuadre libre',
      frameLocked: 'Encuadre bloqueado',
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
      unnamed: 'Biblioteca sin nombre',
      renameTitle: 'Ponerle nombre a tu biblioteca',
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
      deckCopies: 'Copias del mazo entero',
      onlyDoneHint: (cards) =>
        `Se imprimen sólo las terminadas: ${pluralCards(cards, 'es')} del mazo.`,
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
      autosaveFull:
        'El mazo no entra en el guardado automático del navegador: si recargás la página, se pierde lo que no hayas guardado. Guardalo en un archivo.',
      noneFinished: 'No hay ninguna carta terminada para sacar. Destildá «Sólo las terminadas».',
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
      exporting: 'Exporting card…',
      export: 'Export card',
      exportTitle: 'Export the open card as a PNG',
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
      done: 'Finished',
      markDone: 'Mark finished',
      reopenTitle: 'Finished — click to reopen',
      markDoneTitle: 'Mark as finished',
    },
    dialogs: {
      icons: 'Custom icons',
      factions: 'Custom factions',
      print: 'Print the deck',
      about: 'About',
      close: 'Close',
    },
    about: {
      fanMade:
        'This is a fan project, made by fans for fans and not for profit: it is free, it carries no ads and nothing is charged for using it.',
      ownership:
        'Dune: Imperium, its expansions, artwork, icons and graphic design are property of Dire Wolf Digital, LLC. “Dune” and the universe of the novel belong to Herbert Properties LLC. All trademarks and rights belong to their respective owners.',
      notAffiliated:
        'This app is not affiliated with, sponsored by or endorsed by Dire Wolf Digital or the holders of the Dune trademark.',
      personalUse:
        'The cards you build here are for personal use: playing at home, trying out ideas and sharing them with your group. They are not meant to be sold or produced commercially. If you enjoy the game, buy the original and support the people who made it.',
      takedown:
        'If you hold rights over any of this material and want something taken down, get in touch through the repository and it will be sorted out.',
      source: 'Source code and contact',
    },
    deckFooter: {
      deckGroup: 'Deck',
      libraryGroup: 'Library',
      libraryGroupHint:
        "Your own icons and factions, kept in this browser so you can reuse them across decks. They don't travel with the file: bringing one in copies it into the deck, and the deck carries the PNG inside.",
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
      exportAll: 'Export deck…',
      exportingAll: 'Exporting deck…',
      exportAllTitle: 'Export every card as a loose PNG, inside a zip',
      onlyDone: 'Finished cards only',
      onlyDoneTitle: (done, pending) =>
        `The PDF and the zip carry only the ${done} finished cards; the other ${pending} are left out.`,
      onlyDoneEmpty: 'No card is marked as finished yet.',
    },
    gallery: {
      title: 'Cards',
      newCardTitle: 'New card',
      newButton: 'New card',
      unnamed: 'Unnamed',
      duplicate: 'Duplicate',
      remove: 'Delete',
      doneStamp: 'Finished',
      reopenTitle: 'Finished — click to reopen',
      markDoneTitle: 'Mark as finished',
      markPendingAria: 'Mark as pending',
      copiesStamp: (copies) => `${copies} copies in the deck`,
    },
    cardPanel: {
      name: 'Name',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Type the name',
      startingCard: 'Starting',
      startingCardHint:
        'Starting deck cards carry a diamond before the name, and the title starts further right to leave room for it.',
      faction: 'Faction',
      factionHint:
        'They stack downward in this same order, no matter what order you pick them in. Up to 4 per card.',
      cost: 'Acquire Cost',
      hasCost: 'Has a cost',
      persuasion: 'Persuasion',
      costOnCard: 'Change the cost',
      purchaseBenefit: 'Acquire Bonus',
      none: 'None',
      custom: (label) => `Custom · ${label}`,
      amount: 'Amount',
      otherValue: 'Custom value',
      agentIcons: 'Agent Icons',
      infiltrateHint:
        'Rise of Ix: the agent can go to a space a rival already occupies. Same seven icons, with a different frame.',
      copies: 'Copies',
      copiesHint:
        'How many times this card is in the deck. It is saved in the file and used by the print sheet; the PNG zip exports one file per card.',
    },
    contentEditor: {
      empty: 'Empty box.',
      textPlaceholder: 'Text…',
      emptyText: 'Text',
      editOnCard: 'Type the text',
      amountOnCard: 'Change the amount',
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
      autoAdjustHint:
        'The box comes in three heights — 1, 2 or 3 rows — and this leaves it at the smallest one the content fits in. Turn it off to set it by hand.',
      agentSilhouette: 'Agent Silhouette',
      agentSilhouetteHint:
        'The figure behind the content of the box. On a finished card the icons cover almost all of it: on its own it looks stronger than it will end up looking.',
      reveal: 'Reveal',
      contentHint: 'Drag icons, text and line breaks to add them or to reorder them.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: the Reveal box also pays out when the card is discarded or trashed. The banner takes up the start of the band, so the content fits in a narrower space.',
    },
    artPanel: {
      image: 'Image',
      changeImage: 'Change image…',
      chooseImage: 'Choose image…',
      remove: 'Remove',
      zoom: 'Zoom',
      fit: 'Fit',
      center: 'Center',
      rotate: 'Rotate a quarter turn',
      flip: 'Mirror',
      dragZoomHint:
        'Drag the image over the card to move it; the wheel zooms. You can also paste an image with Ctrl+V.',
      placeholder: 'Drag an image here\nor tap to choose one',
      frame: 'Frame',
      frameFree: 'Free frame',
      frameLocked: 'Frame locked',
    },
    iconPanel: {
      deckTitle: 'In this deck',
      deckHint:
        "The ones this deck has available: they are what the box picker offers and what travels inside the file, so the deck looks the same on another machine. The size and the name belong here and don't touch the library.",
      libraryTitle: 'My library',
      libraryHint:
        "The ones you uploaded at some point, saved in this browser. They don't travel with the deck and they aren't drawn: this is where you copy from, so you don't upload the same thing again in every deck.",
      emptyLibraryHint: "You haven't saved any icon to the library yet.",
      usedIn: (cards) => `In ${pluralCards(cards, 'en')}`,
      unused: 'Unused',
      alreadyInDeck: 'Already in the deck',
      toLibraryLabel: (label) => `Save ${label} to my library`,
      toDeckLabel: (label) => `Bring ${label} into this deck`,
      forgetLabel: (label) => `Remove ${label} from my library`,
      confirmRemoveFromLibrary: (label) =>
        `"${label}" leaves your library and you won't be able to bring it into other decks. Decks that already have it inside don't change. Remove it?`,
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
      deckTitle: 'In this deck',
      deckHint:
        "The ones this deck has available: they are what the faction picker offers and what travels inside the file. The name and the colour belong here and don't touch the library.",
      libraryTitle: 'My library',
      libraryHint:
        "The ones you built at some point, saved in this browser. They don't travel with the deck: this is where you copy from, so you don't upload the emblem again in every deck.",
      emptyLibraryHint: "You haven't saved any faction to the library yet.",
      usedIn: (cards) => `In ${pluralCards(cards, 'en')}`,
      unused: 'Unused',
      alreadyInDeck: 'Already in the deck',
      toLibraryLabel: (label) => `Save ${label} to my library`,
      toDeckLabel: (label) => `Bring ${label} into this deck`,
      forgetLabel: (label) => `Remove ${label} from my library`,
      confirmRemoveFromLibrary: (label) =>
        `"${label}" leaves your library and you won't be able to bring it into other decks. Decks that already have it inside don't change. Remove it?`,
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
      unnamed: 'Unnamed library',
      renameTitle: 'Name your library',
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
      deckCopies: 'Copies of the whole deck',
      onlyDoneHint: (cards) =>
        `Only finished cards get printed: ${pluralCards(cards, 'en')} of the deck.`,
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
      autosaveFull:
        "The deck doesn't fit in the browser's autosave: if you reload the page, anything unsaved is lost. Save it to a file.",
      noneFinished: 'There are no finished cards to export. Uncheck "Finished cards only".',
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
      exporting: 'Exportando carta…',
      export: 'Exportar carta',
      exportTitle: 'Exportar a carta aberta como PNG',
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
      done: 'Finalizada',
      markDone: 'Marcar como finalizada',
      reopenTitle: 'Finalizada — clique para reabrir',
      markDoneTitle: 'Marcar como finalizada',
    },
    dialogs: {
      icons: 'Ícones próprios',
      factions: 'Facções próprias',
      print: 'Imprimir o baralho',
      about: 'Sobre',
      close: 'Fechar',
    },
    about: {
      fanMade:
        'Este é um projeto de fãs para fãs, sem fins lucrativos: é gratuito, não tem publicidade e nada é cobrado para usá-lo.',
      ownership:
        'Dune: Imperium, suas expansões, sua arte, seus ícones e seu design gráfico são propriedade da Dire Wolf Digital, LLC. “Dune” e o universo do romance pertencem à Herbert Properties LLC. Todas as marcas e direitos pertencem aos seus respectivos donos.',
      notAffiliated:
        'Este app não é afiliado à Dire Wolf Digital nem aos detentores da marca Dune, e não conta com o patrocínio nem a aprovação deles.',
      personalUse:
        'As cartas que você montar aqui são para uso pessoal: jogar em casa, testar ideias e compartilhá-las com o seu grupo. Não são para vender nem para produzir comercialmente. Se você gosta do jogo, compre o original e apoie quem o fez.',
      takedown:
        'Se você tem direitos sobre algum destes materiais e quer que algo seja retirado, escreva pelo repositório e resolvemos.',
      source: 'Código e contato',
    },
    deckFooter: {
      deckGroup: 'Baralho',
      libraryGroup: 'Biblioteca',
      libraryGroupHint:
        'Seus ícones e facções, guardados neste navegador para reusá-los entre baralhos. Não viajam com o arquivo: trazer um copia para o baralho, e o baralho leva o PNG dentro.',
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
      exportAll: 'Exportar baralho…',
      exportingAll: 'Exportando baralho…',
      exportAllTitle: 'Exportar todas as cartas como PNGs soltos, dentro de um zip',
      onlyDone: 'Só as finalizadas',
      onlyDoneTitle: (done, pending) =>
        `O PDF e o zip levam só as ${done} finalizadas; as outras ${pending} ficam de fora.`,
      onlyDoneEmpty: 'Nenhuma carta está marcada como finalizada ainda.',
    },
    gallery: {
      title: 'Cartas',
      newCardTitle: 'Carta nova',
      newButton: 'Nova carta',
      unnamed: 'Sem nome',
      duplicate: 'Duplicar',
      remove: 'Excluir',
      doneStamp: 'Finalizada',
      reopenTitle: 'Finalizada — clique para reabrir',
      markDoneTitle: 'Marcar como finalizada',
      markPendingAria: 'Marcar como pendente',
      copiesStamp: (copies) => `${copies} exemplares no baralho`,
    },
    cardPanel: {
      name: 'Nome',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Escrever o nome',
      startingCard: 'Inicial',
      startingCardHint:
        'As cartas do baralho inicial levam um losango antes do nome, e o título começa mais à direita para dar lugar a ele.',
      faction: 'Facção',
      factionHint:
        'Empilham para baixo nessa mesma ordem, não importa em que ordem você as escolha. Até 4 por carta.',
      cost: 'Custo de aquisição',
      hasCost: 'Tem custo',
      persuasion: 'Persuasão',
      costOnCard: 'Alterar o custo',
      purchaseBenefit: 'Bônus de aquisição',
      none: 'Nenhum',
      custom: (label) => `Próprio · ${label}`,
      amount: 'Quantidade',
      otherValue: 'Outro valor',
      agentIcons: 'Ícones de agente',
      infiltrateHint:
        'Rise of Ix: o agente pode ir a um espaço que um rival já ocupa. São os mesmos sete ícones, com outra moldura.',
      copies: 'Exemplares',
      copiesHint:
        'Quantas vezes esta carta está no baralho. Fica salvo no arquivo e é usado pela folha de impressão; o zip de PNGs sai com um por carta.',
    },
    contentEditor: {
      empty: 'Caixa vazia.',
      textPlaceholder: 'Texto…',
      emptyText: 'Texto',
      editOnCard: 'Escrever o texto',
      amountOnCard: 'Alterar a quantidade',
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
      autoAdjustHint:
        'A caixa tem três alturas —1, 2 ou 3 linhas— e com isto fica a menor em que o conteúdo cabe. Desligue para fixá-la à mão.',
      agentSilhouette: 'Silhueta do agente',
      agentSilhouetteHint:
        'A figura que fica atrás do conteúdo da caixa. Na carta pronta os ícones a cobrem quase toda: sozinha parece mais marcada do que vai ficar depois.',
      reveal: 'Revelação',
      contentHint: 'Arraste ícones, texto e quebras de linha para adicioná-los ou reordená-los.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: a revelação também é cobrada ao descartar e ao destruir a carta. A faixa ocupa o começo da banda, então o conteúdo entra mais estreito.',
    },
    artPanel: {
      image: 'Imagem',
      changeImage: 'Trocar imagem…',
      chooseImage: 'Escolher imagem…',
      remove: 'Remover',
      zoom: 'Zoom',
      fit: 'Ajustar',
      center: 'Centralizar',
      rotate: 'Girar um quarto de volta',
      flip: 'Espelhar',
      dragZoomHint:
        'Arraste a imagem sobre a carta para movê-la; a roda faz zoom. Você também pode colar uma imagem com Ctrl+V.',
      placeholder: 'Arraste uma imagem aqui\nou toque para escolher',
      frame: 'Moldura',
      frameFree: 'Moldura livre',
      frameLocked: 'Moldura bloqueada',
    },
    iconPanel: {
      deckTitle: 'Neste baralho',
      deckHint:
        'Os que este baralho tem disponíveis: são os que o seletor das caixas oferece e os que viajam dentro do arquivo, então o baralho fica igual em outra máquina. O tamanho e o nome são daqui e não mexem na biblioteca.',
      libraryTitle: 'Minha biblioteca',
      libraryHint:
        'Os que você enviou alguma vez, salvos neste navegador. Não viajam com o baralho e não são desenhados: é de onde copiar para não enviar a mesma coisa em cada baralho.',
      emptyLibraryHint: 'Você ainda não salvou nenhum ícone na biblioteca.',
      usedIn: (cards) => `Em ${pluralCards(cards, 'pt')}`,
      unused: 'Sem uso',
      alreadyInDeck: 'Já está no baralho',
      toLibraryLabel: (label) => `Salvar ${label} na minha biblioteca`,
      toDeckLabel: (label) => `Trazer ${label} para este baralho`,
      forgetLabel: (label) => `Tirar ${label} da minha biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sai da sua biblioteca e você não vai poder trazê-lo para outros baralhos. Os baralhos que já o têm dentro não mudam. Tirar?`,
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
      deckTitle: 'Neste baralho',
      deckHint:
        'As que este baralho tem disponíveis: são as que o seletor de facção oferece e as que viajam dentro do arquivo. O nome e a cor são daqui e não mexem na biblioteca.',
      libraryTitle: 'Minha biblioteca',
      libraryHint:
        'As que você montou alguma vez, salvas neste navegador. Não viajam com o baralho: é de onde copiar para não enviar o emblema em cada baralho.',
      emptyLibraryHint: 'Você ainda não salvou nenhuma facção na biblioteca.',
      usedIn: (cards) => `Em ${pluralCards(cards, 'pt')}`,
      unused: 'Sem uso',
      alreadyInDeck: 'Já está no baralho',
      toLibraryLabel: (label) => `Salvar ${label} na minha biblioteca`,
      toDeckLabel: (label) => `Trazer ${label} para este baralho`,
      forgetLabel: (label) => `Tirar ${label} da minha biblioteca`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» sai da sua biblioteca e você não vai poder trazê-la para outros baralhos. Os baralhos que já a têm dentro não mudam. Tirar?`,
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
      unnamed: 'Biblioteca sem nome',
      renameTitle: 'Dar um nome à sua biblioteca',
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
      deckCopies: 'Cópias do baralho inteiro',
      onlyDoneHint: (cards) =>
        `Só as finalizadas são impressas: ${pluralCards(cards, 'pt')} do baralho.`,
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
      autosaveFull:
        'O baralho não cabe no salvamento automático do navegador: se você recarregar a página, perde o que não tiver salvo. Salve em um arquivo.',
      noneFinished: 'Não há nenhuma carta finalizada para exportar. Desmarque «Só as finalizadas».',
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
  fr: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Export de la carte…',
      export: 'Exporter la carte',
      exportTitle: 'Exporter la carte ouverte en PNG',
      defaultFileName: 'carte',
      language: 'Langue',
      undo: 'Annuler (Ctrl+Z)',
      redo: 'Rétablir (Ctrl+Maj+Z)',
    },
    tabs: { front: 'Identité', rules: 'Règles' },
    doneBanner: {
      locked: 'Carte terminée, verrouillée pour ne pas la modifier par erreur.',
      unlock: 'Déverrouiller',
    },
    doneBadge: {
      done: 'Terminée',
      markDone: 'Marquer terminée',
      reopenTitle: 'Terminée — cliquer pour rouvrir',
      markDoneTitle: 'Marquer comme terminée',
    },
    dialogs: {
      icons: 'Icônes personnalisées',
      factions: 'Factions personnalisées',
      print: 'Imprimer le deck',
      about: 'À propos',
      close: 'Fermer',
    },
    about: {
      fanMade:
        "Ceci est un projet de fans pour les fans, sans but lucratif : il est gratuit, sans publicité, et rien n'est facturé pour l'utiliser.",
      ownership:
        "Dune: Imperium, ses extensions, ses illustrations, ses icônes et son design graphique sont la propriété de Dire Wolf Digital, LLC. « Dune » et l'univers du roman appartiennent à Herbert Properties LLC. Toutes les marques et tous les droits appartiennent à leurs propriétaires respectifs.",
      notAffiliated:
        "Cette application n'est ni affiliée à Dire Wolf Digital ou aux détenteurs de la marque Dune, ni sponsorisée ni approuvée par eux.",
      personalUse:
        "Les cartes que vous créez ici sont à usage personnel : jouer chez soi, tester des idées et les partager avec votre groupe. Elles ne sont pas destinées à être vendues ni produites commercialement. Si le jeu vous plaît, achetez l'original et soutenez ceux qui l'ont fait.",
      takedown:
        "Si vous détenez des droits sur l'un de ces contenus et souhaitez qu'un élément soit retiré, écrivez-nous via le dépôt et nous le réglerons.",
      source: 'Code source et contact',
    },
    deckFooter: {
      deckGroup: 'Deck',
      libraryGroup: 'Bibliothèque',
      libraryGroupHint:
        "Vos icônes et vos factions, gardées dans ce navigateur pour les réutiliser d'un deck à l'autre. Elles ne voyagent pas avec le fichier : en importer une la copie dans le deck, et le deck emporte le PNG à l'intérieur.",
      unsavedName: 'Deck non enregistré',
      renameTitle: 'Renommer le deck',
      noNativeFsTooltip:
        "Ici, les fichiers ne peuvent pas être écrasés : « Enregistrer » et « Enregistrer sous… » téléchargent une nouvelle copie. L'API n'existe que dans Chrome et Edge, et pas dans l'aperçu intégré de l'éditeur : en ouvrant l'application dans une fenêtre du navigateur, « Enregistrer » écrit dans le fichier ouvert sans rien demander.",
      noNativeFsBadge: 'Ici, « Enregistrer » télécharge une copie',
      new: 'Nouveau',
      confirmNew:
        'Ce deck a des modifications non enregistrées. Commencer quand même un nouveau deck ?',
      open: 'Ouvrir…',
      save: 'Enregistrer',
      saveAs: 'Enregistrer sous…',
      icons: 'Icônes…',
      factions: 'Factions…',
      print: 'Imprimer…',
      exportAll: 'Exporter le deck…',
      exportingAll: 'Export du deck…',
      exportAllTitle: 'Exporter toutes les cartes en PNG séparés, dans un zip',
      onlyDone: 'Seulement les terminées',
      onlyDoneTitle: (done, pending) =>
        `Le PDF et le zip n'emportent que les ${done} cartes terminées ; les ${pending} autres restent de côté.`,
      onlyDoneEmpty: "Aucune carte n'est encore marquée comme terminée.",
    },
    gallery: {
      title: 'Cartes',
      newCardTitle: 'Nouvelle carte',
      newButton: 'Nouvelle carte',
      unnamed: 'Sans nom',
      duplicate: 'Dupliquer',
      remove: 'Supprimer',
      doneStamp: 'Terminée',
      reopenTitle: 'Terminée — cliquer pour rouvrir',
      markDoneTitle: 'Marquer comme terminée',
      markPendingAria: 'Marquer comme à faire',
      copiesStamp: (copies) => `${copies} exemplaires dans le deck`,
    },
    cardPanel: {
      name: 'Nom',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Écrire le nom',
      startingCard: 'De départ',
      startingCardHint:
        'Les cartes du deck de départ portent un losange avant le nom, et le titre commence plus à droite pour lui laisser la place.',
      faction: 'Faction',
      factionHint:
        "Elles s'empilent vers le bas dans cet ordre, quel que soit l'ordre dans lequel vous les choisissez. Jusqu'à 4 par carte.",
      cost: "Coût d'acquisition",
      hasCost: 'A un coût',
      persuasion: 'Persuasion',
      costOnCard: 'Changer le coût',
      purchaseBenefit: "Bonus d'acquisition",
      none: 'Aucun',
      custom: (label) => `Perso · ${label}`,
      amount: 'Quantité',
      otherValue: 'Autre valeur',
      agentIcons: "Icônes d'agent",
      infiltrateHint:
        "Rise of Ix : l'agent peut aller sur un espace déjà occupé par un rival. Ce sont les mêmes sept icônes, avec un autre cadre.",
      copies: 'Exemplaires',
      copiesHint:
        "Combien de fois cette carte est dans le deck. C'est enregistré dans le fichier et utilisé par la planche d'impression ; le zip de PNG n'en sort qu'un par carte.",
    },
    contentEditor: {
      empty: 'Zone vide.',
      textPlaceholder: 'Texte…',
      emptyText: 'Texte',
      editOnCard: 'Écrire le texte',
      amountOnCard: 'Changer la quantité',
      lineBreak: '— saut de ligne —',
      deletedIcon: 'Icône supprimée',
      addTo: 'Ajouter à',
      close: 'Fermer',
      addIcon: 'Icône…',
      addText: 'Texte',
      addLineBreak: 'Saut de ligne',
      remove: 'Retirer',
      custom: 'Perso',
      core: 'Dune Imperium',
      influence: 'Influence par faction',
      decrease: (label) => `Diminuer ${label}`,
      increase: (label) => `Augmenter ${label}`,
    },
    rulesPanel: {
      playTurn: "Tour d'agent",
      autoAdjust: 'Hauteur automatique',
      autoAdjustHint:
        'La zone a trois hauteurs — 1, 2 ou 3 lignes — et ceci la laisse à la plus petite où le contenu tient. Désactivez-le pour la fixer à la main.',
      agentSilhouette: "Silhouette de l'agent",
      agentSilhouetteHint:
        "La figure derrière le contenu de la zone. Sur une carte terminée, les icônes la recouvrent presque entièrement : seule, elle paraît plus marquée qu'elle ne le sera.",
      reveal: 'Révélation',
      contentHint:
        'Faites glisser icônes, textes et sauts de ligne pour les ajouter ou les réordonner.',
      unload: 'Unload',
      unloadHint:
        "Rise of Ix : la révélation s'applique aussi quand la carte est défaussée ou détruite. La banderole occupe le début de la bande, donc le contenu tient dans moins de largeur.",
    },
    artPanel: {
      image: 'Image',
      changeImage: "Changer d'image…",
      chooseImage: 'Choisir une image…',
      remove: 'Retirer',
      zoom: 'Zoom',
      fit: 'Ajuster',
      center: 'Centrer',
      rotate: "Tourner d'un quart de tour",
      flip: 'Miroir',
      dragZoomHint:
        "Faites glisser l'image sur la carte pour la déplacer ; la molette zoome. Vous pouvez aussi coller une image avec Ctrl+V.",
      placeholder: 'Glissez une image ici\nou touchez pour la choisir',
      frame: 'Cadrage',
      frameFree: 'Cadrage libre',
      frameLocked: 'Cadrage verrouillé',
    },
    iconPanel: {
      deckTitle: 'Dans ce deck',
      deckHint:
        "Celles dont ce deck dispose : ce sont celles que propose le sélecteur des zones et celles qui voyagent dans le fichier, donc le deck s'affiche pareil sur une autre machine. La taille et le nom sont d'ici et ne touchent pas la bibliothèque.",
      libraryTitle: 'Ma bibliothèque',
      libraryHint:
        "Celles que vous avez importées un jour, gardées dans ce navigateur. Elles ne voyagent pas avec le deck et ne sont pas dessinées : c'est de là qu'on copie, pour ne pas réimporter la même chose dans chaque deck.",
      emptyLibraryHint: "Vous n'avez encore enregistré aucune icône dans la bibliothèque.",
      usedIn: (cards) => `Dans ${pluralCards(cards, 'fr')}`,
      unused: 'Inutilisée',
      alreadyInDeck: 'Déjà dans le deck',
      toLibraryLabel: (label) => `Enregistrer ${label} dans ma bibliothèque`,
      toDeckLabel: (label) => `Importer ${label} dans ce deck`,
      forgetLabel: (label) => `Retirer ${label} de ma bibliothèque`,
      confirmRemoveFromLibrary: (label) =>
        `« ${label} » quitte votre bibliothèque et vous ne pourrez plus l'importer dans d'autres decks. Les decks qui l'ont déjà à l'intérieur ne changent pas. La retirer ?`,
      emptyHint:
        "Pour des règles que le jeu ne propose pas. Elles restent disponibles dans tous vos decks et apparaissent à la fin du sélecteur d'icônes.",
      nameLabel: (label) => `Nom de ${label}`,
      heightTitle: "Hauteur sur la carte, en % de l'icône du jeu",
      heightLabel: (label) => `Hauteur de ${label} sur la carte, en % de l'icône du jeu`,
      decreaseHeightLabel: (label) => `Réduire ${label}`,
      increaseHeightLabel: (label) => `Agrandir ${label}`,
      showNumberText: 'Nombre',
      showNumberLabel: (label) => `Afficher le nombre sur ${label}`,
      numberColorTitle: 'Couleur du nombre',
      numberColorLabel: (label) => `Couleur du nombre de ${label}`,
      upload: 'Importer une icône…',
      hint: "PNG avec transparence, rognés automatiquement au contenu. Le % est la hauteur sur la carte comparée à une icône du jeu. Ils restent enregistrés dans ce navigateur, et le deck emporte celles que ses cartes utilisent.",
      confirmRemove: (label, used) =>
        `« ${label} » est dans ${pluralCards(used, 'fr')} de ce deck. Si vous la supprimez, ces cartes la perdent.`,
      removeLabel: (label) => `Supprimer ${label}`,
    },
    factionPanel: {
      deckTitle: 'Dans ce deck',
      deckHint:
        "Celles dont ce deck dispose : ce sont celles que propose le sélecteur de faction et celles qui voyagent dans le fichier. Le nom et la couleur sont d'ici et ne touchent pas la bibliothèque.",
      libraryTitle: 'Ma bibliothèque',
      libraryHint:
        "Celles que vous avez créées un jour, gardées dans ce navigateur. Elles ne voyagent pas avec le deck : c'est de là qu'on copie, pour ne pas réimporter l'emblème dans chaque deck.",
      emptyLibraryHint: "Vous n'avez encore enregistré aucune faction dans la bibliothèque.",
      usedIn: (cards) => `Dans ${pluralCards(cards, 'fr')}`,
      unused: 'Inutilisée',
      alreadyInDeck: 'Déjà dans le deck',
      toLibraryLabel: (label) => `Enregistrer ${label} dans ma bibliothèque`,
      toDeckLabel: (label) => `Importer ${label} dans ce deck`,
      forgetLabel: (label) => `Retirer ${label} de ma bibliothèque`,
      confirmRemoveFromLibrary: (label) =>
        `« ${label} » quitte votre bibliothèque et vous ne pourrez plus l'importer dans d'autres decks. Les decks qui l'ont déjà à l'intérieur ne changent pas. La retirer ?`,
      emptyHint:
        "Pour des decks avec des factions que le jeu ne propose pas. Elles restent disponibles dans tous vos decks, et leur emblème seul génère les 4 losanges « +1/−1 Influence » de cette faction, prêts à servir de contenu de carte.",
      nameLabel: (label) => `Nom de ${label}`,
      colorTitle: 'Couleur de la bande',
      colorLabel: (label) => `Couleur de la bande de ${label}`,
      hexLabel: (label) => `Couleur de la bande de ${label} en hexadécimal`,
      upload: 'Importer un emblème…',
      hint: "PNG avec transparence, rogné automatiquement au contenu. Elles restent enregistrées dans ce navigateur, et le deck emporte celles que ses cartes utilisent. Comme icône d'agent, elles se posent sur une plaque noire simple, sans le cadre de celles du livret de règles.",
      confirmRemove: (label, used) =>
        `« ${label} » est dans ${pluralCards(used, 'fr')} de ce deck. Si vous la supprimez, ces cartes perdent la bande, l'icône d'agent ou le losange qui la nomme.`,
      removeLabel: (label) => `Supprimer ${label}`,
    },
    libraryFile: {
      unnamed: 'Bibliothèque sans nom',
      renameTitle: 'Nommer votre bibliothèque',
      export: 'Exporter…',
      exportTitle:
        "Enregistre toute votre bibliothèque — icônes et factions — dans un fichier, pour l'emporter sur un autre ordinateur ou en garder une copie. La bibliothèque ne vit que dans ce navigateur.",
      import: 'Importer…',
      importTitle:
        'Amène dans votre bibliothèque ce que contient un fichier de bibliothèque. Ce que vous aviez déjà sous le même id reste tel quel.',
      imported: (icons, factions) =>
        `${pluralIcons(icons, 'fr')} et ${pluralFactions(factions, 'fr')} ajoutées à votre bibliothèque.`,
    },
    printPanel: {
      perSheetSuffix: 'par feuille.',
      fitsOnOne: 'Le deck tient sur une.',
      spansPages: (pages) => `Le deck en occupe ${pages}.`,
      deckCopies: 'Copies du deck entier',
      onlyDoneHint: (cards) =>
        `Seules les cartes terminées sont imprimées : ${pluralCards(cards, 'fr')} du deck.`,
      copiesOtherValue: 'Autre quantité',
      copiesDecrease: 'Retirer une copie',
      copiesIncrease: 'Ajouter une copie',
      copiesHint: (total) => `${pluralCards(total, 'fr')} au total.`,
      bleedToggle: 'Fond perdu de 3 mm (imprimeur)',
      bleedOnHint:
        'Chaque carte est dessinée 3 mm plus grande en noir de chaque côté et découpée seule : si le massicot dévie, il coupe dans le noir et non sur un liseré blanc. Il en tient moins par feuille.',
      bleedOffHint:
        'Les cartes sont collées et partagent la coupe, donc une coupe sert pour deux. Il en tient plus par feuille, mais le moindre écart se voit.',
      buildingPdf: 'Création du PDF…',
      downloadPdf: 'Télécharger le PDF à imprimer',
      pdfSizeHintBefore:
        "Le PDF contient la taille de la feuille, donc il s'imprime à l'échelle réelle. Malgré tout, dans la fenêtre d'impression choisissez ",
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' ou « taille réelle », jamais « ajuster à la page ».',
      cardSizeHint: (w, h) =>
        `Chaque carte séparée sort en ${w} × ${h} px — 63,5 × 88 mm au double de 300 DPI.`,
    },
    errors: {
      openFailed: "Impossible d'ouvrir le fichier.",
      artFailed: "Impossible de charger l'image.",
      sheetFailed: 'Impossible de composer la planche.',
      cardsFailed: "Impossible d'exporter les cartes.",
      iconFailed: "Impossible de charger l'icône.",
      autosaveFull:
        "Le deck ne tient pas dans l'enregistrement automatique du navigateur : si vous rechargez la page, tout ce qui n'est pas enregistré est perdu. Enregistrez-le dans un fichier.",
      noneFinished:
        "Il n'y a aucune carte terminée à exporter. Décochez « Seulement les terminées ».",
      permissionDenied: (fileName) =>
        `Chrome demande l'autorisation d'écrire dans ${fileName}. Appuyez de nouveau sur Enregistrer et choisissez « Modifier le fichier », ou passez par Enregistrer sous… pour en choisir un autre.`,
      'not-a-card': () => "Ce fichier n'est pas une carte de Dune: Imperium.",
      'not-a-library': () => "Ce fichier n'est pas une bibliothèque de Dune: Imperium.",
      'empty-library': () => "Cette bibliothèque n'a ni icônes ni factions à l'intérieur.",
      'no-cards': () => "Le fichier n'a aucune carte.",
      'empty-image': ({ name }) => `L'image est vide : ${name}`,
      'read-failed': ({ name }) => `Impossible de lire le fichier : ${name}`,
      'invalid-image': ({ name }) => `Ce n'est pas une image valide : ${name}`,
      'canvas-failed': () => "Le navigateur n'a pas pu préparer l'image.",
      'png-failed': () => "Le navigateur n'a pas pu générer le PNG.",
      'sheet-canvas-failed': () => "Le navigateur n'a pas pu préparer la planche.",
      'sheet-read-failed': () => "Le navigateur n'a pas pu lire la planche.",
      'card-canvas-failed': () => 'Impossible de préparer le canevas de la carte.',
    },
  },
  de: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Karte wird exportiert…',
      export: 'Karte exportieren',
      exportTitle: 'Die geöffnete Karte als PNG exportieren',
      defaultFileName: 'karte',
      language: 'Sprache',
      undo: 'Rückgängig (Strg+Z)',
      redo: 'Wiederherstellen (Strg+Umschalt+Z)',
    },
    tabs: { front: 'Identität', rules: 'Regeln' },
    doneBanner: {
      locked: 'Karte fertig, gesperrt, damit sie nicht versehentlich geändert wird.',
      unlock: 'Entsperren',
    },
    doneBadge: {
      done: 'Fertig',
      markDone: 'Als fertig markieren',
      reopenTitle: 'Fertig — zum Wiederöffnen klicken',
      markDoneTitle: 'Als fertig markieren',
    },
    dialogs: {
      icons: 'Eigene Symbole',
      factions: 'Eigene Fraktionen',
      print: 'Deck drucken',
      about: 'Über',
      close: 'Schließen',
    },
    about: {
      fanMade:
        'Dies ist ein Fanprojekt von Fans für Fans, ohne Gewinnabsicht: Es ist kostenlos, enthält keine Werbung, und für die Nutzung wird nichts berechnet.',
      ownership:
        'Dune: Imperium, seine Erweiterungen, seine Illustrationen, seine Symbole und sein Grafikdesign sind Eigentum von Dire Wolf Digital, LLC. „Dune“ und das Universum des Romans gehören Herbert Properties LLC. Alle Marken und Rechte liegen bei ihren jeweiligen Eigentümern.',
      notAffiliated:
        'Diese App ist weder mit Dire Wolf Digital noch mit den Inhabern der Marke Dune verbunden und wird von ihnen weder gesponsert noch genehmigt.',
      personalUse:
        'Die Karten, die du hier baust, sind für den privaten Gebrauch: zu Hause spielen, Ideen ausprobieren und sie mit deiner Gruppe teilen. Sie sind nicht zum Verkauf oder zur kommerziellen Herstellung gedacht. Wenn dir das Spiel gefällt, kauf das Original und unterstütze die Leute, die es gemacht haben.',
      takedown:
        'Wenn du Rechte an einem dieser Materialien hast und möchtest, dass etwas entfernt wird, schreib uns über das Repository und wir klären das.',
      source: 'Quellcode und Kontakt',
    },
    deckFooter: {
      deckGroup: 'Deck',
      libraryGroup: 'Bibliothek',
      libraryGroupHint:
        'Deine Symbole und Fraktionen, in diesem Browser gespeichert, um sie zwischen Decks wiederzuverwenden. Sie reisen nicht mit der Datei: Eines zu holen kopiert es ins Deck, und das Deck trägt das PNG in sich.',
      unsavedName: 'Nicht gespeichertes Deck',
      renameTitle: 'Deck umbenennen',
      noNativeFsTooltip:
        'Hier können Dateien nicht überschrieben werden, deshalb laden „Speichern“ und „Speichern unter…“ eine neue Kopie herunter. Die API gibt es nur in Chrome und Edge, und nicht in der eingebetteten Vorschau des Editors: Öffnest du die App in einem Browserfenster, schreibt „Speichern“ ohne Nachfrage in die geöffnete Datei.',
      noNativeFsBadge: 'Hier lädt „Speichern“ eine Kopie herunter',
      new: 'Neu',
      confirmNew: 'Dieses Deck hat ungespeicherte Änderungen. Trotzdem ein neues Deck anfangen?',
      open: 'Öffnen…',
      save: 'Speichern',
      saveAs: 'Speichern unter…',
      icons: 'Symbole…',
      factions: 'Fraktionen…',
      print: 'Drucken…',
      exportAll: 'Deck exportieren…',
      exportingAll: 'Deck wird exportiert…',
      exportAllTitle: 'Alle Karten als einzelne PNGs exportieren, in einem Zip',
      onlyDone: 'Nur die fertigen',
      onlyDoneTitle: (done, pending) =>
        `PDF und Zip enthalten nur die ${done} fertigen Karten; die anderen ${pending} bleiben draußen.`,
      onlyDoneEmpty: 'Noch ist keine Karte als fertig markiert.',
    },
    gallery: {
      title: 'Karten',
      newCardTitle: 'Neue Karte',
      newButton: 'Neue Karte',
      unnamed: 'Ohne Namen',
      duplicate: 'Duplizieren',
      remove: 'Löschen',
      doneStamp: 'Fertig',
      reopenTitle: 'Fertig — zum Wiederöffnen klicken',
      markDoneTitle: 'Als fertig markieren',
      markPendingAria: 'Als offen markieren',
      copiesStamp: (copies) => `${copies} Exemplare im Deck`,
    },
    cardPanel: {
      name: 'Name',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Den Namen schreiben',
      startingCard: 'Startkarte',
      startingCardHint:
        'Karten des Startdecks tragen eine Raute vor dem Namen, und der Titel beginnt weiter rechts, um ihr Platz zu lassen.',
      faction: 'Fraktion',
      factionHint:
        'Sie stapeln sich in genau dieser Reihenfolge nach unten, egal in welcher Reihenfolge du sie auswählst. Bis zu 4 pro Karte.',
      cost: 'Kaufkosten',
      hasCost: 'Hat Kosten',
      persuasion: 'Überzeugung',
      costOnCard: 'Die Kosten ändern',
      purchaseBenefit: 'Kaufbonus',
      none: 'Keiner',
      custom: (label) => `Eigen · ${label}`,
      amount: 'Menge',
      otherValue: 'Anderer Wert',
      agentIcons: 'Agentensymbole',
      infiltrateHint:
        'Rise of Ix: Der Agent darf auf ein Feld, das ein Rivale schon besetzt. Es sind dieselben sieben Symbole, mit einem anderen Rahmen.',
      copies: 'Exemplare',
      copiesHint:
        'Wie oft diese Karte im Deck steckt. Es wird in der Datei gespeichert und vom Druckbogen benutzt; das PNG-Zip legt nur eines pro Karte an.',
    },
    contentEditor: {
      empty: 'Leeres Feld.',
      textPlaceholder: 'Text…',
      emptyText: 'Text',
      editOnCard: 'Den Text schreiben',
      amountOnCard: 'Die Menge ändern',
      lineBreak: '— Zeilenumbruch —',
      deletedIcon: 'Gelöschtes Symbol',
      addTo: 'Hinzufügen zu',
      close: 'Schließen',
      addIcon: 'Symbol…',
      addText: 'Text',
      addLineBreak: 'Zeilenumbruch',
      remove: 'Entfernen',
      custom: 'Eigene',
      core: 'Dune Imperium',
      influence: 'Einfluss nach Fraktion',
      decrease: (label) => `${label} verringern`,
      increase: (label) => `${label} erhöhen`,
    },
    rulesPanel: {
      playTurn: 'Agentenzug',
      autoAdjust: 'Automatische Höhe',
      autoAdjustHint:
        'Das Feld hat drei Höhen — 1, 2 oder 3 Zeilen — und damit bleibt es auf der kleinsten, in die der Inhalt passt. Schalte es aus, um sie von Hand festzulegen.',
      agentSilhouette: 'Agentensilhouette',
      agentSilhouetteHint:
        'Die Figur hinter dem Inhalt des Feldes. Auf der fertigen Karte verdecken die Symbole sie fast ganz: allein wirkt sie kräftiger, als sie am Ende aussehen wird.',
      reveal: 'Enthüllung',
      contentHint: 'Zieh Symbole, Text und Zeilenumbrüche hierher, um sie hinzuzufügen oder umzuordnen.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: Die Enthüllung greift auch, wenn die Karte abgeworfen oder vernichtet wird. Das Banner belegt den Anfang der Leiste, deshalb wird der Inhalt schmaler.',
    },
    artPanel: {
      image: 'Bild',
      changeImage: 'Bild wechseln…',
      chooseImage: 'Bild wählen…',
      remove: 'Entfernen',
      zoom: 'Zoom',
      fit: 'Anpassen',
      center: 'Zentrieren',
      rotate: 'Eine Vierteldrehung drehen',
      flip: 'Spiegeln',
      dragZoomHint:
        'Zieh das Bild über die Karte, um es zu bewegen; das Mausrad zoomt. Du kannst auch mit Strg+V ein Bild einfügen.',
      placeholder: 'Zieh ein Bild hierher\noder tippe, um eines zu wählen',
      frame: 'Bildausschnitt',
      frameFree: 'Ausschnitt frei',
      frameLocked: 'Ausschnitt gesperrt',
    },
    iconPanel: {
      deckTitle: 'In diesem Deck',
      deckHint:
        'Die, über die dieses Deck verfügt: Sie sind das, was die Auswahl der Felder anbietet und was in der Datei mitreist, damit das Deck auf einem anderen Rechner gleich aussieht. Größe und Name gehören hierher und rühren die Bibliothek nicht an.',
      libraryTitle: 'Meine Bibliothek',
      libraryHint:
        'Die, die du irgendwann hochgeladen hast, in diesem Browser gespeichert. Sie reisen nicht mit dem Deck und werden nicht gezeichnet: Von hier wird kopiert, damit du nicht in jedem Deck dasselbe erneut hochlädst.',
      emptyLibraryHint: 'Du hast noch kein Symbol in der Bibliothek gespeichert.',
      usedIn: (cards) => `In ${pluralCards(cards, 'de')}`,
      unused: 'Unbenutzt',
      alreadyInDeck: 'Schon im Deck',
      toLibraryLabel: (label) => `${label} in meiner Bibliothek speichern`,
      toDeckLabel: (label) => `${label} in dieses Deck holen`,
      forgetLabel: (label) => `${label} aus meiner Bibliothek entfernen`,
      confirmRemoveFromLibrary: (label) =>
        `„${label}“ verlässt deine Bibliothek und du kannst es nicht mehr in andere Decks holen. Decks, die es schon enthalten, ändern sich nicht. Entfernen?`,
      emptyHint:
        'Für Regeln, die das Spiel nicht mitbringt. Sie bleiben in allen deinen Decks verfügbar und erscheinen am Ende der Symbolauswahl.',
      nameLabel: (label) => `Name von ${label}`,
      heightTitle: 'Höhe auf der Karte, in % des Spielsymbols',
      heightLabel: (label) => `Höhe von ${label} auf der Karte, in % des Spielsymbols`,
      decreaseHeightLabel: (label) => `${label} verkleinern`,
      increaseHeightLabel: (label) => `${label} vergrößern`,
      showNumberText: 'Zahl',
      showNumberLabel: (label) => `Zahl über ${label} anzeigen`,
      numberColorTitle: 'Farbe der Zahl',
      numberColorLabel: (label) => `Farbe der Zahl von ${label}`,
      upload: 'Symbol hochladen…',
      hint: 'PNGs mit Transparenz, sie werden automatisch auf den Inhalt zugeschnitten. Das % ist die Höhe auf der Karte im Vergleich zu einem Spielsymbol. Sie bleiben in diesem Browser gespeichert, und das Deck nimmt die mit, die seine Karten benutzen.',
      confirmRemove: (label, used) =>
        `„${label}“ steckt in ${pluralCards(used, 'de')} dieses Decks. Wenn du es löschst, verlieren diese Karten es.`,
      removeLabel: (label) => `${label} löschen`,
    },
    factionPanel: {
      deckTitle: 'In diesem Deck',
      deckHint:
        'Die, über die dieses Deck verfügt: Sie sind das, was die Fraktionsauswahl anbietet und was in der Datei mitreist. Name und Farbe gehören hierher und rühren die Bibliothek nicht an.',
      libraryTitle: 'Meine Bibliothek',
      libraryHint:
        'Die, die du irgendwann gebaut hast, in diesem Browser gespeichert. Sie reisen nicht mit dem Deck: Von hier wird kopiert, damit du nicht in jedem Deck das Emblem erneut hochlädst.',
      emptyLibraryHint: 'Du hast noch keine Fraktion in der Bibliothek gespeichert.',
      usedIn: (cards) => `In ${pluralCards(cards, 'de')}`,
      unused: 'Unbenutzt',
      alreadyInDeck: 'Schon im Deck',
      toLibraryLabel: (label) => `${label} in meiner Bibliothek speichern`,
      toDeckLabel: (label) => `${label} in dieses Deck holen`,
      forgetLabel: (label) => `${label} aus meiner Bibliothek entfernen`,
      confirmRemoveFromLibrary: (label) =>
        `„${label}“ verlässt deine Bibliothek und du kannst sie nicht mehr in andere Decks holen. Decks, die sie schon enthalten, ändern sich nicht. Entfernen?`,
      emptyHint:
        'Für Decks mit Fraktionen, die das Spiel nicht mitbringt. Sie bleiben in allen deinen Decks verfügbar und erzeugen von selbst die 4 Rauten „+1/−1 Einfluss“ dieser Fraktion, fertig zum Einsetzen als Karteninhalt.',
      nameLabel: (label) => `Name von ${label}`,
      colorTitle: 'Farbe der Leiste',
      colorLabel: (label) => `Farbe der Leiste von ${label}`,
      hexLabel: (label) => `Farbe der Leiste von ${label} in Hexadezimal`,
      upload: 'Emblem hochladen…',
      hint: 'PNG mit Transparenz, wird automatisch auf den Inhalt zugeschnitten. Sie bleiben in diesem Browser gespeichert, und das Deck nimmt die mit, die seine Karten benutzen. Als Agentensymbol sitzen sie auf einer schlichten schwarzen Platte, ohne den Rahmen der Symbole aus dem Regelheft.',
      confirmRemove: (label, used) =>
        `„${label}“ steckt in ${pluralCards(used, 'de')} dieses Decks. Wenn du sie löschst, verlieren diese Karten die Leiste, das Agentensymbol oder die Raute, die sie nennt.`,
      removeLabel: (label) => `${label} löschen`,
    },
    libraryFile: {
      unnamed: 'Bibliothek ohne Namen',
      renameTitle: 'Deiner Bibliothek einen Namen geben',
      export: 'Exportieren…',
      exportTitle:
        'Speichert deine ganze Bibliothek — Symbole und Fraktionen — in einer Datei, um sie auf einen anderen Rechner mitzunehmen oder eine Kopie zu haben. Die Bibliothek lebt nur in diesem Browser.',
      import: 'Importieren…',
      importTitle:
        'Holt in deine Bibliothek, was eine Bibliotheksdatei enthält. Was du unter derselben id schon hattest, bleibt, wie es ist.',
      imported: (icons, factions) =>
        `${pluralIcons(icons, 'de')} und ${pluralFactions(factions, 'de')} zu deiner Bibliothek hinzugefügt.`,
    },
    printPanel: {
      perSheetSuffix: 'pro Blatt.',
      fitsOnOne: 'Das Deck passt auf eines.',
      spansPages: (pages) => `Das Deck belegt ${pages} davon.`,
      deckCopies: 'Kopien des ganzen Decks',
      onlyDoneHint: (cards) =>
        `Es werden nur die fertigen gedruckt: ${pluralCards(cards, 'de')} des Decks.`,
      copiesOtherValue: 'Andere Menge',
      copiesDecrease: 'Eine Kopie abziehen',
      copiesIncrease: 'Eine Kopie hinzufügen',
      copiesHint: (total) => `${pluralCards(total, 'de')} insgesamt.`,
      bleedToggle: '3 mm Anschnitt (Druckerei)',
      bleedOnHint:
        'Jede Karte wird an jeder Seite 3 mm größer in Schwarz gezeichnet und einzeln geschnitten: Verläuft die Schneidemaschine, schneidet sie ins Schwarze statt in eine weiße Kante. Es passen weniger pro Blatt.',
      bleedOffHint:
        'Die Karten liegen aneinander und teilen sich den Schnitt, ein Schnitt reicht also für zwei. Es passen mehr pro Blatt, aber jede Abweichung fällt auf.',
      buildingPdf: 'PDF wird gebaut…',
      downloadPdf: 'PDF zum Drucken herunterladen',
      pdfSizeHintBefore:
        'Das PDF trägt die Blattgröße in sich, es druckt also in echter Größe. Wähle trotzdem im Druckdialog ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' oder „tatsächliche Größe“, niemals „an Seite anpassen“.',
      cardSizeHint: (w, h) =>
        `Jede einzelne Karte kommt mit ${w} × ${h} px heraus — 63,5 × 88 mm beim Doppelten von 300 DPI.`,
    },
    errors: {
      openFailed: 'Die Datei konnte nicht geöffnet werden.',
      artFailed: 'Das Bild konnte nicht geladen werden.',
      sheetFailed: 'Der Bogen konnte nicht gebaut werden.',
      cardsFailed: 'Die Karten konnten nicht exportiert werden.',
      iconFailed: 'Das Symbol konnte nicht geladen werden.',
      autosaveFull:
        'Das Deck passt nicht in die automatische Speicherung des Browsers: Wenn du die Seite neu lädst, geht alles Ungespeicherte verloren. Speichere es in einer Datei.',
      noneFinished:
        'Es gibt keine fertige Karte zum Exportieren. Nimm den Haken bei „Nur die fertigen“ weg.',
      permissionDenied: (fileName) =>
        `Chrome fragt nach der Erlaubnis, in ${fileName} zu schreiben. Drück noch einmal auf Speichern und wähle „Datei bearbeiten“, oder nimm Speichern unter…, um eine andere zu wählen.`,
      'not-a-card': () => 'Die Datei ist keine Dune: Imperium-Karte.',
      'not-a-library': () => 'Diese Datei ist keine Dune: Imperium-Bibliothek.',
      'empty-library': () => 'In dieser Bibliothek sind weder Symbole noch Fraktionen.',
      'no-cards': () => 'Die Datei hat keine einzige Karte.',
      'empty-image': ({ name }) => `Das Bild ist leer: ${name}`,
      'read-failed': ({ name }) => `Die Datei konnte nicht gelesen werden: ${name}`,
      'invalid-image': ({ name }) => `Kein gültiges Bild: ${name}`,
      'canvas-failed': () => 'Der Browser konnte das Bild nicht vorbereiten.',
      'png-failed': () => 'Der Browser konnte das PNG nicht erzeugen.',
      'sheet-canvas-failed': () => 'Der Browser konnte den Bogen nicht vorbereiten.',
      'sheet-read-failed': () => 'Der Browser konnte den Bogen nicht lesen.',
      'card-canvas-failed': () => 'Die Zeichenfläche der Karte konnte nicht vorbereitet werden.',
    },
  },
  it: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Esportazione della carta…',
      export: 'Esporta la carta',
      exportTitle: 'Esporta la carta aperta come PNG',
      defaultFileName: 'carta',
      language: 'Lingua',
      undo: 'Annulla (Ctrl+Z)',
      redo: 'Ripeti (Ctrl+Maiusc+Z)',
    },
    tabs: { front: 'Identità', rules: 'Regole' },
    doneBanner: {
      locked: 'Carta finita, bloccata per non modificarla per sbaglio.',
      unlock: 'Sblocca',
    },
    doneBadge: {
      done: 'Finita',
      markDone: 'Segna come finita',
      reopenTitle: 'Finita — clicca per riaprirla',
      markDoneTitle: 'Segna come finita',
    },
    dialogs: {
      icons: 'Icone personalizzate',
      factions: 'Fazioni personalizzate',
      print: 'Stampa il mazzo',
      about: 'Informazioni',
      close: 'Chiudi',
    },
    about: {
      fanMade:
        'Questo è un progetto di fan per i fan, senza scopo di lucro: è gratuito, non ha pubblicità e non si paga nulla per usarlo.',
      ownership:
        'Dune: Imperium, le sue espansioni, le sue illustrazioni, le sue icone e il suo design grafico sono proprietà di Dire Wolf Digital, LLC. «Dune» e l’universo del romanzo appartengono a Herbert Properties LLC. Tutti i marchi e i diritti appartengono ai rispettivi proprietari.',
      notAffiliated:
        'Questa app non è affiliata a Dire Wolf Digital né ai titolari del marchio Dune, e non è da loro sponsorizzata né approvata.',
      personalUse:
        'Le carte che crei qui sono per uso personale: giocare a casa, provare idee e condividerle con il tuo gruppo. Non sono da vendere né da produrre commercialmente. Se il gioco ti piace, compra l’originale e sostieni chi l’ha fatto.',
      takedown:
        'Se hai diritti su uno di questi materiali e vuoi che qualcosa venga rimosso, scrivici tramite il repository e lo risolviamo.',
      source: 'Codice e contatti',
    },
    deckFooter: {
      deckGroup: 'Mazzo',
      libraryGroup: 'Libreria',
      libraryGroupHint:
        'Le tue icone e le tue fazioni, salvate in questo browser per riusarle tra un mazzo e l’altro. Non viaggiano con il file: portarne una dentro la copia nel mazzo, e il mazzo si porta il PNG all’interno.',
      unsavedName: 'Mazzo non salvato',
      renameTitle: 'Rinomina il mazzo',
      noNativeFsTooltip:
        'Qui i file non si possono sovrascrivere, quindi «Salva» e «Salva come…» scaricano una copia nuova. L’API esiste solo in Chrome ed Edge, e non nell’anteprima incorporata dell’editor: aprendo l’app in una finestra del browser, «Salva» scrive sul file aperto senza chiedere.',
      noNativeFsBadge: 'Qui «Salva» scarica una copia',
      new: 'Nuovo',
      confirmNew: 'Questo mazzo ha modifiche non salvate. Iniziare comunque un mazzo nuovo?',
      open: 'Apri…',
      save: 'Salva',
      saveAs: 'Salva come…',
      icons: 'Icone…',
      factions: 'Fazioni…',
      print: 'Stampa…',
      exportAll: 'Esporta il mazzo…',
      exportingAll: 'Esportazione del mazzo…',
      exportAllTitle: 'Esporta tutte le carte come PNG separati, dentro uno zip',
      onlyDone: 'Solo quelle finite',
      onlyDoneTitle: (done, pending) =>
        `Il PDF e lo zip portano solo le ${done} carte finite; le altre ${pending} restano fuori.`,
      onlyDoneEmpty: 'Nessuna carta è ancora segnata come finita.',
    },
    gallery: {
      title: 'Carte',
      newCardTitle: 'Carta nuova',
      newButton: 'Carta nuova',
      unnamed: 'Senza nome',
      duplicate: 'Duplica',
      remove: 'Elimina',
      doneStamp: 'Finita',
      reopenTitle: 'Finita — clicca per riaprirla',
      markDoneTitle: 'Segna come finita',
      markPendingAria: 'Segna come da fare',
      copiesStamp: (copies) => `${copies} copie nel mazzo`,
    },
    cardPanel: {
      name: 'Nome',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Scrivere il nome',
      startingCard: 'Iniziale',
      startingCardHint:
        'Le carte del mazzo iniziale hanno un rombo prima del nome, e il titolo comincia più a destra per lasciargli spazio.',
      faction: 'Fazione',
      factionHint:
        'Si impilano verso il basso in questo stesso ordine, indipendentemente da quello in cui le scegli. Fino a 4 per carta.',
      cost: 'Costo di acquisto',
      hasCost: 'Ha un costo',
      persuasion: 'Persuasione',
      costOnCard: 'Cambiare il costo',
      purchaseBenefit: 'Bonus di acquisto',
      none: 'Nessuno',
      custom: (label) => `Personalizzata · ${label}`,
      amount: 'Quantità',
      otherValue: 'Altro valore',
      agentIcons: 'Icone agente',
      infiltrateHint:
        'Rise of Ix: l’agente può andare su uno spazio già occupato da un rivale. Sono le stesse sette icone, con una cornice diversa.',
      copies: 'Copie',
      copiesHint:
        'Quante volte questa carta sta nel mazzo. Si salva nel file e la usa il foglio di stampa; lo zip di PNG ne tira fuori uno solo per carta.',
    },
    contentEditor: {
      empty: 'Riquadro vuoto.',
      textPlaceholder: 'Testo…',
      emptyText: 'Testo',
      editOnCard: 'Scrivere il testo',
      amountOnCard: 'Cambiare la quantità',
      lineBreak: '— a capo —',
      deletedIcon: 'Icona eliminata',
      addTo: 'Aggiungi a',
      close: 'Chiudi',
      addIcon: 'Icona…',
      addText: 'Testo',
      addLineBreak: 'A capo',
      remove: 'Togli',
      custom: 'Personalizzate',
      core: 'Dune Imperium',
      influence: 'Influenza per fazione',
      decrease: (label) => `Diminuisci ${label}`,
      increase: (label) => `Aumenta ${label}`,
    },
    rulesPanel: {
      playTurn: 'Turno agente',
      autoAdjust: 'Altezza automatica',
      autoAdjustHint:
        'Il riquadro ha tre altezze — 1, 2 o 3 righe — e così resta alla più piccola in cui il contenuto ci sta. Spegnilo per fissarla a mano.',
      agentSilhouette: 'Sagoma dell’agente',
      agentSilhouetteHint:
        'La figura dietro al contenuto del riquadro. Sulla carta finita le icone la coprono quasi tutta: da sola si vede più marcata di come si vedrà poi.',
      reveal: 'Rivelazione',
      contentHint: 'Trascina icone, testo e ritorni a capo per aggiungerli o riordinarli.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: la rivelazione si applica anche quando la carta viene scartata o eliminata. Lo stendardo occupa l’inizio della fascia, quindi il contenuto entra più stretto.',
    },
    artPanel: {
      image: 'Immagine',
      changeImage: 'Cambia immagine…',
      chooseImage: 'Scegli un’immagine…',
      remove: 'Togli',
      zoom: 'Zoom',
      fit: 'Adatta',
      center: 'Centra',
      rotate: 'Ruota di un quarto di giro',
      flip: 'Specchia',
      dragZoomHint:
        'Trascina l’immagine sulla carta per spostarla; la rotellina fa zoom. Puoi anche incollare un’immagine con Ctrl+V.',
      placeholder: 'Trascina qui un’immagine\no tocca per sceglierla',
      frame: 'Inquadratura',
      frameFree: 'Inquadratura libera',
      frameLocked: 'Inquadratura bloccata',
    },
    iconPanel: {
      deckTitle: 'In questo mazzo',
      deckHint:
        'Quelle che questo mazzo ha a disposizione: sono quelle che offre il selettore dei riquadri e quelle che viaggiano dentro il file, così il mazzo si vede uguale su un’altra macchina. La dimensione e il nome sono di qui e non toccano la libreria.',
      libraryTitle: 'La mia libreria',
      libraryHint:
        'Quelle che hai caricato una volta, salvate in questo browser. Non viaggiano con il mazzo e non vengono disegnate: è da qui che si copia, per non ricaricare la stessa cosa in ogni mazzo.',
      emptyLibraryHint: 'Non hai ancora salvato nessuna icona nella libreria.',
      usedIn: (cards) => `In ${pluralCards(cards, 'it')}`,
      unused: 'Non usata',
      alreadyInDeck: 'Già nel mazzo',
      toLibraryLabel: (label) => `Salva ${label} nella mia libreria`,
      toDeckLabel: (label) => `Porta ${label} in questo mazzo`,
      forgetLabel: (label) => `Togli ${label} dalla mia libreria`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» esce dalla tua libreria e non potrai portarla in altri mazzi. I mazzi che la hanno già dentro non cambiano. Toglierla?`,
      emptyHint:
        'Per regole che il gioco non porta. Restano disponibili in tutti i tuoi mazzi e compaiono in fondo al selettore di icone.',
      nameLabel: (label) => `Nome di ${label}`,
      heightTitle: 'Altezza sulla carta, in % dell’icona del gioco',
      heightLabel: (label) => `Altezza di ${label} sulla carta, in % dell’icona del gioco`,
      decreaseHeightLabel: (label) => `Rimpicciolisci ${label}`,
      increaseHeightLabel: (label) => `Ingrandisci ${label}`,
      showNumberText: 'Numero',
      showNumberLabel: (label) => `Mostra il numero su ${label}`,
      numberColorTitle: 'Colore del numero',
      numberColorLabel: (label) => `Colore del numero di ${label}`,
      upload: 'Carica un’icona…',
      hint: 'PNG con trasparenza, ritagliati da soli sul contenuto. La % è l’altezza sulla carta rispetto a un’icona del gioco. Restano salvate in questo browser, e il mazzo si porta dentro quelle che le sue carte usano.',
      confirmRemove: (label, used) =>
        `«${label}» sta in ${pluralCards(used, 'it')} di questo mazzo. Se la cancelli, quelle carte la perdono.`,
      removeLabel: (label) => `Cancella ${label}`,
    },
    factionPanel: {
      deckTitle: 'In questo mazzo',
      deckHint:
        'Quelle che questo mazzo ha a disposizione: sono quelle che offre il selettore di fazione e quelle che viaggiano dentro il file. Il nome e il colore sono di qui e non toccano la libreria.',
      libraryTitle: 'La mia libreria',
      libraryHint:
        'Quelle che hai creato una volta, salvate in questo browser. Non viaggiano con il mazzo: è da qui che si copia, per non ricaricare l’emblema in ogni mazzo.',
      emptyLibraryHint: 'Non hai ancora salvato nessuna fazione nella libreria.',
      usedIn: (cards) => `In ${pluralCards(cards, 'it')}`,
      unused: 'Non usata',
      alreadyInDeck: 'Già nel mazzo',
      toLibraryLabel: (label) => `Salva ${label} nella mia libreria`,
      toDeckLabel: (label) => `Porta ${label} in questo mazzo`,
      forgetLabel: (label) => `Togli ${label} dalla mia libreria`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» esce dalla tua libreria e non potrai portarla in altri mazzi. I mazzi che la hanno già dentro non cambiano. Toglierla?`,
      emptyHint:
        'Per mazzi con fazioni che il gioco non porta. Restano disponibili in tutti i tuoi mazzi, e generano da sole i 4 rombi di «+1/−1 Influenza» di quella fazione, pronti da usare nel contenuto di una carta.',
      nameLabel: (label) => `Nome di ${label}`,
      colorTitle: 'Colore della fascia',
      colorLabel: (label) => `Colore della fascia di ${label}`,
      hexLabel: (label) => `Colore della fascia di ${label} in esadecimale`,
      upload: 'Carica un emblema…',
      hint: 'PNG con trasparenza, ritagliato da solo sul contenuto. Restano salvate in questo browser, e il mazzo si porta dentro quelle che le sue carte usano. Come icona agente stanno su una placca nera semplice, senza la cornice di quelle del regolamento.',
      confirmRemove: (label, used) =>
        `«${label}» sta in ${pluralCards(used, 'it')} di questo mazzo. Se la cancelli, quelle carte perdono la fascia, l’icona agente o il rombo che la nomina.`,
      removeLabel: (label) => `Cancella ${label}`,
    },
    libraryFile: {
      unnamed: 'Libreria senza nome',
      renameTitle: 'Dare un nome alla tua libreria',
      export: 'Esporta…',
      exportTitle:
        'Salva tutta la tua libreria — icone e fazioni — in un file, per portarla su un altro computer o averne una copia. La libreria vive solo in questo browser.',
      import: 'Importa…',
      importTitle:
        'Porta nella tua libreria quello che un file di libreria contiene. Quello che avevi già con lo stesso id resta com’è.',
      imported: (icons, factions) =>
        `Aggiunte ${pluralIcons(icons, 'it')} e ${pluralFactions(factions, 'it')} alla tua libreria.`,
    },
    printPanel: {
      perSheetSuffix: 'per foglio.',
      fitsOnOne: 'Il mazzo ci sta in uno.',
      spansPages: (pages) => `Il mazzo ne occupa ${pages}.`,
      deckCopies: 'Copie del mazzo intero',
      onlyDoneHint: (cards) =>
        `Si stampano solo quelle finite: ${pluralCards(cards, 'it')} del mazzo.`,
      copiesOtherValue: 'Altra quantità',
      copiesDecrease: 'Togli una copia',
      copiesIncrease: 'Aggiungi una copia',
      copiesHint: (total) => `${pluralCards(total, 'it')} in tutto.`,
      bleedToggle: 'Abbondanza di 3 mm (tipografia)',
      bleedOnHint:
        'Ogni carta si disegna 3 mm più grande di nero per lato e si taglia da sola: se la taglierina si sposta, taglia nel nero e non su un filo bianco. Ne entrano meno per foglio.',
      bleedOffHint:
        'Le carte stanno attaccate e condividono il taglio, quindi un taglio serve per due. Ne entrano di più per foglio, ma qualsiasi scarto si vede.',
      buildingPdf: 'Creazione del PDF…',
      downloadPdf: 'Scarica il PDF da stampare',
      pdfSizeHintBefore:
        'Il PDF porta dentro la dimensione del foglio, quindi si stampa in scala reale. Comunque, nella finestra di stampa scegli ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' o «dimensione reale», mai «adatta alla pagina».',
      cardSizeHint: (w, h) =>
        `Ogni carta singola esce a ${w} × ${h} px — 63,5 × 88 mm al doppio di 300 DPI.`,
    },
    errors: {
      openFailed: 'Non si è potuto aprire il file.',
      artFailed: 'Non si è potuta caricare l’immagine.',
      sheetFailed: 'Non si è potuto comporre il foglio.',
      cardsFailed: 'Non si sono potute esportare le carte.',
      iconFailed: 'Non si è potuta caricare l’icona.',
      autosaveFull:
        'Il mazzo non ci sta nel salvataggio automatico del browser: se ricarichi la pagina, perdi quello che non hai salvato. Salvalo in un file.',
      noneFinished:
        'Non c’è nessuna carta finita da esportare. Togli la spunta a «Solo quelle finite».',
      permissionDenied: (fileName) =>
        `Chrome chiede il permesso di scrivere su ${fileName}. Premi di nuovo Salva e scegli «Modifica file», oppure usa Salva come… per sceglierne un altro.`,
      'not-a-card': () => 'Il file non è una carta di Dune: Imperium.',
      'not-a-library': () => 'Quel file non è una libreria di Dune: Imperium.',
      'empty-library': () => 'Quella libreria non ha né icone né fazioni dentro.',
      'no-cards': () => 'Il file non ha nessuna carta.',
      'empty-image': ({ name }) => `L’immagine è vuota: ${name}`,
      'read-failed': ({ name }) => `Non si è potuto leggere il file: ${name}`,
      'invalid-image': ({ name }) => `Non è un’immagine valida: ${name}`,
      'canvas-failed': () => 'Il browser non ha potuto preparare l’immagine.',
      'png-failed': () => 'Il browser non ha potuto generare il PNG.',
      'sheet-canvas-failed': () => 'Il browser non ha potuto preparare il foglio.',
      'sheet-read-failed': () => 'Il browser non ha potuto leggere il foglio.',
      'card-canvas-failed': () => 'Non si è potuta preparare la tela della carta.',
    },
  },
  pl: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Eksportowanie karty…',
      export: 'Eksportuj kartę',
      exportTitle: 'Eksportuj otwartą kartę jako PNG',
      defaultFileName: 'karta',
      language: 'Język',
      undo: 'Cofnij (Ctrl+Z)',
      redo: 'Ponów (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Tożsamość', rules: 'Zasady' },
    doneBanner: {
      locked: 'Karta gotowa, zablokowana, żeby jej przez pomyłkę nie zmienić.',
      unlock: 'Odblokuj',
    },
    doneBadge: {
      done: 'Gotowa',
      markDone: 'Oznacz jako gotową',
      reopenTitle: 'Gotowa — kliknij, aby otworzyć ponownie',
      markDoneTitle: 'Oznacz jako gotową',
    },
    dialogs: {
      icons: 'Własne ikony',
      factions: 'Własne frakcje',
      print: 'Wydrukuj talię',
      about: 'O programie',
      close: 'Zamknij',
    },
    about: {
      fanMade:
        'To projekt fanów dla fanów, non-profit: jest darmowy, nie ma reklam i nic nie kosztuje.',
      ownership:
        'Dune: Imperium, jego dodatki, grafiki, ikony i projekt graficzny są własnością Dire Wolf Digital, LLC. „Diuna” i uniwersum powieści należą do Herbert Properties LLC. Wszystkie znaki towarowe i prawa należą do ich właścicieli.',
      notAffiliated:
        'Ta aplikacja nie jest powiązana z Dire Wolf Digital ani z właścicielami marki Diuna, nie jest przez nich sponsorowana ani zatwierdzona.',
      personalUse:
        'Karty, które tu tworzysz, są do użytku własnego: do gry w domu, do testowania pomysłów i dzielenia się nimi ze swoją grupą. Nie są przeznaczone do sprzedaży ani do produkcji komercyjnej. Jeśli gra ci się podoba, kup oryginał i wesprzyj tych, którzy ją zrobili.',
      takedown:
        'Jeśli masz prawa do któregoś z tych materiałów i chcesz, żeby coś zostało usunięte, napisz do nas przez repozytorium i to załatwimy.',
      source: 'Kod i kontakt',
    },
    deckFooter: {
      deckGroup: 'Talia',
      libraryGroup: 'Biblioteka',
      libraryGroupHint:
        'Twoje ikony i frakcje, zapisane w tej przeglądarce, żeby używać ich w różnych taliach. Nie podróżują z plikiem: przeniesienie kopiuje je do talii, a talia niesie PNG w środku.',
      unsavedName: 'Niezapisana talia',
      renameTitle: 'Zmień nazwę talii',
      noNativeFsTooltip:
        'Tutaj nie da się nadpisywać plików, więc „Zapisz” i „Zapisz jako…” pobierają nową kopię. To API jest tylko w Chrome i Edge, a nie w osadzonym podglądzie edytora: po otwarciu aplikacji w oknie przeglądarki „Zapisz” pisze do otwartego pliku bez pytania.',
      noNativeFsBadge: 'Tutaj „Zapisz” pobiera kopię',
      new: 'Nowa',
      confirmNew: 'Ta talia ma niezapisane zmiany. Zacząć mimo to nową talię?',
      open: 'Otwórz…',
      save: 'Zapisz',
      saveAs: 'Zapisz jako…',
      icons: 'Ikony…',
      factions: 'Frakcje…',
      print: 'Drukuj…',
      exportAll: 'Eksportuj talię…',
      exportingAll: 'Eksportowanie talii…',
      exportAllTitle: 'Eksportuj wszystkie karty jako osobne PNG, w archiwum zip',
      onlyDone: 'Tylko gotowe',
      onlyDoneTitle: (done, pending) =>
        `PDF i zip zawierają tylko ${done} gotowych kart; pozostałe ${pending} zostają poza nimi.`,
      onlyDoneEmpty: 'Żadna karta nie jest jeszcze oznaczona jako gotowa.',
    },
    gallery: {
      title: 'Karty',
      newCardTitle: 'Nowa karta',
      newButton: 'Nowa karta',
      unnamed: 'Bez nazwy',
      duplicate: 'Duplikuj',
      remove: 'Usuń',
      doneStamp: 'Gotowa',
      reopenTitle: 'Gotowa — kliknij, aby otworzyć ponownie',
      markDoneTitle: 'Oznacz jako gotową',
      markPendingAria: 'Oznacz jako niegotową',
      copiesStamp: (copies) => `${copies} egzemplarzy w talii`,
    },
    cardPanel: {
      name: 'Nazwa',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Wpisz nazwę',
      startingCard: 'Startowa',
      startingCardHint:
        'Karty talii startowej mają romb przed nazwą, a tytuł zaczyna się bardziej w prawo, żeby zrobić mu miejsce.',
      faction: 'Frakcja',
      factionHint:
        'Układają się w dół dokładnie w tej kolejności, niezależnie od tego, w jakiej je wybierzesz. Do 4 na kartę.',
      cost: 'Koszt zakupu',
      hasCost: 'Ma koszt',
      persuasion: 'Perswazja',
      costOnCard: 'Zmień koszt',
      purchaseBenefit: 'Premia za zakup',
      none: 'Brak',
      custom: (label) => `Własna · ${label}`,
      amount: 'Liczba',
      otherValue: 'Inna wartość',
      agentIcons: 'Ikony agenta',
      infiltrateHint:
        'Rise of Ix: agent może wejść na pole zajęte już przez rywala. To te same siedem ikon, w innej ramce.',
      copies: 'Egzemplarze',
      copiesHint:
        'Ile razy ta karta jest w talii. Zapisuje się w pliku i używa jej arkusz do druku; zip z PNG-ami daje jeden plik na kartę.',
    },
    contentEditor: {
      empty: 'Puste pole.',
      textPlaceholder: 'Tekst…',
      emptyText: 'Tekst',
      editOnCard: 'Wpisz tekst',
      amountOnCard: 'Zmień liczbę',
      lineBreak: '— złamanie wiersza —',
      deletedIcon: 'Usunięta ikona',
      addTo: 'Dodaj do',
      close: 'Zamknij',
      addIcon: 'Ikona…',
      addText: 'Tekst',
      addLineBreak: 'Nowy wiersz',
      remove: 'Usuń',
      custom: 'Własne',
      core: 'Dune Imperium',
      influence: 'Wpływ według frakcji',
      decrease: (label) => `Zmniejsz ${label}`,
      increase: (label) => `Zwiększ ${label}`,
    },
    rulesPanel: {
      playTurn: 'Tura agenta',
      autoAdjust: 'Automatyczna wysokość',
      autoAdjustHint:
        'Pole ma trzy wysokości — 1, 2 lub 3 wiersze — a to zostawia najmniejszą, w której mieści się treść. Wyłącz, żeby ustawić ją ręcznie.',
      agentSilhouette: 'Sylwetka agenta',
      agentSilhouetteHint:
        'Postać za treścią pola. Na gotowej karcie ikony zakrywają ją prawie w całości: sama wygląda mocniej, niż będzie wyglądać później.',
      reveal: 'Ujawnienie',
      contentHint: 'Przeciągnij ikony, tekst i złamania wiersza, aby je dodać lub zmienić kolejność.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: ujawnienie działa również przy odrzuceniu i zniszczeniu karty. Wstęga zajmuje początek pasa, więc treść mieści się węziej.',
    },
    artPanel: {
      image: 'Obraz',
      changeImage: 'Zmień obraz…',
      chooseImage: 'Wybierz obraz…',
      remove: 'Usuń',
      zoom: 'Powiększenie',
      fit: 'Dopasuj',
      center: 'Wyśrodkuj',
      rotate: 'Obróć o ćwierć obrotu',
      flip: 'Odbij',
      dragZoomHint:
        'Przeciągnij obraz po karcie, aby go przesunąć; kółko powiększa. Możesz też wkleić obraz przez Ctrl+V.',
      placeholder: 'Przeciągnij tu obraz\nlub dotknij, aby go wybrać',
      frame: 'Kadr',
      frameFree: 'Kadr swobodny',
      frameLocked: 'Kadr zablokowany',
    },
    iconPanel: {
      deckTitle: 'W tej talii',
      deckHint:
        'Te, którymi ta talia dysponuje: to je oferuje selektor pól i to one podróżują w pliku, więc talia wygląda tak samo na innym komputerze. Rozmiar i nazwa są stąd i nie ruszają biblioteki.',
      libraryTitle: 'Moja biblioteka',
      libraryHint:
        'Te, które kiedyś wgrałeś, zapisane w tej przeglądarce. Nie podróżują z talią i nie są rysowane: to stąd się kopiuje, żeby nie wgrywać tego samego w każdej talii.',
      emptyLibraryHint: 'Nie zapisałeś jeszcze żadnej ikony w bibliotece.',
      usedIn: (cards) => `W ${pluralCards(cards, 'pl')}`,
      unused: 'Nieużywana',
      alreadyInDeck: 'Już w talii',
      toLibraryLabel: (label) => `Zapisz ${label} w mojej bibliotece`,
      toDeckLabel: (label) => `Przenieś ${label} do tej talii`,
      forgetLabel: (label) => `Usuń ${label} z mojej biblioteki`,
      confirmRemoveFromLibrary: (label) =>
        `„${label}” znika z twojej biblioteki i nie przeniesiesz jej już do innych talii. Talie, które mają ją w środku, się nie zmienią. Usunąć?`,
      emptyHint:
        'Do zasad, których gra nie ma. Zostają dostępne we wszystkich twoich taliach i pojawiają się na końcu selektora ikon.',
      nameLabel: (label) => `Nazwa ${label}`,
      heightTitle: 'Wysokość na karcie, w % ikony z gry',
      heightLabel: (label) => `Wysokość ${label} na karcie, w % ikony z gry`,
      decreaseHeightLabel: (label) => `Zmniejsz ${label}`,
      increaseHeightLabel: (label) => `Powiększ ${label}`,
      showNumberText: 'Liczba',
      showNumberLabel: (label) => `Pokaż liczbę na ${label}`,
      numberColorTitle: 'Kolor liczby',
      numberColorLabel: (label) => `Kolor liczby ${label}`,
      upload: 'Wgraj ikonę…',
      hint: 'PNG z przezroczystością, przycinane same do treści. % to wysokość na karcie w porównaniu z ikoną z gry. Zostają zapisane w tej przeglądarce, a talia niesie w środku te, których używają jej karty.',
      confirmRemove: (label, used) =>
        `„${label}” jest w ${pluralCards(used, 'pl')} tej talii. Jeśli ją skasujesz, te karty ją stracą.`,
      removeLabel: (label) => `Skasuj ${label}`,
    },
    factionPanel: {
      deckTitle: 'W tej talii',
      deckHint:
        'Te, którymi ta talia dysponuje: to je oferuje selektor frakcji i to one podróżują w pliku. Nazwa i kolor są stąd i nie ruszają biblioteki.',
      libraryTitle: 'Moja biblioteka',
      libraryHint:
        'Te, które kiedyś zrobiłeś, zapisane w tej przeglądarce. Nie podróżują z talią: to stąd się kopiuje, żeby nie wgrywać emblematu w każdej talii.',
      emptyLibraryHint: 'Nie zapisałeś jeszcze żadnej frakcji w bibliotece.',
      usedIn: (cards) => `W ${pluralCards(cards, 'pl')}`,
      unused: 'Nieużywana',
      alreadyInDeck: 'Już w talii',
      toLibraryLabel: (label) => `Zapisz ${label} w mojej bibliotece`,
      toDeckLabel: (label) => `Przenieś ${label} do tej talii`,
      forgetLabel: (label) => `Usuń ${label} z mojej biblioteki`,
      confirmRemoveFromLibrary: (label) =>
        `„${label}” znika z twojej biblioteki i nie przeniesiesz jej już do innych talii. Talie, które mają ją w środku, się nie zmienią. Usunąć?`,
      emptyHint:
        'Do talii z frakcjami, których gra nie ma. Zostają dostępne we wszystkich twoich taliach i same generują 4 romby „+1/−1 wpływu” tej frakcji, gotowe do użycia w treści karty.',
      nameLabel: (label) => `Nazwa ${label}`,
      colorTitle: 'Kolor pasa',
      colorLabel: (label) => `Kolor pasa ${label}`,
      hexLabel: (label) => `Kolor pasa ${label} szesnastkowo`,
      upload: 'Wgraj emblemat…',
      hint: 'PNG z przezroczystością, przycinany sam do treści. Zostają zapisane w tej przeglądarce, a talia niesie w środku te, których używają jej karty. Jako ikona agenta siedzą na prostej czarnej płytce, bez ramki tych z instrukcji.',
      confirmRemove: (label, used) =>
        `„${label}” jest w ${pluralCards(used, 'pl')} tej talii. Jeśli ją skasujesz, te karty stracą pas, ikonę agenta lub romb, który ją nazywa.`,
      removeLabel: (label) => `Skasuj ${label}`,
    },
    libraryFile: {
      unnamed: 'Biblioteka bez nazwy',
      renameTitle: 'Nazwij swoją bibliotekę',
      export: 'Eksportuj…',
      exportTitle:
        'Zapisuje całą twoją bibliotekę — ikony i frakcje — do pliku, żeby przenieść ją na inny komputer albo mieć kopię. Biblioteka żyje tylko w tej przeglądarce.',
      import: 'Importuj…',
      importTitle:
        'Wnosi do twojej biblioteki to, co zawiera plik biblioteki. To, co już miałeś pod tym samym id, zostaje bez zmian.',
      imported: (icons, factions) =>
        `Dodano ${pluralIcons(icons, 'pl')} i ${pluralFactions(factions, 'pl')} do twojej biblioteki.`,
    },
    printPanel: {
      perSheetSuffix: 'na arkusz.',
      fitsOnOne: 'Talia mieści się na jednym.',
      spansPages: (pages) => `Talia zajmuje ${pages}.`,
      deckCopies: 'Kopie całej talii',
      onlyDoneHint: (cards) =>
        `Drukowane są tylko gotowe: ${pluralCards(cards, 'pl')} z talii.`,
      copiesOtherValue: 'Inna liczba',
      copiesDecrease: 'Odejmij jedną kopię',
      copiesIncrease: 'Dodaj jedną kopię',
      copiesHint: (total) => `${pluralCards(total, 'pl')} łącznie.`,
      bleedToggle: 'Spad 3 mm (drukarnia)',
      bleedOnHint:
        'Każda karta rysowana jest o 3 mm większa na czarno z każdej strony i cięta osobno: jeśli gilotyna zjedzie, tnie w czerń, a nie w białą krawędź. Mieści się ich mniej na arkusz.',
      bleedOffHint:
        'Karty leżą przy sobie i dzielą cięcie, więc jedno cięcie starcza na dwie. Mieści się ich więcej na arkusz, ale każde odchylenie widać.',
      buildingPdf: 'Składanie PDF…',
      downloadPdf: 'Pobierz PDF do druku',
      pdfSizeHintBefore:
        'PDF niesie w sobie rozmiar arkusza, więc drukuje się w skali rzeczywistej. Mimo to w oknie drukowania wybierz ',
      pdfSizeHintBold: '100%',
      pdfSizeHintAfter: ' albo „rozmiar rzeczywisty”, nigdy „dopasuj do strony”.',
      cardSizeHint: (w, h) =>
        `Każda pojedyncza karta wychodzi w ${w} × ${h} px — 63,5 × 88 mm przy podwojonym 300 DPI.`,
    },
    errors: {
      openFailed: 'Nie udało się otworzyć pliku.',
      artFailed: 'Nie udało się wczytać obrazu.',
      sheetFailed: 'Nie udało się złożyć arkusza.',
      cardsFailed: 'Nie udało się wyeksportować kart.',
      iconFailed: 'Nie udało się wczytać ikony.',
      autosaveFull:
        'Talia nie mieści się w automatycznym zapisie przeglądarki: jeśli przeładujesz stronę, stracisz to, czego nie zapisałeś. Zapisz ją do pliku.',
      noneFinished: 'Nie ma żadnej gotowej karty do wyeksportowania. Odznacz „Tylko gotowe”.',
      permissionDenied: (fileName) =>
        `Chrome prosi o zgodę na zapis do ${fileName}. Naciśnij Zapisz jeszcze raz i wybierz „Edytuj plik”, albo użyj Zapisz jako…, żeby wybrać inny.`,
      'not-a-card': () => 'Ten plik nie jest kartą Dune: Imperium.',
      'not-a-library': () => 'Ten plik nie jest biblioteką Dune: Imperium.',
      'empty-library': () => 'Ta biblioteka nie ma w środku ani ikon, ani frakcji.',
      'no-cards': () => 'Plik nie ma żadnej karty.',
      'empty-image': ({ name }) => `Obraz jest pusty: ${name}`,
      'read-failed': ({ name }) => `Nie udało się odczytać pliku: ${name}`,
      'invalid-image': ({ name }) => `To nie jest prawidłowy obraz: ${name}`,
      'canvas-failed': () => 'Przeglądarka nie zdołała przygotować obrazu.',
      'png-failed': () => 'Przeglądarka nie zdołała wygenerować PNG.',
      'sheet-canvas-failed': () => 'Przeglądarka nie zdołała przygotować arkusza.',
      'sheet-read-failed': () => 'Przeglądarka nie zdołała odczytać arkusza.',
      'card-canvas-failed': () => 'Nie udało się przygotować płótna karty.',
    },
  },
  cs: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Exportuji kartu…',
      export: 'Exportovat kartu',
      exportTitle: 'Exportovat otevřenou kartu jako PNG',
      defaultFileName: 'karta',
      language: 'Jazyk',
      undo: 'Zpět (Ctrl+Z)',
      redo: 'Znovu (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Identita', rules: 'Pravidla' },
    doneBanner: {
      locked: 'Karta hotová, zamčená, aby se omylem nezměnila.',
      unlock: 'Odemknout',
    },
    doneBadge: {
      done: 'Hotová',
      markDone: 'Označit jako hotovou',
      reopenTitle: 'Hotová — kliknutím ji znovu otevřeš',
      markDoneTitle: 'Označit jako hotovou',
    },
    dialogs: {
      icons: 'Vlastní symboly',
      factions: 'Vlastní frakce',
      print: 'Vytisknout balíček',
      about: 'O aplikaci',
      close: 'Zavřít',
    },
    about: {
      fanMade:
        'Tohle je projekt fanoušků pro fanoušky, neziskový: je zdarma, nemá reklamy a za používání se nic neplatí.',
      ownership:
        'Dune: Imperium, jeho rozšíření, ilustrace, symboly a grafický design jsou majetkem Dire Wolf Digital, LLC. „Duna“ a svět románu patří Herbert Properties LLC. Všechny značky a práva patří jejich vlastníkům.',
      notAffiliated:
        'Tato aplikace není spojena s Dire Wolf Digital ani s držiteli značky Duna a nemá jejich podporu ani schválení.',
      personalUse:
        'Karty, které si tu vyrobíš, jsou pro osobní použití: hrát doma, zkoušet nápady a sdílet je se svou partou. Nejsou na prodej ani na komerční výrobu. Jestli se ti hra líbí, kup si originál a podpoř ty, kdo ji udělali.',
      takedown:
        'Pokud máš práva na některý z těchto materiálů a chceš, aby něco bylo staženo, napiš nám přes repozitář a vyřešíme to.',
      source: 'Kód a kontakt',
    },
    deckFooter: {
      deckGroup: 'Balíček',
      libraryGroup: 'Knihovna',
      libraryGroupHint:
        'Tvoje symboly a frakce, uložené v tomhle prohlížeči, aby se daly použít napříč balíčky. S souborem necestují: přenesení je zkopíruje do balíčku a balíček si nese PNG uvnitř.',
      unsavedName: 'Neuložený balíček',
      renameTitle: 'Přejmenovat balíček',
      noNativeFsTooltip:
        'Tady se soubory nedají přepisovat, takže „Uložit“ a „Uložit jako…“ stáhnou novou kopii. To API je jen v Chromu a Edgi, ne ve vestavěném náhledu editoru: když aplikaci otevřeš v okně prohlížeče, „Uložit“ zapíše do otevřeného souboru bez ptaní.',
      noNativeFsBadge: 'Tady „Uložit“ stáhne kopii',
      new: 'Nový',
      confirmNew: 'Tenhle balíček má neuložené změny. Přesto začít nový?',
      open: 'Otevřít…',
      save: 'Uložit',
      saveAs: 'Uložit jako…',
      icons: 'Symboly…',
      factions: 'Frakce…',
      print: 'Tisk…',
      exportAll: 'Exportovat balíček…',
      exportingAll: 'Exportuji balíček…',
      exportAllTitle: 'Exportovat všechny karty jako samostatné PNG, v zipu',
      onlyDone: 'Jen hotové',
      onlyDoneTitle: (done, pending) =>
        `PDF a zip obsahují jen ${done} hotových karet; zbylých ${pending} zůstane mimo.`,
      onlyDoneEmpty: 'Zatím není žádná karta označená jako hotová.',
    },
    gallery: {
      title: 'Karty',
      newCardTitle: 'Nová karta',
      newButton: 'Nová karta',
      unnamed: 'Bez názvu',
      duplicate: 'Duplikovat',
      remove: 'Smazat',
      doneStamp: 'Hotová',
      reopenTitle: 'Hotová — kliknutím ji znovu otevřeš',
      markDoneTitle: 'Označit jako hotovou',
      markPendingAria: 'Označit jako rozdělanou',
      copiesStamp: (copies) => `${copies} kusů v balíčku`,
    },
    cardPanel: {
      name: 'Název',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Napsat název',
      startingCard: 'Startovní',
      startingCardHint:
        'Karty startovního balíčku mají před názvem kosočtverec a titulek začíná víc vpravo, aby mu udělal místo.',
      faction: 'Frakce',
      factionHint:
        'Skládají se dolů přesně v tomhle pořadí, ať je vybereš v jakémkoli. Až 4 na kartu.',
      cost: 'Cena za pořízení',
      hasCost: 'Má cenu',
      persuasion: 'Přesvědčování',
      costOnCard: 'Změnit cenu',
      purchaseBenefit: 'Bonus za pořízení',
      none: 'Žádný',
      custom: (label) => `Vlastní · ${label}`,
      amount: 'Množství',
      otherValue: 'Jiná hodnota',
      agentIcons: 'Symboly agenta',
      infiltrateHint:
        'Rise of Ix: agent může jít na pole, které už zabral soupeř. Je to stejných sedm symbolů, s jiným rámečkem.',
      copies: 'Kusy',
      copiesHint:
        'Kolikrát je tahle karta v balíčku. Ukládá se do souboru a používá ji tiskový arch; zip s PNG vytáhne jen jeden na kartu.',
    },
    contentEditor: {
      empty: 'Prázdné pole.',
      textPlaceholder: 'Text…',
      emptyText: 'Text',
      editOnCard: 'Napsat text',
      amountOnCard: 'Změnit počet',
      lineBreak: '— zalomení řádku —',
      deletedIcon: 'Smazaný symbol',
      addTo: 'Přidat do',
      close: 'Zavřít',
      addIcon: 'Symbol…',
      addText: 'Text',
      addLineBreak: 'Zalomení',
      remove: 'Odebrat',
      custom: 'Vlastní',
      core: 'Dune Imperium',
      influence: 'Vliv podle frakce',
      decrease: (label) => `Snížit ${label}`,
      increase: (label) => `Zvýšit ${label}`,
    },
    rulesPanel: {
      playTurn: 'Tah agenta',
      autoAdjust: 'Automatická výška',
      autoAdjustHint:
        'Pole má tři výšky — 1, 2 nebo 3 řádky — a tohle ho nechá na nejmenší, do které se obsah vejde. Vypni to, když si ji chceš nastavit ručně.',
      agentSilhouette: 'Silueta agenta',
      agentSilhouetteHint:
        'Postava za obsahem pole. Na hotové kartě ji symboly zakryjí skoro celou: sama vypadá výrazněji, než jak bude vypadat potom.',
      reveal: 'Odhalení',
      contentHint: 'Přetáhni symboly, text a zalomení, když je chceš přidat nebo přeskládat.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: odhalení platí i při odhození a zničení karty. Stuha zabírá začátek pásu, takže se obsah vejde do menší šířky.',
    },
    artPanel: {
      image: 'Obrázek',
      changeImage: 'Změnit obrázek…',
      chooseImage: 'Vybrat obrázek…',
      remove: 'Odebrat',
      zoom: 'Přiblížení',
      fit: 'Přizpůsobit',
      center: 'Vycentrovat',
      rotate: 'Otočit o čtvrt otáčky',
      flip: 'Zrcadlit',
      dragZoomHint:
        'Táhni obrázek po kartě, když ho chceš posunout; kolečko přibližuje. Obrázek můžeš taky vložit přes Ctrl+V.',
      placeholder: 'Přetáhni sem obrázek\nnebo klepni a vyber ho',
      frame: 'Výřez',
      frameFree: 'Výřez volný',
      frameLocked: 'Výřez zamčený',
    },
    iconPanel: {
      deckTitle: 'V tomhle balíčku',
      deckHint:
        'Ty, které má tenhle balíček k dispozici: nabízí je výběr do polí a cestují uvnitř souboru, takže balíček vypadá stejně i na jiném počítači. Velikost a název jsou odsud a knihovny se netýkají.',
      libraryTitle: 'Moje knihovna',
      libraryHint:
        'Ty, které jsi někdy nahrál, uložené v tomhle prohlížeči. S balíčkem necestují a nekreslí se: odsud se kopíruje, aby ses nemusel v každém balíčku nahrávat to samé.',
      emptyLibraryHint: 'Do knihovny sis zatím neuložil žádný symbol.',
      usedIn: (cards) => `V ${pluralCards(cards, 'cs')}`,
      unused: 'Nepoužitý',
      alreadyInDeck: 'Už je v balíčku',
      toLibraryLabel: (label) => `Uložit ${label} do mé knihovny`,
      toDeckLabel: (label) => `Přenést ${label} do tohohle balíčku`,
      forgetLabel: (label) => `Odebrat ${label} z mé knihovny`,
      confirmRemoveFromLibrary: (label) =>
        `„${label}“ zmizí z tvé knihovny a už ho nepřeneseš do jiných balíčků. Balíčky, které ho mají uvnitř, se nezmění. Odebrat?`,
      emptyHint:
        'Na pravidla, která hra nemá. Zůstanou dostupné ve všech tvých balíčcích a objeví se na konci výběru symbolů.',
      nameLabel: (label) => `Název ${label}`,
      heightTitle: 'Výška na kartě, v % symbolu ze hry',
      heightLabel: (label) => `Výška ${label} na kartě, v % symbolu ze hry`,
      decreaseHeightLabel: (label) => `Zmenšit ${label}`,
      increaseHeightLabel: (label) => `Zvětšit ${label}`,
      showNumberText: 'Číslo',
      showNumberLabel: (label) => `Zobrazit číslo na ${label}`,
      numberColorTitle: 'Barva čísla',
      numberColorLabel: (label) => `Barva čísla ${label}`,
      upload: 'Nahrát symbol…',
      hint: 'PNG s průhledností, ořežou se samy na obsah. % je výška na kartě v porovnání se symbolem ze hry. Zůstanou uložené v tomhle prohlížeči a balíček si nese uvnitř ty, které jeho karty používají.',
      confirmRemove: (label, used) =>
        `„${label}“ je v ${pluralCards(used, 'cs')} tohohle balíčku. Když ho smažeš, tyhle karty o něj přijdou.`,
      removeLabel: (label) => `Smazat ${label}`,
    },
    factionPanel: {
      deckTitle: 'V tomhle balíčku',
      deckHint:
        'Ty, které má tenhle balíček k dispozici: nabízí je výběr frakce a cestují uvnitř souboru. Název a barva jsou odsud a knihovny se netýkají.',
      libraryTitle: 'Moje knihovna',
      libraryHint:
        'Ty, které jsi někdy vytvořil, uložené v tomhle prohlížeči. S balíčkem necestují: odsud se kopíruje, aby ses nemusel v každém balíčku nahrávat znak.',
      emptyLibraryHint: 'Do knihovny sis zatím neuložil žádnou frakci.',
      usedIn: (cards) => `V ${pluralCards(cards, 'cs')}`,
      unused: 'Nepoužitá',
      alreadyInDeck: 'Už je v balíčku',
      toLibraryLabel: (label) => `Uložit ${label} do mé knihovny`,
      toDeckLabel: (label) => `Přenést ${label} do tohohle balíčku`,
      forgetLabel: (label) => `Odebrat ${label} z mé knihovny`,
      confirmRemoveFromLibrary: (label) =>
        `„${label}“ zmizí z tvé knihovny a už ji nepřeneseš do jiných balíčků. Balíčky, které ji mají uvnitř, se nezmění. Odebrat?`,
      emptyHint:
        'Na balíčky s frakcemi, které hra nemá. Zůstanou dostupné ve všech tvých balíčcích a samy vygenerují 4 kosočtverce „+1/−1 vliv“ té frakce, připravené k použití v obsahu karty.',
      nameLabel: (label) => `Název ${label}`,
      colorTitle: 'Barva pásu',
      colorLabel: (label) => `Barva pásu ${label}`,
      hexLabel: (label) => `Barva pásu ${label} šestnáctkově`,
      upload: 'Nahrát znak…',
      hint: 'PNG s průhledností, ořeže se samo na obsah. Zůstanou uložené v tomhle prohlížeči a balíček si nese uvnitř ty, které jeho karty používají. Jako symbol agenta sedí na obyčejné černé destičce, bez rámečku těch z pravidel.',
      confirmRemove: (label, used) =>
        `„${label}“ je v ${pluralCards(used, 'cs')} tohohle balíčku. Když ji smažeš, tyhle karty přijdou o pás, symbol agenta nebo kosočtverec, který ji jmenuje.`,
      removeLabel: (label) => `Smazat ${label}`,
    },
    libraryFile: {
      unnamed: 'Knihovna bez názvu',
      renameTitle: 'Pojmenuj svou knihovnu',
      export: 'Exportovat…',
      exportTitle:
        'Uloží celou tvou knihovnu — symboly a frakce — do souboru, abys ji přenesl na jiný počítač nebo měl kopii. Knihovna žije jen v tomhle prohlížeči.',
      import: 'Importovat…',
      importTitle:
        'Přinese do tvé knihovny to, co je v souboru knihovny. Co jsi už měl pod stejným id, zůstane, jak je.',
      imported: (icons, factions) =>
        `Do tvé knihovny přibylo ${pluralIcons(icons, 'cs')} a ${pluralFactions(factions, 'cs')}.`,
    },
    printPanel: {
      perSheetSuffix: 'na arch.',
      fitsOnOne: 'Balíček se vejde na jeden.',
      spansPages: (pages) => `Balíček jich zabere ${pages}.`,
      deckCopies: 'Kopie celého balíčku',
      onlyDoneHint: (cards) => `Tisknou se jen hotové: ${pluralCards(cards, 'cs')} z balíčku.`,
      copiesOtherValue: 'Jiné množství',
      copiesDecrease: 'Ubrat jednu kopii',
      copiesIncrease: 'Přidat jednu kopii',
      copiesHint: (total) => `Celkem ${pluralCards(total, 'cs')}.`,
      bleedToggle: 'Spadávka 3 mm (tiskárna)',
      bleedOnHint:
        'Každá karta se kreslí o 3 mm větší v černé na každé straně a řeže se samostatně: když se řezačka posune, řízne do černé a ne do bílé hrany. Vejde se jich na arch míň.',
      bleedOffHint:
        'Karty leží na sobě nalepené a sdílejí řez, takže jeden řez slouží dvěma. Vejde se jich na arch víc, ale každá odchylka je vidět.',
      buildingPdf: 'Skládám PDF…',
      downloadPdf: 'Stáhnout PDF k tisku',
      pdfSizeHintBefore:
        'PDF si nese velikost archu v sobě, takže se tiskne ve skutečném měřítku. Přesto v tiskovém dialogu vyber ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' nebo „skutečná velikost“, nikdy „přizpůsobit stránce“.',
      cardSizeHint: (w, h) =>
        `Každá samostatná karta vyjde v ${w} × ${h} px — 63,5 × 88 mm při dvojnásobku 300 DPI.`,
    },
    errors: {
      openFailed: 'Soubor se nepodařilo otevřít.',
      artFailed: 'Obrázek se nepodařilo načíst.',
      sheetFailed: 'Arch se nepodařilo složit.',
      cardsFailed: 'Karty se nepodařilo exportovat.',
      iconFailed: 'Symbol se nepodařilo načíst.',
      autosaveFull:
        'Balíček se nevejde do automatického ukládání prohlížeče: když stránku načteš znovu, přijdeš o všechno neuložené. Ulož ho do souboru.',
      noneFinished: 'Není žádná hotová karta k exportu. Odškrtni „Jen hotové“.',
      permissionDenied: (fileName) =>
        `Chrome žádá o svolení zapisovat do ${fileName}. Zmáčkni Uložit znovu a vyber „Upravit soubor“, nebo použij Uložit jako… a vyber jiný.`,
      'not-a-card': () => 'Ten soubor není karta Dune: Imperium.',
      'not-a-library': () => 'Ten soubor není knihovna Dune: Imperium.',
      'empty-library': () => 'Ta knihovna nemá uvnitř ani symboly, ani frakce.',
      'no-cards': () => 'Soubor nemá žádnou kartu.',
      'empty-image': ({ name }) => `Obrázek je prázdný: ${name}`,
      'read-failed': ({ name }) => `Soubor se nepodařilo přečíst: ${name}`,
      'invalid-image': ({ name }) => `Není to platný obrázek: ${name}`,
      'canvas-failed': () => 'Prohlížeč nedokázal obrázek připravit.',
      'png-failed': () => 'Prohlížeč nedokázal PNG vytvořit.',
      'sheet-canvas-failed': () => 'Prohlížeč nedokázal arch připravit.',
      'sheet-read-failed': () => 'Prohlížeč nedokázal arch přečíst.',
      'card-canvas-failed': () => 'Plátno karty se nepodařilo připravit.',
    },
  },
  hu: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Kártya exportálása…',
      export: 'Kártya exportálása',
      exportTitle: 'A megnyitott kártya exportálása PNG-ként',
      defaultFileName: 'kartya',
      language: 'Nyelv',
      undo: 'Visszavonás (Ctrl+Z)',
      redo: 'Újra (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Azonosság', rules: 'Szabályok' },
    doneBanner: {
      locked: 'Kész kártya, lezárva, hogy véletlenül se változzon.',
      unlock: 'Feloldás',
    },
    doneBadge: {
      done: 'Kész',
      markDone: 'Megjelölés késznek',
      reopenTitle: 'Kész — kattints az újranyitáshoz',
      markDoneTitle: 'Megjelölés késznek',
    },
    dialogs: {
      icons: 'Saját ikonok',
      factions: 'Saját frakciók',
      print: 'A pakli nyomtatása',
      about: 'Névjegy',
      close: 'Bezárás',
    },
    about: {
      fanMade:
        'Ez rajongói projekt rajongóknak, nonprofit: ingyenes, nincs benne reklám, és a használatáért semmit nem kérünk.',
      ownership:
        'A Dune: Imperium, a kiegészítői, az illusztrációi, az ikonjai és a grafikai tervezése a Dire Wolf Digital, LLC tulajdona. A „Dűne” és a regény univerzuma a Herbert Properties LLC-hez tartozik. Minden védjegy és jog a jogtulajdonosoké.',
      notAffiliated:
        'Ez az alkalmazás nem áll kapcsolatban a Dire Wolf Digitallal és a Dűne védjegy tulajdonosaival, és nem is támogatják vagy hagyták jóvá.',
      personalUse:
        'Az itt készített kártyák személyes használatra valók: otthoni játékra, ötletek kipróbálására és arra, hogy megoszd őket a társaságoddal. Nem eladásra vagy kereskedelmi gyártásra készültek. Ha tetszik a játék, vedd meg az eredetit, és támogasd azokat, akik csinálták.',
      takedown:
        'Ha jogaid vannak ezekhez az anyagokhoz, és szeretnéd, hogy valami lekerüljön, írj nekünk a repón keresztül, és megoldjuk.',
      source: 'Forráskód és kapcsolat',
    },
    deckFooter: {
      deckGroup: 'Pakli',
      libraryGroup: 'Könyvtár',
      libraryGroupHint:
        'A saját ikonjaid és frakcióid, ebben a böngészőben elmentve, hogy paklik között újra tudd használni őket. A fájllal nem utaznak: behozni annyi, mint bemásolni a pakliba, és a pakli a PNG-t magában viszi.',
      unsavedName: 'Mentetlen pakli',
      renameTitle: 'A pakli átnevezése',
      noNativeFsTooltip:
        'Itt a fájlok nem írhatók felül, ezért a „Mentés” és a „Mentés másként…” új másolatot tölt le. Az API csak a Chrome-ban és az Edge-ben létezik, a szerkesztő beágyazott előnézetében nem: ha böngészőablakban nyitod meg az appot, a „Mentés” kérdés nélkül a megnyitott fájlba ír.',
      noNativeFsBadge: 'Itt a „Mentés” másolatot tölt le',
      new: 'Új',
      confirmNew: 'Ebben a pakliban mentetlen változások vannak. Mégis új paklit kezdesz?',
      open: 'Megnyitás…',
      save: 'Mentés',
      saveAs: 'Mentés másként…',
      icons: 'Ikonok…',
      factions: 'Frakciók…',
      print: 'Nyomtatás…',
      exportAll: 'Pakli exportálása…',
      exportingAll: 'Pakli exportálása…',
      exportAllTitle: 'Minden kártya külön PNG-ként, egy zipben',
      onlyDone: 'Csak a készek',
      onlyDoneTitle: (done, pending) =>
        `A PDF és a zip csak a(z) ${done} kész kártyát viszi; a másik ${pending} kimarad.`,
      onlyDoneEmpty: 'Még egy kártya sincs késznek jelölve.',
    },
    gallery: {
      title: 'Kártyák',
      newCardTitle: 'Új kártya',
      newButton: 'Új kártya',
      unnamed: 'Névtelen',
      duplicate: 'Másolat',
      remove: 'Törlés',
      doneStamp: 'Kész',
      reopenTitle: 'Kész — kattints az újranyitáshoz',
      markDoneTitle: 'Megjelölés késznek',
      markPendingAria: 'Megjelölés függőben lévőnek',
      copiesStamp: (copies) => `${copies} példány a pakliban`,
    },
    cardPanel: {
      name: 'Név',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'A név beírása',
      startingCard: 'Kezdő',
      startingCardHint:
        'A kezdőpakli kártyáin rombusz van a név előtt, és a cím jobbra kezdődik, hogy helyet hagyjon neki.',
      faction: 'Frakció',
      factionHint:
        'Pontosan ebben a sorrendben rendeződnek lefelé, akármilyen sorrendben választod ki őket. Kártyánként legfeljebb 4.',
      cost: 'Vételár',
      hasCost: 'Van ára',
      persuasion: 'Meggyőzés',
      costOnCard: 'A vételár módosítása',
      purchaseBenefit: 'Vételi bónusz',
      none: 'Nincs',
      custom: (label) => `Saját · ${label}`,
      amount: 'Mennyiség',
      otherValue: 'Más érték',
      agentIcons: 'Ügynökikonok',
      infiltrateHint:
        'Rise of Ix: az ügynök olyan mezőre is mehet, amelyet már elfoglalt egy ellenfél. Ugyanaz a hét ikon, más kerettel.',
      copies: 'Példányok',
      copiesHint:
        'Hányszor van benne ez a kártya a pakliban. A fájlba mentődik, és a nyomtatóív használja; a PNG-zip kártyánként csak egyet ad ki.',
    },
    contentEditor: {
      empty: 'Üres mező.',
      textPlaceholder: 'Szöveg…',
      emptyText: 'Szöveg',
      editOnCard: 'A szöveg beírása',
      amountOnCard: 'A mennyiség módosítása',
      lineBreak: '— sortörés —',
      deletedIcon: 'Törölt ikon',
      addTo: 'Hozzáadás ehhez',
      close: 'Bezárás',
      addIcon: 'Ikon…',
      addText: 'Szöveg',
      addLineBreak: 'Sortörés',
      remove: 'Eltávolítás',
      custom: 'Sajátok',
      core: 'Dune Imperium',
      influence: 'Befolyás frakciónként',
      decrease: (label) => `${label} csökkentése`,
      increase: (label) => `${label} növelése`,
    },
    rulesPanel: {
      playTurn: 'Ügynökforduló',
      autoAdjust: 'Automatikus magasság',
      autoAdjustHint:
        'A mezőnek három magassága van — 1, 2 vagy 3 sor —, és ez a legkisebbre állítja, amelybe a tartalom befér. Kapcsold ki, ha kézzel akarod beállítani.',
      agentSilhouette: 'Az ügynök sziluettje',
      agentSilhouetteHint:
        'A mező tartalma mögötti alak. A kész kártyán az ikonok szinte teljesen eltakarják: önmagában erősebbnek látszik, mint amilyen a végén lesz.',
      reveal: 'Felfedés',
      contentHint: 'Húzz ide ikonokat, szöveget és sortöréseket a hozzáadáshoz vagy átrendezéshez.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: a felfedés akkor is jár, ha a kártyát eldobod vagy megsemmisíted. A szalag elfoglalja a sáv elejét, ezért a tartalom keskenyebben fér el.',
    },
    artPanel: {
      image: 'Kép',
      changeImage: 'Kép cseréje…',
      chooseImage: 'Kép választása…',
      remove: 'Eltávolítás',
      zoom: 'Nagyítás',
      fit: 'Igazítás',
      center: 'Középre',
      rotate: 'Forgatás negyed fordulattal',
      flip: 'Tükrözés',
      dragZoomHint:
        'Húzd a képet a kártyán, hogy mozgasd; a görgő nagyít. Ctrl+V-vel képet is beilleszthetsz.',
      placeholder: 'Húzz ide egy képet\nvagy koppints a választáshoz',
      frame: 'Képkivágás',
      frameFree: 'Szabad kivágás',
      frameLocked: 'Kivágás zárolva',
    },
    iconPanel: {
      deckTitle: 'Ebben a pakliban',
      deckHint:
        'Amikkel ez a pakli rendelkezik: ezeket kínálja a mezők választója, és ezek utaznak a fájlban, így a pakli más gépen is ugyanúgy néz ki. A méret és a név ide tartozik, a könyvtárhoz nem nyúl.',
      libraryTitle: 'A könyvtáram',
      libraryHint:
        'Amiket valamikor feltöltöttél, ebben a böngészőben elmentve. A paklival nem utaznak, és nem rajzolódnak ki: innen másolsz, hogy ne kelljen minden pakliba újra feltölteni ugyanazt.',
      emptyLibraryHint: 'Még egy ikont sem mentettél a könyvtárba.',
      usedIn: (cards) => `${pluralCards(cards, 'hu')} használja`,
      unused: 'Nincs használatban',
      alreadyInDeck: 'Már a pakliban van',
      toLibraryLabel: (label) => `${label} mentése a könyvtáramba`,
      toDeckLabel: (label) => `${label} behozása ebbe a pakliba`,
      forgetLabel: (label) => `${label} eltávolítása a könyvtáramból`,
      confirmRemoveFromLibrary: (label) =>
        `A(z) „${label}” kikerül a könyvtáradból, és nem tudod más paklikba behozni. Azok a paklik, amelyekben már benne van, nem változnak. Eltávolítod?`,
      emptyHint:
        'Olyan szabályokhoz, amiket a játék nem hoz. Minden paklidban elérhetők maradnak, és az ikonválasztó végén jelennek meg.',
      nameLabel: (label) => `${label} neve`,
      heightTitle: 'Magasság a kártyán, a játék ikonjának %-ában',
      heightLabel: (label) => `${label} magassága a kártyán, a játék ikonjának %-ában`,
      decreaseHeightLabel: (label) => `${label} kicsinyítése`,
      increaseHeightLabel: (label) => `${label} nagyítása`,
      showNumberText: 'Szám',
      showNumberLabel: (label) => `Szám megjelenítése ezen: ${label}`,
      numberColorTitle: 'A szám színe',
      numberColorLabel: (label) => `${label} számának színe`,
      upload: 'Ikon feltöltése…',
      hint: 'Átlátszó PNG-k, maguktól a tartalomra vágva. A % a kártyán mért magasság a játék ikonjához képest. Ebben a böngészőben maradnak elmentve, és a pakli magával viszi azokat, amiket a kártyái használnak.',
      confirmRemove: (label, used) =>
        `A(z) „${label}” ennyi kártyán van rajta ebben a pakliban: ${pluralCards(used, 'hu')}. Ha törlöd, ezek a kártyák elvesztik.`,
      removeLabel: (label) => `${label} törlése`,
    },
    factionPanel: {
      deckTitle: 'Ebben a pakliban',
      deckHint:
        'Amikkel ez a pakli rendelkezik: ezeket kínálja a frakcióválasztó, és ezek utaznak a fájlban. A név és a szín ide tartozik, a könyvtárhoz nem nyúl.',
      libraryTitle: 'A könyvtáram',
      libraryHint:
        'Amiket valamikor összeraktál, ebben a böngészőben elmentve. A paklival nem utaznak: innen másolsz, hogy ne kelljen minden pakliba újra feltölteni a jelvényt.',
      emptyLibraryHint: 'Még egy frakciót sem mentettél a könyvtárba.',
      usedIn: (cards) => `${pluralCards(cards, 'hu')} használja`,
      unused: 'Nincs használatban',
      alreadyInDeck: 'Már a pakliban van',
      toLibraryLabel: (label) => `${label} mentése a könyvtáramba`,
      toDeckLabel: (label) => `${label} behozása ebbe a pakliba`,
      forgetLabel: (label) => `${label} eltávolítása a könyvtáramból`,
      confirmRemoveFromLibrary: (label) =>
        `A(z) „${label}” kikerül a könyvtáradból, és nem tudod más paklikba behozni. Azok a paklik, amelyekben már benne van, nem változnak. Eltávolítod?`,
      emptyHint:
        'Olyan paklikhoz, amelyekben a játék által nem hozott frakciók vannak. Minden paklidban elérhetők maradnak, és maguktól legyártják az adott frakció 4 „+1/−1 befolyás” rombuszát, készen arra, hogy kártyatartalomként használd.',
      nameLabel: (label) => `${label} neve`,
      colorTitle: 'A sáv színe',
      colorLabel: (label) => `${label} sávjának színe`,
      hexLabel: (label) => `${label} sávjának színe hexadecimálisan`,
      upload: 'Jelvény feltöltése…',
      hint: 'Átlátszó PNG, magától a tartalomra vágva. Ebben a böngészőben maradnak elmentve, és a pakli magával viszi azokat, amiket a kártyái használnak. Ügynökikonként egyszerű fekete lapon ülnek, a szabálykönyvbeliek kerete nélkül.',
      confirmRemove: (label, used) =>
        `A(z) „${label}” ennyi kártyán van rajta ebben a pakliban: ${pluralCards(used, 'hu')}. Ha törlöd, ezek a kártyák elvesztik a sávot, az ügynökikont vagy a rombuszt, ami megnevezi.`,
      removeLabel: (label) => `${label} törlése`,
    },
    libraryFile: {
      unnamed: 'Névtelen könyvtár',
      renameTitle: 'Nevezd el a könyvtáradat',
      export: 'Exportálás…',
      exportTitle:
        'Az egész könyvtáradat — ikonokat és frakciókat — fájlba menti, hogy másik gépre vidd, vagy legyen róla másolatod. A könyvtár csak ebben a böngészőben él.',
      import: 'Importálás…',
      importTitle:
        'Behozza a könyvtáradba, amit egy könyvtárfájl tartalmaz. Ami már megvolt ugyanazzal az id-vel, az marad, ahogy van.',
      imported: (icons, factions) =>
        `${pluralIcons(icons, 'hu')} és ${pluralFactions(factions, 'hu')} került a könyvtáradba.`,
    },
    printPanel: {
      perSheetSuffix: 'laponként.',
      fitsOnOne: 'A pakli elfér egyen.',
      spansPages: (pages) => `A pakli ${pages} lapot foglal el.`,
      deckCopies: 'Az egész pakli másolatai',
      onlyDoneHint: (cards) =>
        `Csak a készek nyomtatódnak: a pakliból ${pluralCards(cards, 'hu')}.`,
      copiesOtherValue: 'Más mennyiség',
      copiesDecrease: 'Egy másolat elvétele',
      copiesIncrease: 'Egy másolat hozzáadása',
      copiesHint: (total) => `Összesen ${pluralCards(total, 'hu')}.`,
      bleedToggle: '3 mm-es kifutó (nyomda)',
      bleedOnHint:
        'Minden kártya oldalanként 3 mm-rel nagyobbra rajzolódik feketében, és külön vágódik: ha a vágógép elcsúszik, feketébe vág, nem fehér élbe. Laponként kevesebb fér el.',
      bleedOffHint:
        'A kártyák egymáshoz érnek és osztoznak a vágáson, így egy vágás kettőt szolgál ki. Laponként több fér el, de minden eltérés meglátszik.',
      buildingPdf: 'PDF készítése…',
      downloadPdf: 'PDF letöltése nyomtatáshoz',
      pdfSizeHintBefore:
        'A PDF magában hordozza a lapméretet, tehát valós méretben nyomtat. Azért a nyomtatási párbeszédben válaszd a ',
      pdfSizeHintBold: '100%',
      pdfSizeHintAfter: ' vagy a „tényleges méret” lehetőséget, soha ne a „lapmérethez igazítást”.',
      cardSizeHint: (w, h) =>
        `Minden különálló kártya ${w} × ${h} px méretben jön ki — 63,5 × 88 mm a 300 DPI kétszeresén.`,
    },
    errors: {
      openFailed: 'A fájlt nem sikerült megnyitni.',
      artFailed: 'A képet nem sikerült betölteni.',
      sheetFailed: 'Az ívet nem sikerült összeállítani.',
      cardsFailed: 'A kártyákat nem sikerült exportálni.',
      iconFailed: 'Az ikont nem sikerült betölteni.',
      autosaveFull:
        'A pakli nem fér bele a böngésző automatikus mentésébe: ha újratöltöd az oldalt, elvész minden, amit nem mentettél. Mentsd fájlba.',
      noneFinished: 'Nincs exportálható kész kártya. Vedd ki a pipát a „Csak a készek” elől.',
      permissionDenied: (fileName) =>
        `A Chrome engedélyt kér, hogy ide írjon: ${fileName}. Nyomd meg újra a Mentést, és válaszd a „Fájl szerkesztése” lehetőséget, vagy használd a Mentés másként…-et egy másikhoz.`,
      'not-a-card': () => 'Ez a fájl nem Dune: Imperium-kártya.',
      'not-a-library': () => 'Ez a fájl nem Dune: Imperium-könyvtár.',
      'empty-library': () => 'Abban a könyvtárban se ikon, se frakció nincs.',
      'no-cards': () => 'A fájlban egyetlen kártya sincs.',
      'empty-image': ({ name }) => `A kép üres: ${name}`,
      'read-failed': ({ name }) => `A fájlt nem sikerült beolvasni: ${name}`,
      'invalid-image': ({ name }) => `Nem érvényes kép: ${name}`,
      'canvas-failed': () => 'A böngésző nem tudta előkészíteni a képet.',
      'png-failed': () => 'A böngésző nem tudta létrehozni a PNG-t.',
      'sheet-canvas-failed': () => 'A böngésző nem tudta előkészíteni az ívet.',
      'sheet-read-failed': () => 'A böngésző nem tudta beolvasni az ívet.',
      'card-canvas-failed': () => 'A kártya vásznát nem sikerült előkészíteni.',
    },
  },
  ru: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Экспорт карты…',
      export: 'Экспорт карты',
      exportTitle: 'Экспортировать открытую карту в PNG',
      defaultFileName: 'karta',
      language: 'Язык',
      undo: 'Отменить (Ctrl+Z)',
      redo: 'Вернуть (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Личность', rules: 'Правила' },
    doneBanner: {
      locked: 'Карта готова и заблокирована, чтобы её не изменили по ошибке.',
      unlock: 'Разблокировать',
    },
    doneBadge: {
      done: 'Готова',
      markDone: 'Отметить готовой',
      reopenTitle: 'Готова — нажмите, чтобы открыть снова',
      markDoneTitle: 'Отметить готовой',
    },
    dialogs: {
      icons: 'Свои символы',
      factions: 'Свои фракции',
      print: 'Печать колоды',
      about: 'О программе',
      close: 'Закрыть',
    },
    about: {
      fanMade:
        'Это фанатский проект для фанатов, без коммерческой цели: он бесплатный, без рекламы, и за пользование ничего не берут.',
      ownership:
        'Dune: Imperium, её дополнения, иллюстрации, символы и графический дизайн принадлежат Dire Wolf Digital, LLC. «Дюна» и вселенная романа принадлежат Herbert Properties LLC. Все марки и права принадлежат их владельцам.',
      notAffiliated:
        'Это приложение не связано с Dire Wolf Digital и с владельцами марки «Дюна», не спонсируется и не одобрено ими.',
      personalUse:
        'Карты, которые вы здесь делаете, — для личного пользования: играть дома, пробовать идеи и делиться ими со своей компанией. Они не для продажи и не для коммерческого производства. Если игра вам нравится, купите оригинал и поддержите тех, кто её сделал.',
      takedown:
        'Если у вас есть права на какой-то из этих материалов и вы хотите, чтобы что-то убрали, напишите нам через репозиторий, и мы это решим.',
      source: 'Код и контакты',
    },
    deckFooter: {
      deckGroup: 'Колода',
      libraryGroup: 'Библиотека',
      libraryGroupHint:
        'Ваши символы и фракции, сохранённые в этом браузере, чтобы использовать их в разных колодах. С файлом они не путешествуют: взять одну — значит скопировать её в колоду, а колода несёт PNG внутри.',
      unsavedName: 'Несохранённая колода',
      renameTitle: 'Переименовать колоду',
      noNativeFsTooltip:
        'Здесь файлы нельзя перезаписывать, поэтому «Сохранить» и «Сохранить как…» скачивают новую копию. Этот API есть только в Chrome и Edge, но не во встроенном предпросмотре редактора: если открыть приложение в окне браузера, «Сохранить» пишет в открытый файл без вопросов.',
      noNativeFsBadge: 'Здесь «Сохранить» скачивает копию',
      new: 'Новая',
      confirmNew: 'В этой колоде есть несохранённые изменения. Всё равно начать новую?',
      open: 'Открыть…',
      save: 'Сохранить',
      saveAs: 'Сохранить как…',
      icons: 'Символы…',
      factions: 'Фракции…',
      print: 'Печать…',
      exportAll: 'Экспорт колоды…',
      exportingAll: 'Экспорт колоды…',
      exportAllTitle: 'Экспортировать все карты отдельными PNG, в одном zip',
      onlyDone: 'Только готовые',
      onlyDoneTitle: (done, pending) =>
        `PDF и zip берут только готовые карты (${done}); остальные ${pending} остаются вне.`,
      onlyDoneEmpty: 'Пока ни одна карта не отмечена готовой.',
    },
    gallery: {
      title: 'Карты',
      newCardTitle: 'Новая карта',
      newButton: 'Новая карта',
      unnamed: 'Без названия',
      duplicate: 'Дублировать',
      remove: 'Удалить',
      doneStamp: 'Готова',
      reopenTitle: 'Готова — нажмите, чтобы открыть снова',
      markDoneTitle: 'Отметить готовой',
      markPendingAria: 'Отметить незавершённой',
      copiesStamp: (copies) => `${copies} экземпляров в колоде`,
    },
    cardPanel: {
      name: 'Название',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Написать название',
      startingCard: 'Стартовая',
      startingCardHint:
        'На картах стартовой колоды перед названием стоит ромб, и заголовок начинается правее, чтобы дать ему место.',
      faction: 'Фракция',
      factionHint:
        'Они складываются вниз именно в этом порядке, в каком бы вы их ни выбрали. До 4 на карту.',
      cost: 'Стоимость покупки',
      hasCost: 'Есть стоимость',
      persuasion: 'Убеждение',
      costOnCard: 'Изменить стоимость',
      purchaseBenefit: 'Бонус за покупку',
      none: 'Нет',
      custom: (label) => `Свой · ${label}`,
      amount: 'Количество',
      otherValue: 'Другое значение',
      agentIcons: 'Символы агента',
      infiltrateHint:
        'Rise of Ix: агент может пойти на поле, которое уже занял соперник. Это те же семь символов, в другой рамке.',
      copies: 'Экземпляры',
      copiesHint:
        'Сколько раз эта карта входит в колоду. Сохраняется в файле и используется листом для печати; zip с PNG даёт по одному файлу на карту.',
    },
    contentEditor: {
      empty: 'Пустое поле.',
      textPlaceholder: 'Текст…',
      emptyText: 'Текст',
      editOnCard: 'Написать текст',
      amountOnCard: 'Изменить количество',
      lineBreak: '— перенос строки —',
      deletedIcon: 'Удалённый символ',
      addTo: 'Добавить в',
      close: 'Закрыть',
      addIcon: 'Символ…',
      addText: 'Текст',
      addLineBreak: 'Перенос',
      remove: 'Убрать',
      custom: 'Свои',
      core: 'Dune Imperium',
      influence: 'Влияние по фракциям',
      decrease: (label) => `Уменьшить ${label}`,
      increase: (label) => `Увеличить ${label}`,
    },
    rulesPanel: {
      playTurn: 'Ход агента',
      autoAdjust: 'Автоматическая высота',
      autoAdjustHint:
        'У поля три высоты — 1, 2 или 3 строки — и так оно остаётся на самой маленькой, в которую влезает содержимое. Выключите, чтобы задать её вручную.',
      agentSilhouette: 'Силуэт агента',
      agentSilhouetteHint:
        'Фигура за содержимым поля. На готовой карте символы закрывают её почти целиком: сама по себе она выглядит заметнее, чем будет потом.',
      reveal: 'Раскрытие',
      contentHint: 'Перетаскивайте символы, текст и переносы, чтобы добавить их или переставить.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: раскрытие срабатывает и когда карту сбрасывают или уничтожают. Лента занимает начало полосы, поэтому содержимое влезает в меньшую ширину.',
    },
    artPanel: {
      image: 'Изображение',
      changeImage: 'Заменить изображение…',
      chooseImage: 'Выбрать изображение…',
      remove: 'Убрать',
      zoom: 'Масштаб',
      fit: 'Вписать',
      center: 'По центру',
      rotate: 'Повернуть на четверть оборота',
      flip: 'Отразить',
      dragZoomHint:
        'Тяните изображение по карте, чтобы сдвинуть его; колесо меняет масштаб. Изображение можно и вставить через Ctrl+V.',
      placeholder: 'Перетащите изображение сюда\nили нажмите, чтобы выбрать',
      frame: 'Кадрирование',
      frameFree: 'Кадрирование свободное',
      frameLocked: 'Кадрирование заблокировано',
    },
    iconPanel: {
      deckTitle: 'В этой колоде',
      deckHint:
        'Те, что есть у этой колоды: их предлагает выбор для полей, и они путешествуют внутри файла, так что на другой машине колода выглядит так же. Размер и название отсюда и библиотеку не трогают.',
      libraryTitle: 'Моя библиотека',
      libraryHint:
        'Те, что вы когда-то загрузили, сохранены в этом браузере. С колодой они не путешествуют и не рисуются: отсюда копируют, чтобы не загружать одно и то же в каждую колоду.',
      emptyLibraryHint: 'Вы ещё не сохранили в библиотеку ни одного символа.',
      usedIn: (cards) => `В ${pluralCards(cards, 'ru')}`,
      unused: 'Не используется',
      alreadyInDeck: 'Уже в колоде',
      toLibraryLabel: (label) => `Сохранить ${label} в мою библиотеку`,
      toDeckLabel: (label) => `Перенести ${label} в эту колоду`,
      forgetLabel: (label) => `Убрать ${label} из моей библиотеки`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» уходит из вашей библиотеки, и перенести его в другие колоды уже не выйдет. Колоды, где он уже внутри, не меняются. Убрать?`,
      emptyHint:
        'Для правил, которых нет в игре. Они остаются доступны во всех ваших колодах и появляются в конце выбора символов.',
      nameLabel: (label) => `Название ${label}`,
      heightTitle: 'Высота на карте, в % от символа игры',
      heightLabel: (label) => `Высота ${label} на карте, в % от символа игры`,
      decreaseHeightLabel: (label) => `Уменьшить ${label}`,
      increaseHeightLabel: (label) => `Увеличить ${label}`,
      showNumberText: 'Число',
      showNumberLabel: (label) => `Показать число на ${label}`,
      numberColorTitle: 'Цвет числа',
      numberColorLabel: (label) => `Цвет числа ${label}`,
      upload: 'Загрузить символ…',
      hint: 'PNG с прозрачностью, сами обрезаются по содержимому. % — это высота на карте по сравнению с символом игры. Они остаются сохранёнными в этом браузере, а колода несёт внутри те, которые используют её карты.',
      confirmRemove: (label, used) =>
        `«${label}» есть в ${pluralCards(used, 'ru')} этой колоды. Если удалить, эти карты его потеряют.`,
      removeLabel: (label) => `Удалить ${label}`,
    },
    factionPanel: {
      deckTitle: 'В этой колоде',
      deckHint:
        'Те, что есть у этой колоды: их предлагает выбор фракции, и они путешествуют внутри файла. Название и цвет отсюда и библиотеку не трогают.',
      libraryTitle: 'Моя библиотека',
      libraryHint:
        'Те, что вы когда-то собрали, сохранены в этом браузере. С колодой они не путешествуют: отсюда копируют, чтобы не загружать эмблему в каждую колоду.',
      emptyLibraryHint: 'Вы ещё не сохранили в библиотеку ни одной фракции.',
      usedIn: (cards) => `В ${pluralCards(cards, 'ru')}`,
      unused: 'Не используется',
      alreadyInDeck: 'Уже в колоде',
      toLibraryLabel: (label) => `Сохранить ${label} в мою библиотеку`,
      toDeckLabel: (label) => `Перенести ${label} в эту колоду`,
      forgetLabel: (label) => `Убрать ${label} из моей библиотеки`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» уходит из вашей библиотеки, и перенести её в другие колоды уже не выйдет. Колоды, где она уже внутри, не меняются. Убрать?`,
      emptyHint:
        'Для колод с фракциями, которых нет в игре. Они остаются доступны во всех ваших колодах и сами создают 4 ромба «+1/−1 влияния» этой фракции, готовые к использованию в содержимом карты.',
      nameLabel: (label) => `Название ${label}`,
      colorTitle: 'Цвет полосы',
      colorLabel: (label) => `Цвет полосы ${label}`,
      hexLabel: (label) => `Цвет полосы ${label} в шестнадцатеричном виде`,
      upload: 'Загрузить эмблему…',
      hint: 'PNG с прозрачностью, сам обрезается по содержимому. Они остаются сохранёнными в этом браузере, а колода несёт внутри те, которые используют её карты. Как символ агента они сидят на простой чёрной пластине, без рамки тех, что в правилах.',
      confirmRemove: (label, used) =>
        `«${label}» есть в ${pluralCards(used, 'ru')} этой колоды. Если удалить, эти карты потеряют полосу, символ агента или ромб, который её называет.`,
      removeLabel: (label) => `Удалить ${label}`,
    },
    libraryFile: {
      unnamed: 'Библиотека без названия',
      renameTitle: 'Дать библиотеке название',
      export: 'Экспорт…',
      exportTitle:
        'Сохраняет всю вашу библиотеку — символы и фракции — в файл, чтобы перенести её на другой компьютер или иметь копию. Библиотека живёт только в этом браузере.',
      import: 'Импорт…',
      importTitle:
        'Приносит в вашу библиотеку то, что есть в файле библиотеки. То, что уже было с тем же id, остаётся как есть.',
      imported: (icons, factions) =>
        `В вашу библиотеку добавлено ${pluralIcons(icons, 'ru')} и ${pluralFactions(factions, 'ru')}.`,
    },
    printPanel: {
      perSheetSuffix: 'на лист.',
      fitsOnOne: 'Колода помещается на один.',
      spansPages: (pages) => `Колода занимает ${pages}.`,
      deckCopies: 'Копии всей колоды',
      onlyDoneHint: (cards) =>
        `Печатаются только готовые: ${pluralCards(cards, 'ru')} из колоды.`,
      copiesOtherValue: 'Другое количество',
      copiesDecrease: 'Убрать одну копию',
      copiesIncrease: 'Добавить одну копию',
      copiesHint: (total) => `Всего ${pluralCards(total, 'ru')}.`,
      bleedToggle: 'Вылет 3 мм (типография)',
      bleedOnHint:
        'Каждая карта рисуется на 3 мм больше чёрным с каждой стороны и режется отдельно: если резак уйдёт, он врежется в чёрное, а не оставит белую кромку. На лист их влезает меньше.',
      bleedOffHint:
        'Карты лежат вплотную и делят рез, так что один рез служит двум. На лист их влезает больше, но любое отклонение видно.',
      buildingPdf: 'Собираю PDF…',
      downloadPdf: 'Скачать PDF для печати',
      pdfSizeHintBefore:
        'PDF несёт размер листа внутри, поэтому печатается в реальном масштабе. Всё же в окне печати выберите ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' или «реальный размер», но не «вписать в страницу».',
      cardSizeHint: (w, h) =>
        `Каждая отдельная карта выходит в ${w} × ${h} px — 63,5 × 88 мм при удвоенных 300 DPI.`,
    },
    errors: {
      openFailed: 'Не удалось открыть файл.',
      artFailed: 'Не удалось загрузить изображение.',
      sheetFailed: 'Не удалось собрать лист.',
      cardsFailed: 'Не удалось экспортировать карты.',
      iconFailed: 'Не удалось загрузить символ.',
      autosaveFull:
        'Колода не помещается в автосохранение браузера: если перезагрузить страницу, всё несохранённое пропадёт. Сохраните её в файл.',
      noneFinished: 'Нет ни одной готовой карты для экспорта. Снимите галочку «Только готовые».',
      permissionDenied: (fileName) =>
        `Chrome просит разрешение на запись в ${fileName}. Нажмите «Сохранить» ещё раз и выберите «Редактировать файл», или используйте «Сохранить как…», чтобы выбрать другой.`,
      'not-a-card': () => 'Этот файл — не карта Dune: Imperium.',
      'not-a-library': () => 'Этот файл — не библиотека Dune: Imperium.',
      'empty-library': () => 'В этой библиотеке нет ни символов, ни фракций.',
      'no-cards': () => 'В файле нет ни одной карты.',
      'empty-image': ({ name }) => `Изображение пустое: ${name}`,
      'read-failed': ({ name }) => `Не удалось прочитать файл: ${name}`,
      'invalid-image': ({ name }) => `Это не подходящее изображение: ${name}`,
      'canvas-failed': () => 'Браузер не смог подготовить изображение.',
      'png-failed': () => 'Браузер не смог создать PNG.',
      'sheet-canvas-failed': () => 'Браузер не смог подготовить лист.',
      'sheet-read-failed': () => 'Браузер не смог прочитать лист.',
      'card-canvas-failed': () => 'Не удалось подготовить холст карты.',
    },
  },
  uk: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Експорт карти…',
      export: 'Експортувати карту',
      exportTitle: 'Експортувати відкриту карту як PNG',
      defaultFileName: 'karta',
      language: 'Мова',
      undo: 'Скасувати (Ctrl+Z)',
      redo: 'Повторити (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Особистість', rules: 'Правила' },
    doneBanner: {
      locked: 'Карта готова й заблокована, щоб її не змінили помилково.',
      unlock: 'Розблокувати',
    },
    doneBadge: {
      done: 'Готова',
      markDone: 'Позначити готовою',
      reopenTitle: 'Готова — натисніть, щоб відкрити знову',
      markDoneTitle: 'Позначити готовою',
    },
    dialogs: {
      icons: 'Власні символи',
      factions: 'Власні фракції',
      print: 'Друк колоди',
      about: 'Про програму',
      close: 'Закрити',
    },
    about: {
      fanMade:
        'Це фанатський проєкт для фанатів, без комерційної мети: він безкоштовний, без реклами, і за користування нічого не беруть.',
      ownership:
        'Dune: Imperium, її доповнення, ілюстрації, символи та графічний дизайн належать Dire Wolf Digital, LLC. «Дюна» і всесвіт роману належать Herbert Properties LLC. Усі марки й права належать їхнім власникам.',
      notAffiliated:
        'Цей застосунок не пов’язаний із Dire Wolf Digital і власниками марки «Дюна», не спонсорований і не схвалений ними.',
      personalUse:
        'Карти, які ви тут робите, — для особистого користування: грати вдома, пробувати ідеї та ділитися ними зі своєю компанією. Вони не для продажу й не для комерційного виробництва. Якщо гра вам подобається, купіть оригінал і підтримайте тих, хто її зробив.',
      takedown:
        'Якщо у вас є права на якийсь із цих матеріалів і ви хочете, щоб щось прибрали, напишіть нам через репозиторій, і ми це вирішимо.',
      source: 'Код і контакти',
    },
    deckFooter: {
      deckGroup: 'Колода',
      libraryGroup: 'Бібліотека',
      libraryGroupHint:
        'Ваші символи й фракції, збережені в цьому браузері, щоб використовувати їх у різних колодах. З файлом вони не подорожують: узяти одну — це скопіювати її в колоду, а колода несе PNG усередині.',
      unsavedName: 'Незбережена колода',
      renameTitle: 'Перейменувати колоду',
      noNativeFsTooltip:
        'Тут файли не можна перезаписувати, тому «Зберегти» і «Зберегти як…» завантажують нову копію. Цей API є лише в Chrome та Edge, але не у вбудованому попередньому перегляді редактора: якщо відкрити застосунок у вікні браузера, «Зберегти» пише у відкритий файл без запитань.',
      noNativeFsBadge: 'Тут «Зберегти» завантажує копію',
      new: 'Нова',
      confirmNew: 'У цій колоді є незбережені зміни. Усе одно почати нову?',
      open: 'Відкрити…',
      save: 'Зберегти',
      saveAs: 'Зберегти як…',
      icons: 'Символи…',
      factions: 'Фракції…',
      print: 'Друк…',
      exportAll: 'Експорт колоди…',
      exportingAll: 'Експорт колоди…',
      exportAllTitle: 'Експортувати всі карти окремими PNG, в одному zip',
      onlyDone: 'Лише готові',
      onlyDoneTitle: (done, pending) =>
        `PDF і zip беруть лише готові карти (${done}); решта ${pending} лишаються поза ними.`,
      onlyDoneEmpty: 'Поки жодна карта не позначена готовою.',
    },
    gallery: {
      title: 'Карти',
      newCardTitle: 'Нова карта',
      newButton: 'Нова карта',
      unnamed: 'Без назви',
      duplicate: 'Дублювати',
      remove: 'Видалити',
      doneStamp: 'Готова',
      reopenTitle: 'Готова — натисніть, щоб відкрити знову',
      markDoneTitle: 'Позначити готовою',
      markPendingAria: 'Позначити незавершеною',
      copiesStamp: (copies) => `${copies} примірників у колоді`,
    },
    cardPanel: {
      name: 'Назва',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Написати назву',
      startingCard: 'Стартова',
      startingCardHint:
        'На картах стартової колоди перед назвою стоїть ромб, а заголовок починається правіше, щоб дати йому місце.',
      faction: 'Фракція',
      factionHint:
        'Вони складаються вниз саме в цьому порядку, у якому б ви їх не вибрали. До 4 на карту.',
      cost: 'Вартість придбання',
      hasCost: 'Має вартість',
      persuasion: 'Переконання',
      costOnCard: 'Змінити вартість',
      purchaseBenefit: 'Бонус за придбання',
      none: 'Немає',
      custom: (label) => `Власний · ${label}`,
      amount: 'Кількість',
      otherValue: 'Інше значення',
      agentIcons: 'Символи агента',
      infiltrateHint:
        'Rise of Ix: агент може піти на поле, яке вже зайняв суперник. Це ті самі сім символів, в іншій рамці.',
      copies: 'Примірники',
      copiesHint:
        'Скільки разів ця карта входить у колоду. Зберігається у файлі й використовується аркушем для друку; zip із PNG дає по одному файлу на карту.',
    },
    contentEditor: {
      empty: 'Порожнє поле.',
      textPlaceholder: 'Текст…',
      emptyText: 'Текст',
      editOnCard: 'Написати текст',
      amountOnCard: 'Змінити кількість',
      lineBreak: '— перенесення рядка —',
      deletedIcon: 'Видалений символ',
      addTo: 'Додати до',
      close: 'Закрити',
      addIcon: 'Символ…',
      addText: 'Текст',
      addLineBreak: 'Перенесення',
      remove: 'Прибрати',
      custom: 'Власні',
      core: 'Dune Imperium',
      influence: 'Вплив за фракціями',
      decrease: (label) => `Зменшити ${label}`,
      increase: (label) => `Збільшити ${label}`,
    },
    rulesPanel: {
      playTurn: 'Хід агента',
      autoAdjust: 'Автоматична висота',
      autoAdjustHint:
        'У поля три висоти — 1, 2 або 3 рядки — і так воно лишається на найменшій, у яку влазить вміст. Вимкніть, щоб задати її вручну.',
      agentSilhouette: 'Силует агента',
      agentSilhouetteHint:
        'Фігура за вмістом поля. На готовій карті символи закривають її майже повністю: сама по собі вона виглядає помітнішою, ніж буде потім.',
      reveal: 'Розкриття',
      contentHint: 'Перетягуйте символи, текст і перенесення, щоб додати їх або переставити.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: розкриття спрацьовує і коли карту скидають чи знищують. Стрічка займає початок смуги, тому вміст влазить у меншу ширину.',
    },
    artPanel: {
      image: 'Зображення',
      changeImage: 'Замінити зображення…',
      chooseImage: 'Вибрати зображення…',
      remove: 'Прибрати',
      zoom: 'Масштаб',
      fit: 'Вписати',
      center: 'По центру',
      rotate: 'Повернути на чверть оберту',
      flip: 'Віддзеркалити',
      dragZoomHint:
        'Тягніть зображення по карті, щоб зсунути його; коліщатко змінює масштаб. Зображення можна й вставити через Ctrl+V.',
      placeholder: 'Перетягніть зображення сюди\nабо натисніть, щоб вибрати',
      frame: 'Кадрування',
      frameFree: 'Кадрування вільне',
      frameLocked: 'Кадрування заблоковане',
    },
    iconPanel: {
      deckTitle: 'У цій колоді',
      deckHint:
        'Ті, що є в цієї колоди: їх пропонує вибір для полів, і вони подорожують усередині файлу, тож на іншій машині колода виглядає так само. Розмір і назва звідси й бібліотеки не чіпають.',
      libraryTitle: 'Моя бібліотека',
      libraryHint:
        'Ті, що ви колись завантажили, збережені в цьому браузері. З колодою вони не подорожують і не малюються: звідси копіюють, щоб не завантажувати те саме в кожну колоду.',
      emptyLibraryHint: 'Ви ще не зберегли в бібліотеку жодного символу.',
      usedIn: (cards) => `У ${pluralCards(cards, 'uk')}`,
      unused: 'Не використовується',
      alreadyInDeck: 'Уже в колоді',
      toLibraryLabel: (label) => `Зберегти ${label} у мою бібліотеку`,
      toDeckLabel: (label) => `Перенести ${label} у цю колоду`,
      forgetLabel: (label) => `Прибрати ${label} з моєї бібліотеки`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» іде з вашої бібліотеки, і перенести його в інші колоди вже не вийде. Колоди, де він уже всередині, не змінюються. Прибрати?`,
      emptyHint:
        'Для правил, яких немає у грі. Вони лишаються доступними в усіх ваших колодах і з’являються в кінці вибору символів.',
      nameLabel: (label) => `Назва ${label}`,
      heightTitle: 'Висота на карті, у % від символу гри',
      heightLabel: (label) => `Висота ${label} на карті, у % від символу гри`,
      decreaseHeightLabel: (label) => `Зменшити ${label}`,
      increaseHeightLabel: (label) => `Збільшити ${label}`,
      showNumberText: 'Число',
      showNumberLabel: (label) => `Показати число на ${label}`,
      numberColorTitle: 'Колір числа',
      numberColorLabel: (label) => `Колір числа ${label}`,
      upload: 'Завантажити символ…',
      hint: 'PNG із прозорістю, самі обрізаються за вмістом. % — це висота на карті порівняно із символом гри. Вони лишаються збереженими в цьому браузері, а колода несе всередині ті, які використовують її карти.',
      confirmRemove: (label, used) =>
        `«${label}» є в ${pluralCards(used, 'uk')} цієї колоди. Якщо видалити, ці карти його втратять.`,
      removeLabel: (label) => `Видалити ${label}`,
    },
    factionPanel: {
      deckTitle: 'У цій колоді',
      deckHint:
        'Ті, що є в цієї колоди: їх пропонує вибір фракції, і вони подорожують усередині файлу. Назва й колір звідси й бібліотеки не чіпають.',
      libraryTitle: 'Моя бібліотека',
      libraryHint:
        'Ті, що ви колись зібрали, збережені в цьому браузері. З колодою вони не подорожують: звідси копіюють, щоб не завантажувати емблему в кожну колоду.',
      emptyLibraryHint: 'Ви ще не зберегли в бібліотеку жодної фракції.',
      usedIn: (cards) => `У ${pluralCards(cards, 'uk')}`,
      unused: 'Не використовується',
      alreadyInDeck: 'Уже в колоді',
      toLibraryLabel: (label) => `Зберегти ${label} у мою бібліотеку`,
      toDeckLabel: (label) => `Перенести ${label} у цю колоду`,
      forgetLabel: (label) => `Прибрати ${label} з моєї бібліотеки`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» іде з вашої бібліотеки, і перенести її в інші колоди вже не вийде. Колоди, де вона вже всередині, не змінюються. Прибрати?`,
      emptyHint:
        'Для колод із фракціями, яких немає у грі. Вони лишаються доступними в усіх ваших колодах і самі створюють 4 ромби «+1/−1 впливу» цієї фракції, готові до використання у вмісті карти.',
      nameLabel: (label) => `Назва ${label}`,
      colorTitle: 'Колір смуги',
      colorLabel: (label) => `Колір смуги ${label}`,
      hexLabel: (label) => `Колір смуги ${label} у шістнадцятковому вигляді`,
      upload: 'Завантажити емблему…',
      hint: 'PNG із прозорістю, сам обрізається за вмістом. Вони лишаються збереженими в цьому браузері, а колода несе всередині ті, які використовують її карти. Як символ агента вони сидять на простій чорній пластині, без рамки тих, що в правилах.',
      confirmRemove: (label, used) =>
        `«${label}» є в ${pluralCards(used, 'uk')} цієї колоди. Якщо видалити, ці карти втратять смугу, символ агента або ромб, який її називає.`,
      removeLabel: (label) => `Видалити ${label}`,
    },
    libraryFile: {
      unnamed: 'Бібліотека без назви',
      renameTitle: 'Дати бібліотеці назву',
      export: 'Експорт…',
      exportTitle:
        'Зберігає всю вашу бібліотеку — символи й фракції — у файл, щоб перенести її на інший комп’ютер або мати копію. Бібліотека живе лише в цьому браузері.',
      import: 'Імпорт…',
      importTitle:
        'Приносить у вашу бібліотеку те, що є у файлі бібліотеки. Те, що вже було з тим самим id, лишається як є.',
      imported: (icons, factions) =>
        `У вашу бібліотеку додано ${pluralIcons(icons, 'uk')} і ${pluralFactions(factions, 'uk')}.`,
    },
    printPanel: {
      perSheetSuffix: 'на аркуш.',
      fitsOnOne: 'Колода вміщається на один.',
      spansPages: (pages) => `Колода займає ${pages}.`,
      deckCopies: 'Копії всієї колоди',
      onlyDoneHint: (cards) =>
        `Друкуються лише готові: ${pluralCards(cards, 'uk')} з колоди.`,
      copiesOtherValue: 'Інша кількість',
      copiesDecrease: 'Прибрати одну копію',
      copiesIncrease: 'Додати одну копію',
      copiesHint: (total) => `Усього ${pluralCards(total, 'uk')}.`,
      bleedToggle: 'Виліт 3 мм (друкарня)',
      bleedOnHint:
        'Кожна карта малюється на 3 мм більшою чорним з кожного боку й ріжеться окремо: якщо різак зійде, він вріжеться в чорне, а не лишить білу кромку. На аркуш їх влазить менше.',
      bleedOffHint:
        'Карти лежать впритул і ділять різ, тож один різ служить двом. На аркуш їх влазить більше, але будь-яке відхилення видно.',
      buildingPdf: 'Збираю PDF…',
      downloadPdf: 'Завантажити PDF для друку',
      pdfSizeHintBefore:
        'PDF несе розмір аркуша всередині, тому друкується в реальному масштабі. Усе ж у вікні друку виберіть ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' або «реальний розмір», але не «вписати в сторінку».',
      cardSizeHint: (w, h) =>
        `Кожна окрема карта виходить у ${w} × ${h} px — 63,5 × 88 мм при подвоєних 300 DPI.`,
    },
    errors: {
      openFailed: 'Не вдалося відкрити файл.',
      artFailed: 'Не вдалося завантажити зображення.',
      sheetFailed: 'Не вдалося зібрати аркуш.',
      cardsFailed: 'Не вдалося експортувати карти.',
      iconFailed: 'Не вдалося завантажити символ.',
      autosaveFull:
        'Колода не вміщається в автозбереження браузера: якщо перезавантажити сторінку, усе незбережене зникне. Збережіть її у файл.',
      noneFinished: 'Немає жодної готової карти для експорту. Зніміть галочку «Лише готові».',
      permissionDenied: (fileName) =>
        `Chrome просить дозвіл на запис у ${fileName}. Натисніть «Зберегти» ще раз і виберіть «Редагувати файл», або скористайтеся «Зберегти як…», щоб вибрати інший.`,
      'not-a-card': () => 'Цей файл — не карта Dune: Imperium.',
      'not-a-library': () => 'Цей файл — не бібліотека Dune: Imperium.',
      'empty-library': () => 'У цій бібліотеці немає ні символів, ні фракцій.',
      'no-cards': () => 'У файлі немає жодної карти.',
      'empty-image': ({ name }) => `Зображення порожнє: ${name}`,
      'read-failed': ({ name }) => `Не вдалося прочитати файл: ${name}`,
      'invalid-image': ({ name }) => `Це не придатне зображення: ${name}`,
      'canvas-failed': () => 'Браузер не зміг підготувати зображення.',
      'png-failed': () => 'Браузер не зміг створити PNG.',
      'sheet-canvas-failed': () => 'Браузер не зміг підготувати аркуш.',
      'sheet-read-failed': () => 'Браузер не зміг прочитати аркуш.',
      'card-canvas-failed': () => 'Не вдалося підготувати полотно карти.',
    },
  },
  bg: {
    topBar: {
      title: 'Dune: Imperium',
      subtitle: 'Card Generator',
      exporting: 'Експортиране на картата…',
      export: 'Експортиране на картата',
      exportTitle: 'Експортиране на отворената карта като PNG',
      defaultFileName: 'karta',
      language: 'Език',
      undo: 'Отмяна (Ctrl+Z)',
      redo: 'Повтаряне (Ctrl+Shift+Z)',
    },
    tabs: { front: 'Идентичност', rules: 'Правила' },
    doneBanner: {
      locked: 'Картата е готова и заключена, за да не се променя по погрешка.',
      unlock: 'Отключване',
    },
    doneBadge: {
      done: 'Готова',
      markDone: 'Отбелязване като готова',
      reopenTitle: 'Готова — щракнете, за да я отворите отново',
      markDoneTitle: 'Отбелязване като готова',
    },
    dialogs: {
      icons: 'Собствени символи',
      factions: 'Собствени фракции',
      print: 'Печат на тестето',
      about: 'Относно',
      close: 'Затваряне',
    },
    about: {
      fanMade:
        'Това е фенски проект за фенове, с нестопанска цел: безплатен е, няма реклами и за използването му не се плаща нищо.',
      ownership:
        'Dune: Imperium, разширенията ѝ, илюстрациите, символите и графичният ѝ дизайн са собственост на Dire Wolf Digital, LLC. «Дюна» и вселената на романа принадлежат на Herbert Properties LLC. Всички марки и права принадлежат на съответните им собственици.',
      notAffiliated:
        'Това приложение не е свързано с Dire Wolf Digital, нито с притежателите на марката «Дюна», и не е спонсорирано или одобрено от тях.',
      personalUse:
        'Картите, които правите тук, са за лично ползване: да играете вкъщи, да пробвате идеи и да ги споделяте с компанията си. Не са за продажба, нито за търговско производство. Ако играта ви харесва, купете оригинала и подкрепете тези, които са я направили.',
      takedown:
        'Ако имате права върху някой от тези материали и искате нещо да бъде свалено, пишете ни през хранилището и ще го решим.',
      source: 'Код и контакт',
    },
    deckFooter: {
      deckGroup: 'Тесте',
      libraryGroup: 'Библиотека',
      libraryGroupHint:
        'Вашите символи и фракции, запазени в този браузър, за да ги ползвате в различни тестета. С файла не пътуват: да вземете един означава да го копирате в тестето, а тестето носи PNG-то вътре.',
      unsavedName: 'Незапазено тесте',
      renameTitle: 'Преименуване на тестето',
      noNativeFsTooltip:
        'Тук файловете не могат да се презаписват, затова «Запазване» и «Запазване като…» свалят ново копие. Този API го има само в Chrome и Edge, но не и във вградения преглед на редактора: ако отворите приложението в прозорец на браузъра, «Запазване» пише в отворения файл без да пита.',
      noNativeFsBadge: 'Тук «Запазване» сваля копие',
      new: 'Ново',
      confirmNew: 'Това тесте има незапазени промени. Все пак да започнем ново?',
      open: 'Отваряне…',
      save: 'Запазване',
      saveAs: 'Запазване като…',
      icons: 'Символи…',
      factions: 'Фракции…',
      print: 'Печат…',
      exportAll: 'Експортиране на тестето…',
      exportingAll: 'Експортиране на тестето…',
      exportAllTitle: 'Експортиране на всички карти като отделни PNG, в един zip',
      onlyDone: 'Само готовите',
      onlyDoneTitle: (done, pending) =>
        `PDF-ът и zip-ът носят само готовите карти (${done}); останалите ${pending} остават отвън.`,
      onlyDoneEmpty: 'Още няма карта, отбелязана като готова.',
    },
    gallery: {
      title: 'Карти',
      newCardTitle: 'Нова карта',
      newButton: 'Нова карта',
      unnamed: 'Без име',
      duplicate: 'Дублиране',
      remove: 'Изтриване',
      doneStamp: 'Готова',
      reopenTitle: 'Готова — щракнете, за да я отворите отново',
      markDoneTitle: 'Отбелязване като готова',
      markPendingAria: 'Отбелязване като незавършена',
      copiesStamp: (copies) => `${copies} екземпляра в тестето`,
    },
    cardPanel: {
      name: 'Име',
      namePlaceholder: 'Duncan Idaho',
      editOnCard: 'Написване на името',
      startingCard: 'Начална',
      startingCardHint:
        'Картите от началното тесте имат ромб преди името, а заглавието започва по-надясно, за да му остави място.',
      faction: 'Фракция',
      factionHint:
        'Подреждат се надолу точно в този ред, независимо в какъв ред ги изберете. До 4 на карта.',
      cost: 'Цена за придобиване',
      hasCost: 'Има цена',
      persuasion: 'Убеждаване',
      costOnCard: 'Промяна на цената',
      purchaseBenefit: 'Бонус при придобиване',
      none: 'Няма',
      custom: (label) => `Собствен · ${label}`,
      amount: 'Количество',
      otherValue: 'Друга стойност',
      agentIcons: 'Символи на агента',
      infiltrateHint:
        'Rise of Ix: агентът може да отиде на поле, вече заето от съперник. Това са същите седем символа, с друга рамка.',
      copies: 'Екземпляри',
      copiesHint:
        'Колко пъти тази карта е в тестето. Запазва се във файла и се използва от печатния лист; zip-ът с PNG дава по един файл на карта.',
    },
    contentEditor: {
      empty: 'Празно поле.',
      textPlaceholder: 'Текст…',
      emptyText: 'Текст',
      editOnCard: 'Написване на текста',
      amountOnCard: 'Промяна на количеството',
      lineBreak: '— нов ред —',
      deletedIcon: 'Изтрит символ',
      addTo: 'Добавяне към',
      close: 'Затваряне',
      addIcon: 'Символ…',
      addText: 'Текст',
      addLineBreak: 'Нов ред',
      remove: 'Премахване',
      custom: 'Собствени',
      core: 'Dune Imperium',
      influence: 'Влияние по фракции',
      decrease: (label) => `Намаляване на ${label}`,
      increase: (label) => `Увеличаване на ${label}`,
    },
    rulesPanel: {
      playTurn: 'Ход на агента',
      autoAdjust: 'Автоматична височина',
      autoAdjustHint:
        'Полето има три височини — 1, 2 или 3 реда — и така остава на най-малката, в която съдържанието се побира. Изключете го, за да я зададете ръчно.',
      agentSilhouette: 'Силует на агента',
      agentSilhouetteHint:
        'Фигурата зад съдържанието на полето. На готовата карта символите я покриват почти изцяло: сама изглежда по-подчертана, отколкото ще изглежда после.',
      reveal: 'Разкриване',
      contentHint: 'Плъзгайте символи, текст и нови редове, за да ги добавите или подредите.',
      unload: 'Unload',
      unloadHint:
        'Rise of Ix: разкриването важи и когато картата се изхвърля или унищожава. Лентата заема началото на ивицата, затова съдържанието се побира по-тясно.',
    },
    artPanel: {
      image: 'Изображение',
      changeImage: 'Смяна на изображението…',
      chooseImage: 'Избор на изображение…',
      remove: 'Премахване',
      zoom: 'Мащаб',
      fit: 'Побиране',
      center: 'Центриране',
      rotate: 'Завъртане на четвърт оборот',
      flip: 'Огледално',
      dragZoomHint:
        'Влачете изображението по картата, за да го местите; колелцето мащабира. Може и да поставите изображение с Ctrl+V.',
      placeholder: 'Пуснете изображение тук\nили докоснете, за да изберете',
      frame: 'Кадриране',
      frameFree: 'Свободно кадриране',
      frameLocked: 'Заключено кадриране',
    },
    iconPanel: {
      deckTitle: 'В това тесте',
      deckHint:
        'Тези, с които това тесте разполага: тях предлага изборът за полетата и те пътуват във файла, така че тестето изглежда еднакво и на друга машина. Размерът и името са оттук и не пипат библиотеката.',
      libraryTitle: 'Моята библиотека',
      libraryHint:
        'Тези, които някога сте качили, запазени в този браузър. С тестето не пътуват и не се рисуват: оттук се копира, за да не качвате едно и също във всяко тесте.',
      emptyLibraryHint: 'Още не сте запазили нито един символ в библиотеката.',
      usedIn: (cards) => `В ${pluralCards(cards, 'bg')}`,
      unused: 'Неизползван',
      alreadyInDeck: 'Вече е в тестето',
      toLibraryLabel: (label) => `Запазване на ${label} в моята библиотека`,
      toDeckLabel: (label) => `Прехвърляне на ${label} в това тесте`,
      forgetLabel: (label) => `Премахване на ${label} от моята библиотека`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» излиза от библиотеката ви и няма да можете да го прехвърлите в други тестета. Тестетата, които вече го имат вътре, не се променят. Да го премахнем ли?`,
      emptyHint:
        'За правила, които играта не носи. Остават достъпни във всичките ви тестета и се появяват в края на избора на символи.',
      nameLabel: (label) => `Име на ${label}`,
      heightTitle: 'Височина върху картата, в % от символа на играта',
      heightLabel: (label) => `Височина на ${label} върху картата, в % от символа на играта`,
      decreaseHeightLabel: (label) => `Смаляване на ${label}`,
      increaseHeightLabel: (label) => `Уголемяване на ${label}`,
      showNumberText: 'Число',
      showNumberLabel: (label) => `Показване на число върху ${label}`,
      numberColorTitle: 'Цвят на числото',
      numberColorLabel: (label) => `Цвят на числото на ${label}`,
      upload: 'Качване на символ…',
      hint: 'PNG с прозрачност, изрязват се сами по съдържанието. Процентът е височината върху картата в сравнение със символ на играта. Остават запазени в този браузър, а тестето носи вътре тези, които картите му използват.',
      confirmRemove: (label, used) =>
        `«${label}» е в ${pluralCards(used, 'bg')} от това тесте. Ако го изтриете, тези карти го губят.`,
      removeLabel: (label) => `Изтриване на ${label}`,
    },
    factionPanel: {
      deckTitle: 'В това тесте',
      deckHint:
        'Тези, с които това тесте разполага: тях предлага изборът на фракция и те пътуват във файла. Името и цветът са оттук и не пипат библиотеката.',
      libraryTitle: 'Моята библиотека',
      libraryHint:
        'Тези, които някога сте сглобили, запазени в този браузър. С тестето не пътуват: оттук се копира, за да не качвате емблемата във всяко тесте.',
      emptyLibraryHint: 'Още не сте запазили нито една фракция в библиотеката.',
      usedIn: (cards) => `В ${pluralCards(cards, 'bg')}`,
      unused: 'Неизползвана',
      alreadyInDeck: 'Вече е в тестето',
      toLibraryLabel: (label) => `Запазване на ${label} в моята библиотека`,
      toDeckLabel: (label) => `Прехвърляне на ${label} в това тесте`,
      forgetLabel: (label) => `Премахване на ${label} от моята библиотека`,
      confirmRemoveFromLibrary: (label) =>
        `«${label}» излиза от библиотеката ви и няма да можете да я прехвърлите в други тестета. Тестетата, които вече я имат вътре, не се променят. Да я премахнем ли?`,
      emptyHint:
        'За тестета с фракции, които играта не носи. Остават достъпни във всичките ви тестета и сами генерират 4-те ромба «+1/−1 влияние» на тази фракция, готови за използване в съдържанието на карта.',
      nameLabel: (label) => `Име на ${label}`,
      colorTitle: 'Цвят на ивицата',
      colorLabel: (label) => `Цвят на ивицата на ${label}`,
      hexLabel: (label) => `Цвят на ивицата на ${label} в шестнадесетичен вид`,
      upload: 'Качване на емблема…',
      hint: 'PNG с прозрачност, изрязва се сам по съдържанието. Остават запазени в този браузър, а тестето носи вътре тези, които картите му използват. Като символ на агент седят върху обикновена черна плочка, без рамката на тези от правилата.',
      confirmRemove: (label, used) =>
        `«${label}» е в ${pluralCards(used, 'bg')} от това тесте. Ако я изтриете, тези карти губят ивицата, символа на агента или ромба, който я назовава.`,
      removeLabel: (label) => `Изтриване на ${label}`,
    },
    libraryFile: {
      unnamed: 'Библиотека без име',
      renameTitle: 'Дайте име на библиотеката си',
      export: 'Експортиране…',
      exportTitle:
        'Запазва цялата ви библиотека — символи и фракции — във файл, за да я пренесете на друг компютър или да имате копие. Библиотеката живее само в този браузър.',
      import: 'Импортиране…',
      importTitle:
        'Внася в библиотеката ви това, което съдържа файл на библиотека. Каквото вече сте имали със същото id, си остава както е.',
      imported: (icons, factions) =>
        `Към библиотеката ви са добавени ${pluralIcons(icons, 'bg')} и ${pluralFactions(factions, 'bg')}.`,
    },
    printPanel: {
      perSheetSuffix: 'на лист.',
      fitsOnOne: 'Тестето се побира на един.',
      spansPages: (pages) => `Тестето заема ${pages}.`,
      deckCopies: 'Копия на цялото тесте',
      onlyDoneHint: (cards) =>
        `Печатат се само готовите: ${pluralCards(cards, 'bg')} от тестето.`,
      copiesOtherValue: 'Друго количество',
      copiesDecrease: 'Махане на едно копие',
      copiesIncrease: 'Добавяне на едно копие',
      copiesHint: (total) => `Общо ${pluralCards(total, 'bg')}.`,
      bleedToggle: 'Отстъп 3 мм (печатница)',
      bleedOnHint:
        'Всяка карта се рисува с 3 мм по-голяма в черно от всяка страна и се реже отделно: ако гилотината се измести, реже в черното, а не оставя бял кант. На лист се побират по-малко.',
      bleedOffHint:
        'Картите са долепени и делят реза, така че един рез служи за две. На лист се побират повече, но всяко отклонение си личи.',
      buildingPdf: 'Сглобяване на PDF…',
      downloadPdf: 'Изтегляне на PDF за печат',
      pdfSizeHintBefore:
        'PDF-ът носи размера на листа вътре, така че се печата в реален мащаб. Все пак в прозореца за печат изберете ',
      pdfSizeHintBold: '100 %',
      pdfSizeHintAfter: ' или «реален размер», никога «побиране в страницата».',
      cardSizeHint: (w, h) =>
        `Всяка отделна карта излиза в ${w} × ${h} px — 63,5 × 88 мм при удвоени 300 DPI.`,
    },
    errors: {
      openFailed: 'Файлът не можа да бъде отворен.',
      artFailed: 'Изображението не можа да бъде заредено.',
      sheetFailed: 'Листът не можа да бъде сглобен.',
      cardsFailed: 'Картите не можаха да бъдат експортирани.',
      iconFailed: 'Символът не можа да бъде зареден.',
      autosaveFull:
        'Тестето не се побира в автоматичното запазване на браузъра: ако презаредите страницата, всичко незапазено се губи. Запазете го във файл.',
      noneFinished: 'Няма нито една готова карта за експортиране. Махнете отметката «Само готовите».',
      permissionDenied: (fileName) =>
        `Chrome иска разрешение да пише в ${fileName}. Натиснете «Запазване» отново и изберете «Редактиране на файла», или използвайте «Запазване като…», за да изберете друг.`,
      'not-a-card': () => 'Този файл не е карта на Dune: Imperium.',
      'not-a-library': () => 'Този файл не е библиотека на Dune: Imperium.',
      'empty-library': () => 'В тази библиотека няма нито символи, нито фракции.',
      'no-cards': () => 'Файлът няма нито една карта.',
      'empty-image': ({ name }) => `Изображението е празно: ${name}`,
      'read-failed': ({ name }) => `Файлът не можа да бъде прочетен: ${name}`,
      'invalid-image': ({ name }) => `Не е валидно изображение: ${name}`,
      'canvas-failed': () => 'Браузърът не успя да подготви изображението.',
      'png-failed': () => 'Браузърът не успя да създаде PNG.',
      'sheet-canvas-failed': () => 'Браузърът не успя да подготви листа.',
      'sheet-read-failed': () => 'Браузърът не успя да прочете листа.',
      'card-canvas-failed': () => 'Платното на картата не можа да бъде подготвено.',
    },
  },
}

/** El texto de una cantidad de cartas, con el número adelante. */
/**
 * Los dos números del aviso de "biblioteca importada". Van juntos y no en
 * `Strings` porque son la misma cuenta en los tres idiomas: singular o plural
 * de dos palabras.
 */
/**
 * El polaco, el checo, el ruso y el ucraniano tienen **tres** formas de plural
 * y las cuatro las eligen igual: 1 (pero no 11), 2–4 (pero no 12–14), y el
 * resto. Con dos ramas —una para el singular y otra para todo lo demás—
 * saldrían cosas como «5 karty» o «22 карт», que es exactamente el error que
 * delata una traducción hecha desde el inglés.
 *
 * El húngaro va al revés: después de un número el sustantivo queda en
 * singular, así que no lleva rama de plural en ningún lado.
 */
const slavic = (n: number, one: string, few: string, many: string): string => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function pluralIcons(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 icon' : `${n} icons`
  if (language === 'pt') return n === 1 ? '1 ícone' : `${n} ícones`
  if (language === 'fr') return n === 1 ? '1 icône' : `${n} icônes`
  if (language === 'de') return n === 1 ? '1 Symbol' : `${n} Symbole`
  if (language === 'it') return n === 1 ? '1 icona' : `${n} icone`
  if (language === 'hu') return `${n} ikon`
  if (language === 'bg') return n === 1 ? '1 символ' : `${n} символа`
  if (language === 'pl') return `${n} ${slavic(n, 'ikona', 'ikony', 'ikon')}`
  if (language === 'cs') return `${n} ${slavic(n, 'symbol', 'symboly', 'symbolů')}`
  if (language === 'ru') return `${n} ${slavic(n, 'символ', 'символа', 'символов')}`
  if (language === 'uk') return `${n} ${slavic(n, 'символ', 'символи', 'символів')}`
  return n === 1 ? '1 icono' : `${n} iconos`
}

export function pluralFactions(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 faction' : `${n} factions`
  if (language === 'pt') return n === 1 ? '1 facção' : `${n} facções`
  if (language === 'fr') return n === 1 ? '1 faction' : `${n} factions`
  if (language === 'de') return n === 1 ? '1 Fraktion' : `${n} Fraktionen`
  if (language === 'it') return n === 1 ? '1 fazione' : `${n} fazioni`
  if (language === 'hu') return `${n} frakció`
  if (language === 'bg') return n === 1 ? '1 фракция' : `${n} фракции`
  if (language === 'pl') return `${n} ${slavic(n, 'frakcja', 'frakcje', 'frakcji')}`
  if (language === 'cs') return `${n} ${slavic(n, 'frakce', 'frakce', 'frakcí')}`
  if (language === 'ru') return `${n} ${slavic(n, 'фракция', 'фракции', 'фракций')}`
  if (language === 'uk') return `${n} ${slavic(n, 'фракція', 'фракції', 'фракцій')}`
  return n === 1 ? '1 facción' : `${n} facciones`
}

/** El portugués cae en el mismo «carta / cartas» del castellano. */
export function pluralCards(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 card' : `${n} cards`
  if (language === 'fr') return n === 1 ? '1 carte' : `${n} cartes`
  if (language === 'de') return n === 1 ? '1 Karte' : `${n} Karten`
  if (language === 'it') return n === 1 ? '1 carta' : `${n} carte`
  if (language === 'hu') return `${n} kártya`
  if (language === 'bg') return n === 1 ? '1 карта' : `${n} карти`
  if (language === 'pl') return `${n} ${slavic(n, 'karta', 'karty', 'kart')}`
  if (language === 'cs') return `${n} ${slavic(n, 'karta', 'karty', 'karet')}`
  if (language === 'ru') return `${n} ${slavic(n, 'карта', 'карты', 'карт')}`
  if (language === 'uk') return `${n} ${slavic(n, 'карта', 'карти', 'карт')}`
  return n === 1 ? '1 carta' : `${n} cartas`
}

/**
 * Sólo la palabra, para cuando el número ya va aparte en el texto. Igual
 * recibe `n`, porque la forma depende de la cantidad que la precede.
 */
export function cardWord(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? 'card' : 'cards'
  if (language === 'fr') return n === 1 ? 'carte' : 'cartes'
  if (language === 'de') return n === 1 ? 'Karte' : 'Karten'
  if (language === 'it') return n === 1 ? 'carta' : 'carte'
  if (language === 'hu') return 'kártya'
  if (language === 'bg') return n === 1 ? 'карта' : 'карти'
  if (language === 'pl') return slavic(n, 'karta', 'karty', 'kart')
  if (language === 'cs') return slavic(n, 'karta', 'karty', 'karet')
  if (language === 'ru') return slavic(n, 'карта', 'карты', 'карт')
  if (language === 'uk') return slavic(n, 'карта', 'карти', 'карт')
  return n === 1 ? 'carta' : 'cartas'
}

/** Cuántas cartas están marcadas como terminadas, con el número adelante. */
export function pluralDone(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 finished' : `${n} finished`
  if (language === 'pt') return n === 1 ? '1 finalizada' : `${n} finalizadas`
  if (language === 'fr') return n === 1 ? '1 terminée' : `${n} terminées`
  if (language === 'de') return n === 1 ? '1 fertig' : `${n} fertige`
  if (language === 'it') return n === 1 ? '1 finita' : `${n} finite`
  if (language === 'hu') return `${n} kész`
  if (language === 'bg') return n === 1 ? '1 готова' : `${n} готови`
  if (language === 'pl') return `${n} ${slavic(n, 'gotowa', 'gotowe', 'gotowych')}`
  if (language === 'cs') return `${n} ${slavic(n, 'hotová', 'hotové', 'hotových')}`
  if (language === 'ru') return `${n} ${slavic(n, 'готовая', 'готовые', 'готовых')}`
  if (language === 'uk') return `${n} ${slavic(n, 'готова', 'готові', 'готових')}`
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
