import { EXPORT_SCALE } from '../export/exportPng'
import { impose, PAPER_IDS, PAPERS, sheetCount, type PaperId } from '../export/paper'
import { cardWord, useT } from '../i18n/strings'
import { pick, useLanguage } from '../model/language'
import { CARD_HEIGHT, CARD_WIDTH } from '../render/constants'
import { Button, Choice, Hint, Section, Toggle } from './controls'
import { DownloadIcon } from './icons'

type Props = {
  cards: number
  paper: PaperId
  bleed: boolean
  busy: boolean
  onPaper: (paper: PaperId) => void
  onBleed: (bleed: boolean) => void
  onExportSheets: () => void
}

/**
 * Imprimir el mazo entero. Exportar la carta abierta es un PNG suelto y vive
 * en la barra de arriba: se hace todo el tiempo y no necesita opciones.
 */
export function PrintPanel({
  cards,
  paper,
  bleed,
  busy,
  onPaper,
  onBleed,
  onExportSheets,
}: Props) {
  const t = useT()
  const { language } = useLanguage()
  const imposition = impose(paper, bleed)
  const pages = sheetCount(cards, imposition)
  const { widthMm, heightMm } = PAPERS[paper]

  return (
    <Section>
      <Choice
        value={paper}
        columns={4}
        options={PAPER_IDS.map((id) => ({ value: id, label: pick(PAPERS[id].label, language) }))}
        onChange={(next) => next && onPaper(next)}
      />

      <Hint>
        {widthMm} × {heightMm} mm — {imposition.columns} × {imposition.rows} ={' '}
        {imposition.perSheet} {cardWord(imposition.perSheet, language)} {t.printPanel.perSheetSuffix}{' '}
        {pages === 1 ? t.printPanel.fitsOnOne : t.printPanel.spansPages(pages)}
      </Hint>

      <Toggle label={t.printPanel.bleedToggle} checked={bleed} onChange={onBleed} />

      <Hint>{bleed ? t.printPanel.bleedOnHint : t.printPanel.bleedOffHint}</Hint>

      <Button onClick={onExportSheets} disabled={busy}>
        <DownloadIcon />
        {busy ? t.printPanel.buildingPdf : t.printPanel.downloadPdf}
      </Button>

      <Hint>
        {t.printPanel.pdfSizeHintBefore}
        <strong>{t.printPanel.pdfSizeHintBold}</strong>
        {t.printPanel.pdfSizeHintAfter}
      </Hint>

      <Hint>{t.printPanel.cardSizeHint(CARD_WIDTH * EXPORT_SCALE, CARD_HEIGHT * EXPORT_SCALE)}</Hint>
    </Section>
  )
}
