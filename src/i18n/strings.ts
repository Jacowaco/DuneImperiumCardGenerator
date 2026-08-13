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
  if (language === 'fr') return n === 1 ? '1 icône' : `${n} icônes`
  if (language === 'de') return n === 1 ? '1 Symbol' : `${n} Symbole`
  return n === 1 ? '1 icono' : `${n} iconos`
}

export function pluralFactions(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 faction' : `${n} factions`
  if (language === 'pt') return n === 1 ? '1 facção' : `${n} facções`
  if (language === 'fr') return n === 1 ? '1 faction' : `${n} factions`
  if (language === 'de') return n === 1 ? '1 Fraktion' : `${n} Fraktionen`
  return n === 1 ? '1 facción' : `${n} facciones`
}

/** El portugués cae en el mismo «carta / cartas» del castellano. */
export function pluralCards(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 card' : `${n} cards`
  if (language === 'fr') return n === 1 ? '1 carte' : `${n} cartes`
  if (language === 'de') return n === 1 ? '1 Karte' : `${n} Karten`
  return n === 1 ? '1 carta' : `${n} cartas`
}

/** Sólo la palabra, para cuando el número ya va aparte en el texto. */
export function cardWord(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? 'card' : 'cards'
  if (language === 'fr') return n === 1 ? 'carte' : 'cartes'
  if (language === 'de') return n === 1 ? 'Karte' : 'Karten'
  return n === 1 ? 'carta' : 'cartas'
}

/** Cuántas cartas están marcadas como terminadas, con el número adelante. */
export function pluralDone(n: number, language: Language): string {
  if (language === 'en') return n === 1 ? '1 finished' : `${n} finished`
  if (language === 'pt') return n === 1 ? '1 finalizada' : `${n} finalizadas`
  if (language === 'fr') return n === 1 ? '1 terminée' : `${n} terminées`
  if (language === 'de') return n === 1 ? '1 fertig' : `${n} fertige`
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
