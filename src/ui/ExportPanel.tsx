import { CARD_HEIGHT, CARD_WIDTH } from '../render/constants'
import { Button, Hint, Section } from './controls'

const SIZES = [1, 2] as const
export type ExportScale = (typeof SIZES)[number]

type Props = {
  scale: ExportScale
  busy: boolean
  onScaleChange: (scale: ExportScale) => void
  onExport: () => void
}

export function ExportPanel({ scale, busy, onScaleChange, onExport }: Props) {
  return (
    <Section title="Exportar">
      <div className="grid grid-cols-2 gap-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onScaleChange(size)}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              scale === size
                ? 'bg-zinc-100 font-medium text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {size}×
          </button>
        ))}
      </div>

      <Hint>
        {CARD_WIDTH * scale} × {CARD_HEIGHT * scale} px
        {scale === 1 ? ' — 63,5 × 88 mm a 300 DPI, listo para imprimir.' : ' — el doble, por si querés margen.'}
      </Hint>

      <Button variant="primary" onClick={onExport} disabled={busy}>
        {busy ? 'Exportando…' : 'Exportar PNG'}
      </Button>
    </Section>
  )
}
