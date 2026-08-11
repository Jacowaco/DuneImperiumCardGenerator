import type Konva from 'konva'
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'

import { exportCardPng } from './export/exportPng'
import type { PaperId } from './export/paper'
import { exportPrintSheets } from './export/printSheet'
import { describeError, stringsFor } from './i18n/strings'
import { loadArtFromFile } from './model/art'
import { emptyCard, type ArtTransform, type Card } from './model/card'
import { mergeIcons, sameIcons, type CustomIcon } from './model/customIcon'
import { buildIconLibrary, IconLibraryProvider } from './model/iconLibrary'
import { adoptIcons, syncLibrary } from './model/iconStore'
import {
  isCancelled,
  openDeck,
  openDeckFromFile,
  saveDeck,
  saveDeckAs,
  suggestedName,
  type OpenedDeck,
} from './model/files'
import { LanguageProvider, useLanguageState } from './model/language'
import { recallDeckFile, rememberDeckFile } from './model/recentFile'
import { emptyDeck, loadAutosave, packIcons, saveAutosave, type Deck } from './model/storage'
import { CardStage } from './render/CardStage'
import { useFitScale } from './render/useFitScale'
import { ArtPanel } from './ui/ArtPanel'
import { CardGallery } from './ui/CardGallery'
import { CardPanel } from './ui/CardPanel'
import { Button } from './ui/controls'
import { Dialog } from './ui/Dialog'
import { DiamondIcon, ImageIcon, PrinterIcon, RulesIcon } from './ui/icons'
import { IconPanel } from './ui/IconPanel'
import { PrintPanel } from './ui/PrintPanel'
import { RulesPanel } from './ui/RulesPanel'
import { Tabs } from './ui/Tabs'
import { TopBar } from './ui/TopBar'

type TabId = 'front' | 'rules'

