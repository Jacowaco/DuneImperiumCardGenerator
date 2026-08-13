import type Konva from 'konva'
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { flushSync } from 'react-dom'

import { exportCardsPng } from './export/exportPngBatch'
import { exportCardPng } from './export/exportPng'
import type { PaperId } from './export/paper'
import { exportPrintSheets } from './export/printSheet'
import { describeError, stringsFor } from './i18n/strings'
import { loadArtFromFile } from './model/art'
import { emptyCard, type ArtTransform, type Card } from './model/card'
import { mergeFactions, type CustomFaction } from './model/customFaction'
import { mergeIcons, type CustomIcon } from './model/customIcon'
import { warmFactionAgentIcons, warmFactionInfluenceIcons, warmFactionPickerBadges } from './model/factionArt'
import { buildFactionLibrary, FactionLibraryProvider } from './model/factionLibrary'
import {
  adoptFactions,
  listLibraryFactions,
  saveLibraryFaction,
  syncFactionLibrary,
} from './model/factionStore'
import {
  isCancelled,
  openDeck,
  openDeckFromFile,
  openText,
  saveDeck,
  saveDeckAs,
  saveTextAs,
  suggestedName,
  type OpenedDeck,
} from './model/files'
import { parseLibrary, serializeLibrary, suggestedLibraryName } from './model/libraryFile'
import { buildIconLibrary, IconLibraryProvider } from './model/iconLibrary'
import { adoptIcons, listLibraryIcons, saveLibraryIcon, syncLibrary } from './model/iconStore'
import { LanguageProvider, useLanguageState } from './model/language'
import { recallDeckFile, rememberDeckFile } from './model/recentFile'
import { emptyDeck, loadAutosave, saveAutosave, type Deck } from './model/storage'
import { CardStage } from './render/CardStage'
import { useFitScale } from './render/useFitScale'
import { ArtPanel } from './ui/ArtPanel'
import { CardDropZones } from './ui/CardDropZones'
import { CardNameField } from './ui/CardNameField'
import { CardGallery } from './ui/CardGallery'
import { ContentDragProvider } from './ui/contentDrag'
import { DeckFileControls } from './ui/DeckFileControls'
import { CardPanel } from './ui/CardPanel'
import { Button } from './ui/controls'
import { Dialog } from './ui/Dialog'
import { BannerIcon, DiamondIcon, DownloadIcon, ImageIcon, PrinterIcon, RulesIcon } from './ui/icons'
import { FactionPanel } from './ui/FactionPanel'
import { IconPanel } from './ui/IconPanel'
import { PrintPanel } from './ui/PrintPanel'
import { RulesPanel } from './ui/RulesPanel'
import { Tabs } from './ui/Tabs'
import { TopBar } from './ui/TopBar'

type TabId = 'front' | 'rules'

/** Lo del mazo se abre en diálogo: se usa cada tanto y no gana lugar fijo. */
type DialogId = 'icons' | 'factions' | 'print'

/** Un punto del historial de deshacer: el mazo y qué carta estaba abierta. */
type HistoryPoint = { deck: Deck; selected: number }

/** Cuántos pasos guarda el historial. El mazo no se clona —las ediciones ya
 *  son inmutables—, así que guardar más no pesa: es sólo la referencia. */
const HISTORY_LIMIT = 100

/**
 * Cambios seguidos con la misma `coalesceKey` (arrastrar la imagen, escribir
 * en un campo) no abren un paso nuevo mientras no pase esta pausa: si no,
 * deshacer un renglón de texto lo haría letra por letra.
 */
const COALESCE_MS = 700

