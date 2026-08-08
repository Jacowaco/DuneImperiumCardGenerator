import type Konva from 'konva'
import { useEffect, useRef, useState, type DragEvent } from 'react'

import { exportCardPng } from './export/exportPng'
import { loadArtFromFile } from './model/art'
import { emptyCard, type ArtTransform, type Card } from './model/card'
import {
  isCancelled,
  openDeck,
  openDeckFromFile,
  saveDeck,
  saveDeckAs,
  suggestedName,
  type OpenedDeck,
} from './model/files'
import { recallDeckFile, rememberDeckFile } from './model/recentFile'
import { loadAutosave, saveAutosave } from './model/storage'
import { CardStage } from './render/CardStage'
import { useFitScale } from './render/useFitScale'
import { ArtPanel } from './ui/ArtPanel'
import { CardGallery } from './ui/CardGallery'
import { CardPanel } from './ui/CardPanel'
import { ExportPanel } from './ui/ExportPanel'
import { ProjectPanel } from './ui/ProjectPanel'

export function App() {
  // Recuperar el archivo de la sesión anterior sólo tiene sentido si el mazo
  // también viene de ahí: si arrancamos con una carta vacía, "Guardar" no
  // debería pisar el mazo que se estaba editando antes.
  const fromAutosave = useRef(false)
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = loadAutosave()
    fromAutosave.current = saved !== null
    return saved ?? [emptyCard()]
  })
  const [selected, setSelected] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Archivo abierto: el handle es lo que permite sobrescribirlo sin volver a
  // preguntar dónde. Sin handle, "Guardar" se comporta como "Guardar como".
  const [file, setFile] = useState<Pick<OpenedDeck, 'handle' | 'name'> | null>(null)
  const [dirty, setDirty] = useState(false)

  // El índice puede quedar fuera de rango al abrir un mazo más corto.
  const index = Math.min(selected, cards.length - 1)
  const card = cards[index]

  // Autoguardado: recargar la página no debería costar el trabajo hecho.
  useEffect(() => {
    const timer = setTimeout(() => saveAutosave(cards), 500)
    return () => clearTimeout(timer)
  }, [cards])

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
  const mutate = (update: (current: Card[]) => Card[]) => {
    setCards(update)
    setDirty(true)
  }

  /** Aplica un cambio sólo a la carta abierta. */
  const patchCard = (patch: Partial<Card>) =>
    mutate((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const addCard = (newCard: Card) => {
    mutate((current) => [...current, newCard])
    setSelected(cards.length)
  }

  const removeCard = (target: number) => {
    mutate((current) => current.filter((_, i) => i !== target))
    setSelected((current) => (target < current ? current - 1 : current))
  }

  /** Todo cambio del archivo abierto pasa por acá, para recordarlo. */
  const openFile = (next: Pick<OpenedDeck, 'handle' | 'name'> | null) => {
    setFile(next)
    void rememberDeckFile(next?.handle ?? null)
  }

  const loadDeck = (opened: OpenedDeck) => {
    setCards(opened.cards)
    setSelected(0)
    openFile({ handle: opened.handle, name: opened.name })
    setDirty(false)
  }

  /** Cancelar el diálogo no es un error que valga la pena mostrar. */
  const run = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (cause) {
      if (isCancelled(cause)) return
      setError(cause instanceof Error ? cause.message : 'No se pudo abrir el archivo.')
    }
  }

  const saveAs = async () => {
    const saved = await saveDeckAs(cards, suggestedName(cards))
    openFile(saved)
    setDirty(false)
  }

  const handleSaveAs = () => run(saveAs)

  const handleSave = () =>
    file?.handle
      ? run(async () => {
          // Si el archivo ya no se puede escribir (permiso denegado, o se
          // movió), preguntar dónde en vez de dejarlo sin guardar.
          if (await saveDeck(cards, file.handle!)) setDirty(false)
          else await saveAs()
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
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la imagen.')
    }
  }

  const setTransform = (transform: ArtTransform) => {
    if (!card.art) return
    patchCard({ art: { ...card.art, transform } })
  }

  const handleExport = async () => {
    const stage = stageRef.current
    if (!stage) return
    setExporting(true)
    try {
      await exportCardPng(stage, { filename: `${card.title.trim() || 'carta'}.png` })
    } finally {
      setExporting(false)
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    void setArtFromFile(event.dataTransfer.files[0])
  }

  return (
    <div className="flex h-full">
      <aside className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950">
        <header className="border-b border-zinc-800 px-5 py-5">
          <h1 className="text-lg font-semibold tracking-wide text-sand-100">
            Dune: Imperium
          </h1>
          <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
            Card Generator
          </p>
        </header>

        <CardPanel card={card} onChange={patchCard} />

        <ArtPanel
          art={card.art}
          onPick={() => fileInputRef.current?.click()}
          onTransform={setTransform}
          onClear={() => patchCard({ art: null })}
        />

        <ExportPanel busy={exporting} onExport={handleExport} />

        <ProjectPanel
          cards={cards}
          fileName={file?.name ?? null}
          dirty={dirty}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onOpen={handleOpen}
          onOpenFile={(picked) => void run(async () => loadDeck(await openDeckFromFile(picked)))}
        />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div
          ref={previewRef}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-900 transition-colors ${
            dragging ? 'bg-zinc-800' : ''
          }`}
        >
          <div className="transparency-grid shadow-2xl shadow-black/60">
            <CardStage
              card={card}
              scale={previewScale}
              stageRef={stageRef}
              onArtChange={setTransform}
            />
          </div>

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
        </div>

        <CardGallery
          cards={cards}
          selected={index}
          onSelect={setSelected}
          onAdd={() => addCard(emptyCard())}
          onDuplicate={(target) => addCard({ ...cards[target] })}
          onRemove={removeCard}
        />
      </main>

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
  )
}
