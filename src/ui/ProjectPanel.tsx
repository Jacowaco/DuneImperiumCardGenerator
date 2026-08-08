import { useRef } from 'react'
import type { Card } from '../model/card'
import { supportsFileSystem } from '../model/files'
import { Button, Hint, Section } from './controls'

type Props = {
  cards: Card[]
  /** Nombre del archivo abierto, o null si el mazo todavía no se guardó. */
  fileName: string | null
  dirty: boolean
  onSave: () => void
  onSaveAs: () => void
  onOpen: () => void
  onOpenFile: (file: File) => void
}

export function ProjectPanel({
  cards,
  fileName,
  dirty,
  onSave,
  onSaveAs,
  onOpen,
  onOpenFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const native = supportsFileSystem()

  return (
    <Section title="Mazo">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onSave} disabled={!dirty && fileName !== null}>
          Guardar
        </Button>
        <Button onClick={onSaveAs}>Guardar como…</Button>
      </div>

      <Button onClick={() => (native ? onOpen() : inputRef.current?.click())}>Abrir…</Button>

      <Hint>
        {fileName ? (
          <>
            {fileName}
            {dirty && ' · sin guardar'}
          </>
        ) : (
          'Sin guardar todavía'
        )}
        {' · '}
        {cards.length === 1 ? '1 carta' : `${cards.length} cartas`}
      </Hint>

      {!native && (
        <Hint>
          Acá no se pueden sobrescribir archivos, así que las dos opciones bajan una copia
          nueva. Abriendo la app en Chrome o Edge —la ventana del navegador, no la vista
          previa del editor— «Guardar» escribe sobre el archivo abierto sin preguntar.
        </Hint>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onOpenFile(file)
          event.target.value = ''
        }}
      />
    </Section>
  )
}