export function App() {
  const { language, setLanguage } = useLanguageState()
  const t = stringsFor(language)

  /**
   * El orden es el de armar una carta: primero qué es —imagen, nombre,
   * facción y costo—, y por eso también es la pestaña con la que arranca.
   */
  const TABS = [
    { value: 'front' as const, label: t.tabs.front, icon: <ImageIcon /> },
    { value: 'rules' as const, label: t.tabs.rules, icon: <RulesIcon /> },
  ]

  // Recuperar el archivo de la sesión anterior sólo tiene sentido si el mazo
  // también viene de ahí: si arrancamos con una carta vacía, "Guardar" no
  // debería pisar el mazo que se estaba editando antes.
  const fromAutosave = useRef(false)
  const [deck, setDeck] = useState<Deck>(() => {
    const saved = loadAutosave()
    fromAutosave.current = saved !== null
    return saved ?? emptyDeck()
  })
  const [selected, setSelected] = useState(0)
  const [tab, setTab] = useState<TabId>('front')
  const [dialog, setDialog] = useState<DialogId | null>(null)
  const [exporting, setExporting] = useState(false)
  const [sheetExporting, setSheetExporting] = useState(false)
  const [cardsExporting, setCardsExporting] = useState(false)

  // Cómo se imprime es una preferencia del que imprime, no del mazo: no se
  // guarda en el archivo ni viaja con él.
  const [paper, setPaper] = useState<PaperId>('a4')
  const [bleed, setBleed] = useState(false)
  const [copies, setCopies] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Lo que salió bien también hay que decirlo: importar una biblioteca no
  // cambia nada de lo que se ve, así que sin aviso parece que no hizo nada.
  const [notice, setNotice] = useState<string | null>(null)

  // Archivo abierto: el handle es lo que permite sobrescribirlo sin volver a
  // preguntar dónde. Sin handle, "Guardar" se comporta como "Guardar como".
  const [file, setFile] = useState<Pick<OpenedDeck, 'handle' | 'name'> | null>(null)
  const [dirty, setDirty] = useState(false)

  // Deshacer/rehacer: una pila de mazos anteriores y una de los que se
  // deshicieron, para poder rehacerlos. `coalesceRef` es lo que evita que
  // arrastrar la imagen o escribir un campo abran un paso por cada frame o
  // cada tecla — ver `mutate`.
  const [past, setPast] = useState<HistoryPoint[]>([])
  const [future, setFuture] = useState<HistoryPoint[]>([])
  const coalesceRef = useRef<{ key: string; time: number } | null>(null)

  /**
   * La biblioteca de iconos propios: los que subiste alguna vez, guardados en
   * este navegador. **No es lo que se dibuja** —eso es `deck.icons`— sino el
   * lugar de donde se copian a un mazo. Ver `iconStore.ts`.
   */
  const [myIcons, setMyIcons] = useState<CustomIcon[]>([])
  // Mismo patrón que los iconos propios: una lista del usuario, guardada en
  // el navegador y disponible en todos los mazos.
  const [myFactions, setMyFactions] = useState<CustomFaction[]>([])

  useEffect(() => {
    // La biblioteca se lee una vez al arrancar; después la mueven los paneles.
    void listLibraryIcons().then(setMyIcons)
    void listLibraryFactions().then(setMyFactions)
  }, [])

  const { cards } = deck

  // Los rombos de influencia, la placa del selector y el icono de agente de
  // una facción propia se generan en canvas (`factionArt.ts`) y no están
  // listos apenas se sube el emblema. Este contador fuerza un rebuild de las
  // dos bibliotecas cuando terminan de calentar —si no, nada de eso
  // aparecería hasta que algo más disparara un rebuild.
  const [factionArtReady, setFactionArtReady] = useState(0)
  useEffect(() => {
    let alive = true
    void Promise.all([
      warmFactionInfluenceIcons(deck.factions),
      warmFactionPickerBadges(deck.factions),
      warmFactionAgentIcons(deck.factions),
    ]).then(() => {
      if (alive) setFactionArtReady((count) => count + 1)
    })
    return () => {
      alive = false
    }
  }, [deck.factions])

  /*
    El catálogo que ven el render y los paneles es **el del mazo abierto**, no
    la biblioteca: si el selector de las cajas ofreciera un icono que no está
    en el archivo, la carta se vería bien acá y saldría con un hueco en
    cualquier otra máquina. La biblioteca se toca sólo desde su diálogo, para
    copiar en las dos direcciones.
  */
  const factionLibrary = useMemo(
    () => buildFactionLibrary(deck.factions, language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck.factions, language, factionArtReady],
  )
  const library = useMemo(
    () => buildIconLibrary(deck.icons, deck.factions, language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck.icons, deck.factions, language, factionArtReady],
  )

  // Los iconos y las facciones del mazo son parte del mazo, como cualquier
  // carta: van por `mutate`, así que se deshacen y marcan el archivo como sin
  // guardar. La biblioteca no —es del navegador— y baja a IndexedDB.
  const setDeckIcons = (icons: CustomIcon[]) => mutate((current) => ({ ...current, icons }))
  const setDeckFactions = (factions: CustomFaction[]) =>
    mutate((current) => ({ ...current, factions }))

  const updateIcons = (next: CustomIcon[]) => {
    void syncLibrary(myIcons, next)
    setMyIcons(next)
  }

  const updateFactions = (next: CustomFaction[]) => {
    void syncFactionLibrary(myFactions, next)
    setMyFactions(next)
  }

  /**
   * Del mazo a la biblioteca: una copia, con lo que se le haya editado acá.
   * Pisa la que hubiera con el mismo id — volver a guardar un icono que ya
   * tenías es justamente decir "quedate con esta versión".
   */
  const copyIconToLibrary = (icon: CustomIcon) => {
    void saveLibraryIcon(icon)
    setMyIcons((current) => mergeIcons(current, [icon]))
  }

  const copyFactionToLibrary = (faction: CustomFaction) => {
    void saveLibraryFaction(faction)
    setMyFactions((current) => mergeFactions(current, [faction]))
  }

  /**
   * De la biblioteca al mazo. Al revés que arriba **no pisa**: la copia del
   * mazo puede tener un tamaño ajustado para estas cartas, y traerla de nuevo
   * no puede deshacer ese trabajo sin que lo pidan.
   */
  const copyIconToDeck = (icon: CustomIcon) => {
    if (deck.icons.some((item) => item.id === icon.id)) return
    setDeckIcons([...deck.icons, icon])
  }

  const copyFactionToDeck = (faction: CustomFaction) => {
    if (deck.factions.some((item) => item.id === faction.id)) return
    setDeckFactions([...deck.factions, faction])
  }

  /**
   * La biblioteca entera en un archivo. Va junta —iconos y facciones— porque
   * las dos son lo mismo para el usuario: lo suyo, que vive sólo en este
   * navegador y que hasta ahora no había forma de mudar ni de respaldar.
   */
  const exportLibrary = () =>
    run(() => saveTextAs(serializeLibrary(myIcons, myFactions), suggestedLibraryName()))

  const importLibraryText = async (json: string) => {
    const { icons, factions } = parseLibrary(json)
    // Adoptar y no pisar: lo que ya tenías con ese id es el que vale, igual
    // que al abrir un mazo con biblioteca adentro.
    if (icons.length) setMyIcons(await adoptIcons(icons))
    if (factions.length) setMyFactions(await adoptFactions(factions))
    setNotice(t.libraryFile.imported(icons.length, factions.length))
  }

  const importLibrary = () =>
    run(async () => {
      const json = await openText()
      // Sin diálogo nativo (Firefox, Safari) queda el `<input type=file>`.
      if (json === null) libraryInputRef.current?.click()
      else await importLibraryText(json)
    })

  // El índice puede quedar fuera de rango al abrir un mazo más corto.
  const index = Math.min(selected, cards.length - 1)
  const card = cards[index]

  // Autoguardado: recargar la página no debería costar el trabajo hecho.
  useEffect(() => {
    const timer = setTimeout(() => saveAutosave(deck), 500)
    return () => clearTimeout(timer)
  }, [deck])

  // El handle sobrevive a la recarga, así que "Guardar" sigue yendo al mismo
  // archivo. El permiso de escritura no sobrevive: se vuelve a pedir al
  // guardar, que es un click y puede abrir el diálogo.
  useEffect(() => {
    if (!fromAutosave.current) return
    void recallDeckFile().then((handle) => {
      if (handle) setFile({ handle, name: handle.name })
    })
  }, [])

  const stageRef = useRef<Konva.Stage | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const libraryInputRef = useRef<HTMLInputElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const previewScale = useFitScale(previewRef)

  // El panel de la izquierda es donde se arrastran iconos hacia las cajas de
  // contenido (`ContentEditor`), y una fila destino más abajo del alto
  // visible queda inalcanzable: el autoscroll nativo del navegador durante un
  // drag HTML5 no confía en contenedores `overflow-y-auto` anidados, sólo en
  // la ventana. Se captura el evento en el contenedor (fase de captura, para
  // que llegue aunque una fila más adentro frene la propagación) y se mueve
  // `scrollTop` a mano cuando el puntero está cerca del borde de arriba o de
  // abajo.
  const panelScrollRef = useRef<HTMLDivElement | null>(null)
  const AUTOSCROLL_MARGIN = 48
  const AUTOSCROLL_MAX_SPEED = 16
  const handlePanelAutoScroll = (event: DragEvent) => {
    const el = panelScrollRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const distanceToTop = event.clientY - rect.top
    const distanceToBottom = rect.bottom - event.clientY
    if (distanceToTop < AUTOSCROLL_MARGIN) {
      el.scrollTop -= AUTOSCROLL_MAX_SPEED * (1 - Math.max(distanceToTop, 0) / AUTOSCROLL_MARGIN)
    } else if (distanceToBottom < AUTOSCROLL_MARGIN) {
      el.scrollTop +=
        AUTOSCROLL_MAX_SPEED * (1 - Math.max(distanceToBottom, 0) / AUTOSCROLL_MARGIN)
    }
  }

  /**
   * Todo cambio del mazo pasa por acá, para no olvidarse de marcar sin
   * guardar y para llevar el historial de deshacer.
   *
   * `coalesceKey` agrupa cambios seguidos en un solo paso: si el anterior
   * tenía la misma clave y pasó hace menos de `COALESCE_MS`, no se abre un
   * paso nuevo — así arrastrar la imagen o escribir un campo queda como un
   * solo "deshacer" y no uno por frame o por tecla.
   */
  const mutate = (update: (current: Deck) => Deck, opts?: { coalesceKey?: string }) => {
    const key = opts?.coalesceKey ?? null
    const now = Date.now()
    const last = coalesceRef.current
    const coalescing = key !== null && last !== null && last.key === key && now - last.time < COALESCE_MS
    if (!coalescing) {
      setPast((current) => [...current.slice(-HISTORY_LIMIT + 1), { deck, selected }])
      setFuture([])
    }
    coalesceRef.current = key ? { key, time: now } : null
    setDeck(update)
    setDirty(true)
  }

  /** Atajo para lo más común, que es cambiar sólo las cartas. */
  const mutateCards = (update: (current: Card[]) => Card[], opts?: { coalesceKey?: string }) =>
    mutate((current) => ({ ...current, cards: update(current.cards) }), opts)

  /**
   * Aplica un cambio sólo a la carta abierta. La clave de agrupamiento sale
   * sola de qué campos toca el patch —"title", "art", "playContent"— y de la
   * carta: no hace falta que cada campo de cada panel la piense.
   */
  const patchCard = (patch: Partial<Card>) =>
    mutateCards(
      (current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      { coalesceKey: `card:${index}:${Object.keys(patch).sort().join(',')}` },
    )

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const undo = () => {
    if (past.length === 0) return
    const point = past[past.length - 1]
    setPast((current) => current.slice(0, -1))
    setFuture((current) => [{ deck, selected }, ...current])
    setDeck(point.deck)
    setSelected(point.selected)
    setDirty(true)
    coalesceRef.current = null
  }

  const redo = () => {
    if (future.length === 0) return
    const point = future[0]
    setFuture((current) => current.slice(1))
    setPast((current) => [...current, { deck, selected }])
    setDeck(point.deck)
    setSelected(point.selected)
    setDirty(true)
    coalesceRef.current = null
  }

  // El listener queda enganchado una sola vez; los refs le pasan la versión
  // vigente de undo/redo sin tener que desenganchar y reenganchar en cada
  // cambio de mazo, que con el drag de la imagen sería en cada frame.
  const undoRef = useRef(undo)
  const redoRef = useRef(redo)
  undoRef.current = undo
  redoRef.current = redo

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      // Adentro de un diálogo (iconos propios, imprimir) el atajo es del
      // diálogo, no del mazo.
      if ((event.target as HTMLElement | null)?.closest('dialog[open]')) return
      event.preventDefault()
      if (event.shiftKey) redoRef.current()
      else undoRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const addCard = (newCard: Card) => {
    mutateCards((current) => [...current, newCard])
    setSelected(cards.length)
  }

  const toggleDone = (target: number) =>
    mutateCards((current) =>
      current.map((item, i) => (i === target ? { ...item, done: !item.done } : item)),
    )

  const removeCard = (target: number) => {
    mutateCards((current) => current.filter((_, i) => i !== target))
    setSelected((current) => (target < current ? current - 1 : current))
  }

  /** Todo cambio del archivo abierto pasa por acá, para recordarlo. */
  const openFile = (next: Pick<OpenedDeck, 'handle' | 'name'> | null) => {
    setFile(next)
    void rememberDeckFile(next?.handle ?? null)
  }

  const loadDeck = (opened: OpenedDeck) => {
    setDeck(opened.deck)
    setSelected(0)
    // Abrir otro mazo no debería dejar deshacer hacia el que estaba antes.
    setPast([])
    setFuture([])
    coalesceRef.current = null
    openFile({ handle: opened.handle, name: opened.name })
    setDirty(false)
    // A la biblioteca entra sólo lo que el que guardó eligió compartir con el
    // toggle "Incluir biblioteca". Los iconos del mazo se quedan en el mazo:
    // son suyos y se dibujan igual, y pasarlos a tu biblioteca es una copia
    // que se pide desde el diálogo.
    if (opened.library.length) void adoptIcons(opened.library).then(setMyIcons)
    if (opened.factionLibrary.length) void adoptFactions(opened.factionLibrary).then(setMyFactions)
  }

  const newDeck = () => {
    if (dirty && !confirm(t.deckFooter.confirmNew)) return
    setDeck(emptyDeck())
    setSelected(0)
    setPast([])
    setFuture([])
    coalesceRef.current = null
    openFile(null)
    setDirty(false)
  }

  /** Cancelar el diálogo no es un error que valga la pena mostrar. */
  const run = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (cause) {
      if (isCancelled(cause)) return
      setError(describeError(cause, language, t.errors.openFailed))
    }
  }

  const saveAs = async () => {
    const saved = await saveDeckAs(deck, suggestedName(deck))
    openFile(saved)
    setDirty(false)
  }

  const handleSaveAs = () => run(saveAs)

  const handleSave = () =>
    file?.handle
      ? run(async () => {
          const result = await saveDeck(deck, file.handle!)

          // Si el archivo ya no está, preguntar dónde guardar es lo único que
          // queda. Si lo que falta es el permiso, decirlo: abrir el diálogo en
          // silencio parece que Guardar hubiera ignorado el mazo abierto.
          if (result === 'saved') setDirty(false)
          else if (result === 'missing') await saveAs()
          else setError(t.errors.permissionDenied(file.name))
        })
      : handleSaveAs()

  const handleOpen = () =>
    run(async () => {
      const opened = await openDeck()
      if (opened) loadDeck(opened)
    })

  const setArtFromFile = async (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return
    try {
      patchCard({ art: await loadArtFromFile(file) })
    } catch (cause) {
      setError(describeError(cause, language, t.errors.artFailed))
    }
  }

  const setTransform = (transform: ArtTransform) => {
    if (!card.art || card.done) return
    patchCard({ art: { ...card.art, transform } })
  }

  const handleExport = async () => {
    const stage = stageRef.current
    if (!stage) return
    // El PNG sale del mismo stage del preview, así que primero hay que sacarle
    // el relleno de los textos vacíos y esperar a que se redibuje sin él:
    // ocultarlo al exportar no alcanzaría, porque el lugar que ocupaba corre el
    // resto del renglón.
    flushSync(() => setExporting(true))
    try {
      await exportCardPng(stage, { filename: `${card.title.trim() || t.topBar.defaultFileName}.png` })
    } finally {
      setExporting(false)
    }
  }

  const handleExportSheets = async () => {
    setSheetExporting(true)
    try {
      await exportPrintSheets(deck, { paper, bleed, copies, language })
    } catch (cause) {
      setError(describeError(cause, language, t.errors.sheetFailed))
    } finally {
      setSheetExporting(false)
    }
  }

  const handleExportAllPng = async () => {
    setCardsExporting(true)
    try {
      await exportCardsPng(deck, { language })
    } catch (cause) {
      setError(describeError(cause, language, t.errors.cardsFailed))
    } finally {
      setCardsExporting(false)
    }
  }

  /**
   * Soltar sobre el preview es para la imagen del jugador, y lo único que
   * trae una imagen es un archivo. El otro arrastre que pasa por acá es el de
   * contenido, que va a las zonas de `CardDropZones` — se distingue por
   * `types`, que en un archivo del sistema siempre incluye `Files`.
   */
  const isFileDrag = (event: DragEvent) => event.dataTransfer.types.includes('Files')

  const handleDrop = (event: DragEvent) => {
    if (!isFileDrag(event)) return
    event.preventDefault()
    setDragging(false)
    // Carta terminada: no se reemplaza el arte por soltar un archivo encima.
    if (card.done) return
    void setArtFromFile(event.dataTransfer.files[0])
  }

  return (
    <LanguageProvider value={{ language, setLanguage }}>
    <FactionLibraryProvider value={factionLibrary}>
    <IconLibraryProvider value={library}>
    {/* El arrastre de contenido cruza la pantalla: sale de la paleta del panel
        de la izquierda y puede terminar sobre la carta, así que el estado
        tiene que estar arriba de las dos. */}
    <ContentDragProvider card={card} onChange={patchCard}>
      <div className="flex h-full flex-col">
        <TopBar
          exporting={exporting}
          language={language}
          onLanguageChange={setLanguage}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onExport={() => void handleExport()}
        />

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[360px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
            {card.done && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-emerald-900/40 bg-emerald-950/20 px-4 py-2.5">
                <p className="text-xs leading-relaxed text-emerald-400">{t.doneBanner.locked}</p>
                <Button onClick={() => patchCard({ done: false })}>{t.doneBanner.unlock}</Button>
              </div>
            )}

            <Tabs value={tab} options={TABS} onChange={setTab} />

            {/*
              Todo el panel es de la carta abierta, así que se bloquea entero
              con ella. `inert` lo saca de la edición —clics y teclado— sin
              tener que pasarle `disabled` a cada control por separado; la
              opacidad es sólo la señal visual de lo mismo.
            */}
            <div
              ref={panelScrollRef}
              inert={card.done}
              onDragOverCapture={handlePanelAutoScroll}
              className={`min-h-0 flex-1 overflow-y-auto ${card.done ? 'opacity-50' : ''}`}
            >
              {tab === 'front' && (
                <>
                  <ArtPanel
                    art={card.art}
                    onPick={() => fileInputRef.current?.click()}
                    onTransform={setTransform}
                    onClear={() => patchCard({ art: null })}
                  />
                  <CardPanel card={card} onChange={patchCard} />
                </>
              )}

              {tab === 'rules' && <RulesPanel card={card} onChange={patchCard} />}
            </div>
          </aside>

          <main
            ref={previewRef}
            onDragOver={(event) => {
              if (!isFileDrag(event)) return
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-zinc-900 transition-colors ${
              dragging ? 'bg-zinc-800' : ''
            }`}
          >
            <div className="transparency-grid relative shadow-2xl shadow-black/60">
              <CardStage
                card={card}
                scale={previewScale}
                stageRef={stageRef}
                placeholders={!card.done && !exporting}
                onArtChange={card.done ? undefined : setTransform}
                onArtPick={card.done ? undefined : () => fileInputRef.current?.click()}
              />

              {/* El nombre se escribe también acá, sobre la placa: es lo mismo
                  que el campo de la pestaña Identidad, tocado donde se ve. */}
              {!card.done && (
                <CardNameField card={card} scale={previewScale} onChange={patchCard} />
              )}

              {/* Sólo aparecen mientras se arrastra contenido, y encima de la
                  carta: es la otra forma de decir en qué caja va la pieza. */}
              <CardDropZones card={card} scale={previewScale} />
            </div>

            {/* Mismo sello que la galería, para que se note sin tener que
                bajar la vista: es la carta grande la que se está mirando.
                Clickeable en los dos sentidos, para marcarla o destildarla sin
                ir al panel ni a la galería. */}
            <button
              onClick={() => patchCard({ done: !card.done })}
              title={card.done ? t.doneBadge.reopenTitle : t.doneBadge.markDoneTitle}
              aria-pressed={card.done}
              className={`absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow transition-colors ${
                card.done
                  ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                  : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-50'
              }`}
            >
              {card.done ? t.doneBadge.done : t.doneBadge.markDone}
            </button>

            {dragging && (
              <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-dashed border-sand-500" />
            )}

            {error && (
              <button
                onClick={() => setError(null)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-red-900/90 px-4 py-2.5 text-sm text-red-50 shadow-lg"
              >
                {error}
              </button>
            )}

            {/* En el mismo lugar que el error y con la misma forma: es el
                mismo canal —lo que la app tiene para decir— y sólo cambia si
                salió bien o mal. */}
            {notice && (
              <button
                onClick={() => setNotice(null)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-emerald-900/90 px-4 py-2.5 text-sm text-emerald-50 shadow-lg"
              >
                {notice}
              </button>
            )}
          </main>

          <CardGallery
            cards={cards}
            selected={index}
            onSelect={setSelected}
            onAdd={() => addCard(emptyCard())}
            // La copia arranca pendiente: se duplica una carta para cambiarla.
            onDuplicate={(target) => addCard({ ...cards[target], done: false })}
            onRemove={removeCard}
            onToggleDone={toggleDone}
          >
            {/* Lo del mazo entero, al pie de la columna del mazo.

                Arriba de la línea, **el mazo como archivo**: el nombre, las
                cuatro de abrir y guardar, y las dos de sacarlo afuera —el
                mismo mazo en PDF o en PNGs, que es guardarlo en otro formato—.
                Abajo, lo que el mazo tiene adentro, que se edita en diálogo. */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 border-b border-zinc-800 pb-3">
                <DeckFileControls
                  title={t.deckFooter.deckGroup}
                  name={deck.name}
                  fileName={file?.name ?? null}
                  dirty={dirty}
                  onRename={(name) => mutate((current) => ({ ...current, name: name || null }))}
                  onNew={newDeck}
                  onSave={handleSave}
                  onSaveAs={handleSaveAs}
                  onOpen={handleOpen}
                  onOpenFile={(picked) => void run(async () => loadDeck(await openDeckFromFile(picked)))}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setDialog('print')} className="px-2 text-xs">
                    <PrinterIcon />
                    {t.deckFooter.print}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => void handleExportAllPng()}
                    disabled={cardsExporting}
                    className="px-2 text-xs"
                  >
                    <DownloadIcon />
                    {cardsExporting ? t.deckFooter.exportingAll : t.deckFooter.exportAll}
                  </Button>
                </div>
              </div>

              <GroupTitle>{t.deckFooter.libraryGroup}</GroupTitle>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setDialog('icons')} className="px-2 text-xs">
                  <DiamondIcon />
                  {t.deckFooter.icons}
                </Button>
                <Button onClick={() => setDialog('factions')} className="px-2 text-xs">
                  <BannerIcon />
                  {t.deckFooter.factions}
                </Button>
              </div>
            </div>
          </CardGallery>
        </div>

        {dialog === 'icons' && (
          <Dialog
            title={t.dialogs.icons}
            hint={t.iconPanel.hint}
            size="wide"
            onClose={() => setDialog(null)}
          >
            <IconPanel
              onExportLibrary={exportLibrary}
              onImportLibrary={importLibrary}
              icons={deck.icons}
              library={myIcons}
              cards={cards}
              onChange={setDeckIcons}
              onLibraryChange={updateIcons}
              onCopyToDeck={copyIconToDeck}
              onCopyToLibrary={copyIconToLibrary}
              onError={setError}
            />
          </Dialog>
        )}

        {dialog === 'factions' && (
          <Dialog
            title={t.dialogs.factions}
            hint={t.factionPanel.hint}
            size="wide"
            onClose={() => setDialog(null)}
          >
            <FactionPanel
              onExportLibrary={exportLibrary}
              onImportLibrary={importLibrary}
              factions={deck.factions}
              library={myFactions}
              cards={cards}
              onChange={setDeckFactions}
              onLibraryChange={updateFactions}
              onCopyToDeck={copyFactionToDeck}
              onCopyToLibrary={copyFactionToLibrary}
              onError={setError}
            />
          </Dialog>
        )}

        {dialog === 'print' && (
          <Dialog title={t.dialogs.print} onClose={() => setDialog(null)}>
            <PrintPanel
              cards={cards.length}
              paper={paper}
              bleed={bleed}
              copies={copies}
              onPaper={setPaper}
              onBleed={setBleed}
              onCopies={setCopies}
              busy={sheetExporting}
              onExportSheets={() => void handleExportSheets()}
            />
          </Dialog>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            void setArtFromFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        <input
          ref={libraryInputRef}
          type="file"
          accept=".json"
          hidden
          onChange={(event) => {
            const picked = event.target.files?.[0]
            if (picked) void run(async () => importLibraryText(await picked.text()))
            event.target.value = ''
          }}
        />
      </div>
    </ContentDragProvider>
    </IconLibraryProvider>
    </FactionLibraryProvider>
    </LanguageProvider>
  )
}

/** Título de grupo del pie del mazo, con el mismo aire que los de `Section`. */
function GroupTitle({ children }: { children: string }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-[0.18em] text-sand-500 uppercase">
      {children}
    </h2>
  )
}