/** Lo del mazo se abre en diálogo: se usa cada tanto y no gana lugar fijo. */
type DialogId = 'icons' | 'print'

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

  // Cómo se imprime es una preferencia del que imprime, no del mazo: no se
  // guarda en el archivo ni viaja con él.
  const [paper, setPaper] = useState<PaperId>('a4')
  const [bleed, setBleed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Archivo abierto: el handle es lo que permite sobrescribirlo sin volver a
  // preguntar dónde. Sin handle, "Guardar" se comporta como "Guardar como".
  const [file, setFile] = useState<Pick<OpenedDeck, 'handle' | 'name'> | null>(null)
  const [dirty, setDirty] = useState(false)

  // Los iconos propios son del usuario y no del mazo: una sola lista, guardada
  // en el navegador y disponible en todos los mazos. El archivo del mazo se
  // lleva adentro los que sus cartas usan, para seguir abriendo igual en otra
  // máquina, pero la lista no se maneja desde ahí.
  const [myIcons, setMyIcons] = useState<CustomIcon[]>([])

  useEffect(() => {
    // El mazo recuperado del autoguardado puede traer iconos que la biblioteca
    // todavía no tiene: es la misma adopción que al abrir un archivo.
    void adoptIcons(deck.icons).then(setMyIcons)
    // Sólo al arrancar; después la biblioteca la mueve el panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { cards } = deck

  // El catálogo que ven el render y los paneles: la biblioteca entera, más lo
  // que traiga el mazo abierto y todavía no se haya adoptado.
  const allIcons = useMemo(() => mergeIcons(deck.icons, myIcons), [deck.icons, myIcons])
  const library = useMemo(() => buildIconLibrary(allIcons, language), [allIcons, language])

  // El mazo carga los iconos que sus cartas usan, para que guardar sea copiar
  // el objeto y nada más. No es un cambio del usuario, así que va con `setDeck`
  // y no con `mutate`: no puede marcar el mazo como sin guardar.
  useEffect(() => {
    setDeck((current) => {
      const packed = packIcons(current.cards, mergeIcons(current.icons, myIcons))
      return sameIcons(current.icons, packed) ? current : { ...current, icons: packed }
    })
  }, [myIcons, cards])

  /** Todo cambio de la biblioteca pasa por acá: se edita y se baja a la base. */
  const updateIcons = (next: CustomIcon[]) => {
    void syncLibrary(myIcons, next)
    setMyIcons(next)
  }

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
  const previewRef = useRef<HTMLDivElement | null>(null)
  const previewScale = useFitScale(previewRef)

  /** Todo cambio del mazo pasa por acá, para no olvidarse de marcar sin guardar. */
  const mutate = (update: (current: Deck) => Deck) => {
    setDeck(update)
    setDirty(true)
  }

  /** Atajo para lo más común, que es cambiar sólo las cartas. */
  const mutateCards = (update: (current: Card[]) => Card[]) =>
    mutate((current) => ({ ...current, cards: update(current.cards) }))

  /** Aplica un cambio sólo a la carta abierta. */
  const patchCard = (patch: Partial<Card>) =>
    mutateCards((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )

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
    openFile({ handle: opened.handle, name: opened.name })
    setDirty(false)
    // Los iconos que traiga el mazo pasan a ser tuyos: si no, un mazo que te
    // pasaron los tendría sólo mientras esté abierto.
    void adoptIcons(opened.deck.icons).then(setMyIcons)
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
    setExporting(true)
    try {
      await exportCardPng(stage, { filename: `${card.title.trim() || t.topBar.defaultFileName}.png` })
    } finally {
      setExporting(false)
    }
  }

  const handleExportSheets = async () => {
    setSheetExporting(true)
    try {
      await exportPrintSheets(deck, { paper, bleed, language })
    } catch (cause) {
      setError(describeError(cause, language, t.errors.sheetFailed))
    } finally {
      setSheetExporting(false)
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    // Carta terminada: no se reemplaza el arte por soltar un archivo encima.
    if (card.done) return
    void setArtFromFile(event.dataTransfer.files[0])
  }

  return (
    <LanguageProvider value={{ language, setLanguage }}>
    <IconLibraryProvider value={library}>
      <div className="flex h-full flex-col">
        <TopBar
          name={deck.name}
          fileName={file?.name ?? null}
          dirty={dirty}
          exporting={exporting}
          language={language}
          onLanguageChange={setLanguage}
          onRename={(name) => mutate((current) => ({ ...current, name: name || null }))}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onOpen={handleOpen}
          onOpenFile={(picked) => void run(async () => loadDeck(await openDeckFromFile(picked)))}
          onExport={() => void handleExport()}
        />

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[340px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
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
              inert={card.done}
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
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-zinc-900 transition-colors ${
              dragging ? 'bg-zinc-800' : ''
            }`}
          >
            <div className="transparency-grid shadow-2xl shadow-black/60">
              <CardStage
                card={card}
                scale={previewScale}
                stageRef={stageRef}
                onArtChange={card.done ? undefined : setTransform}
                onArtPick={card.done ? undefined : () => fileInputRef.current?.click()}
              />
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
            {/* Lo del mazo entero, al pie de la columna del mazo. */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setDialog('icons')} className="px-2 text-xs">
                <DiamondIcon />
                {t.deckFooter.icons}
              </Button>
              <Button onClick={() => setDialog('print')} className="px-2 text-xs">
                <PrinterIcon />
                {t.deckFooter.print}
              </Button>
            </div>
          </CardGallery>
        </div>

        {dialog === 'icons' && (
          <Dialog title={t.dialogs.icons} size="wide" onClose={() => setDialog(null)}>
            <IconPanel
              icons={myIcons}
              cards={cards}
              onChange={updateIcons}
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
              onPaper={setPaper}
              onBleed={setBleed}
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
      </div>
    </IconLibraryProvider>
    </LanguageProvider>
  )
}
