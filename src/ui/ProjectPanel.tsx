import { useRef } from 'react'
import type { Card } from '../model/card'
import { FILE_EXTENSION, parseDeck } from '../model/storage'
import { Button, Hint, Section } from './controls'

type Props = {
  cards: Card[]
  onSave: () => void
  onOpen: (cards: Card[]) => void
  onError: (message: string) => void
}

export function ProjectPanel({ cards, onSave, onOpen, onError }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      onOpen(parseDeck(await file.text()))
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo abrir el archivo.')
    }
  }

  return (
    <Section title="Mazo">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onSave}>Guardar</Button>
        <Button onClick={() => inputRef.current?.click()}>Abrir…</Button>
      </div>
      <Hint>
        {cards.length === 1 ? '1 carta' : `${cards.length} cartas`}. Se guarda un archivo{' '}
        {FILE_EXTENSION} con las imágenes adentro, así que se puede pasar a otra máquina y
        abre igual.
      </Hint>

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </Section>
  )
}
