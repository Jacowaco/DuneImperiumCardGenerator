import type Konva from 'konva'
import { useRef, useState, type DragEvent } from 'react'

import { exportCardPng } from './export/exportPng'
import { loadArtFromFile } from './model/art'
import { emptyCard, type ArtTransform, type Card } from './model/card'
import { CardStage } from './render/CardStage'
import { useFitScale } from './render/useFitScale'
import { ArtPanel } from './ui/ArtPanel'
import { CardPanel } from './ui/CardPanel'
import { ExportPanel, type ExportScale } from './ui/ExportPanel'

export function App() {
  const [card, setCard] = useState<Card>(emptyCard)
  const [exportScale, setExportScale] = useState<ExportScale>(1)
  const [exporting, setExporting] = useState(false)
  const [dragging, setDragging] = useState(false)

  const stageRef = useRef<Konva.Stage | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const previewScale = useFitScale(previewRef)

  const setArtFromFile = async (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return
    const art = await loadArtFromFile(file)
    setCard((current) => {
      if (current.art) URL.revokeObjectURL(current.art.src)
      return { ...current, art }
    })
  }

  const setTransform = (transform: ArtTransform) =>
    setCard((current) =>
      current.art ? { ...current, art: { ...current.art, transform } } : current,
    )

  const clearArt = () =>
    setCard((current) => {
      if (current.art) URL.revokeObjectURL(current.art.src)
      return { ...current, art: null }
    })

  const handleExport = async () => {
    const stage = stageRef.current
    if (!stage) return
    setExporting(true)
    try {
      await exportCardPng(stage, { scale: exportScale, filename: 'dune-card.png' })
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

        <CardPanel
          card={card}
          onChange={(patch) => setCard((current) => ({ ...current, ...patch }))}
        />

        <ArtPanel
          art={card.art}
          onPick={() => fileInputRef.current?.click()}
          onTransform={setTransform}
          onClear={clearArt}
        />

        <ExportPanel
          scale={exportScale}
          busy={exporting}
          onScaleChange={setExportScale}
          onExport={handleExport}
        />
      </aside>

      <main
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
