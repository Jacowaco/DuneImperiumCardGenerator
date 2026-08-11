import { EXPORT_SCALE } from '../export/exportPng'
import { impose, PAPER_IDS, PAPERS, sheetCount, type PaperId } from '../export/paper'
import { cardWord, useT } from '../i18n/strings'
import { pick, useLanguage } from '../model/language'
import { CARD_HEIGHT, CARD_WIDTH } from '../render/constants'
import { Button, Choice, Field, Hint, NumberField, Section, Toggle } from './controls'
import { DownloadIcon } from './icons'

const COPIES_QUICK_PICKS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

type Props = {
  cards: number
  paper: PaperId
  bleed: boolean
  copies: number
  busy: boolean
  onPaper: (paper: PaperId) => void
  onBleed: (bleed: boolean) => void
  onCopies: (copies: number) => void
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
  copies,
  busy,
  onPaper,
  onBleed,
  onCopies,
  onExportSheets,
}: Props) {
  const t = useT()
  const { language } = useLanguage()
  const imposition = impose(paper, bleed)
  const total = cards * copies
  const pages = sheetCount(total, imposition)
  const { widthMm, heightMm } = PAPERS[paper]

  return (
    <Section>
      <Choice
        value={paper}
        columns={4}
        options={PAPER_IDS.map((id) => ({ value: id, label: pick(PAPERS[id].label, language) }))}
        onChange={(next) => next && onPaper(next)}
      />

      <Field label={t.printPanel.copies}>
        <NumberField
          value={copies}
          options={COPIES_QUICK_PICKS}
          otherLabel={t.printPanel.copiesOtherValue}
          decreaseLabel={t.printPanel.copiesDecrease}
          increaseLabel={t.printPanel.copiesIncrease}
          onChange={(next) => onCopies(Math.max(1, next))}
        />
      </Field>

      <Hint>
        {widthMm} × {heightMm} mm — {imposition.columns} × {imposition.rows} ={' '}
        {imposition.perSheet} {cardWord(imposition.perSheet, language)} {t.printPanel.perSheetSuffix}{' '}
        {pages === 1 ? t.printPanel.fitsOnOne : t.printPanel.spansPages(pages)}
        {copies > 1 && ` ${t.printPanel.copiesHint(total)}`}
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
