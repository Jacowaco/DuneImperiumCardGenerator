import { EXPORT_SCALE } from '../export/exportPng'
import { CARD_HEIGHT, CARD_WIDTH } from '../render/constants'
import { Button, Hint, Section } from './controls'

type Props = {
  busy: boolean
  onExport: () => void
}

export function ExportPanel({ busy, onExport }: Props) {
  return (
    <Section title="Exportar">
      <Hint>
        {CARD_WIDTH * EXPORT_SCALE} × {CARD_HEIGHT * EXPORT_SCALE} px — 63,5 × 88 mm al doble de
        300 DPI, listo para imprimir.
      </Hint>

      <Button variant="primary" onClick={onExport} disabled={busy}>
        {busy ? 'Exportando…' : 'Exportar PNG'}
      </Button>
    </Section>
  )
}
