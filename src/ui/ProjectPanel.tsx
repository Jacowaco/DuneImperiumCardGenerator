import { useRef } from 'react'
import { FILE_EXTENSION, parseCard } from '../model/storage'
import type { Card } from '../model/card'
import { Button, Hint, Section } from './controls'

type Props = {
  card: Card
  onSave: () => void
  onOpen: (card: Card) => void
  onNew: () => void
  onError: (message: string) => void
}

export function ProjectPanel({ onSave, onOpen, onNew, onError }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      onOpen(parseCard(await file.text()))
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo abrir el archivo.')
    }
  }

  return (
    <Section title="Carta guardada">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onSave}>Guardar</Button>
        <Button onClick={() => inputRef.current?.click()}>Abrir…</Button>
      </div>
      <Button onClick={onNew}>Carta nueva</Button>
      <Hint>
        Se guarda un archivo {FILE_EXTENSION} con la imagen adentro, así que se puede pasar
        a otra máquina y abre igual.
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
