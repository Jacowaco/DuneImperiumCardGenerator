import { useT } from '../i18n/strings'
import {
  centerAt,
  clampArtScale,
  clampArtTransform,
  coverScale,
  fitCover,
  maxArtScale,
} from '../model/art'
import type { ArtTransform, CardArt } from '../model/card'
import { Button, Hint, Section } from './controls'
import { ImageIcon } from './icons'

type Props = {
  art: CardArt | null
  onPick: () => void
  onTransform: (transform: ArtTransform) => void
  onClear: () => void
}

// El zoom se mueve en escala logarítmica para que el slider se sienta parejo.
// El extremo izquierdo es el encuadre que cubre justo el recorte: más lejos no
// se puede ir sin destapar el fondo del contenedor.
const range = (art: CardArt) =>
  Math.log(maxArtScale(art.width, art.height) / coverScale(art.width, art.height))
const toSlider = (art: CardArt, scale: number) =>
  Math.log(scale / coverScale(art.width, art.height)) / range(art)
const fromSlider = (art: CardArt, value: number) =>
  coverScale(art.width, art.height) * Math.exp(value * range(art))

export function ArtPanel({ art, onPick, onTransform, onClear }: Props) {
  const t = useT()

  return (
    <Section title={t.artPanel.image} hint={t.artPanel.dragZoomHint}>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={onPick}>
          <ImageIcon />
          {art ? t.artPanel.changeImage : t.artPanel.chooseImage}
        </Button>
        {art && (
          <>
            <Button onClick={onClear} title={t.artPanel.remove} aria-label={t.artPanel.remove}>
              ×
            </Button>
            <Hint>
              {art.width} × {art.height} px
            </Hint>
          </>
        )}
      </div>
      {!art && <Hint>{t.artPanel.dragHint}</Hint>}

      <label className="flex flex-col gap-2">
        <span className="flex justify-between text-xs text-zinc-400">
          <span>{t.artPanel.zoom}</span>
          <span className="tabular-nums">
            {art ? `${Math.round(art.transform.scale * 100)}%` : '—'}
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          disabled={!art}
          value={art ? toSlider(art, art.transform.scale) : 0}
          onChange={(event) => {
            if (!art) return
            const scale = clampArtScale(
              fromSlider(art, Number(event.target.value)),
              art.width,
              art.height,
            )
            // Zoom desde el centro del recorte, no desde la esquina de la imagen.
            const { x, y, scale: current } = art.transform
            const cx = art.width / 2
            const cy = art.height / 2
            onTransform(
              clampArtTransform(
                {
                  scale,
                  x: x + cx * current - cx * scale,
                  y: y + cy * current - cy * scale,
                },
                art.width,
                art.height,
              ),
            )
          }}
          className="accent-sand-500"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <Button disabled={!art} onClick={() => art && onTransform(fitCover(art.width, art.height))}>
          {t.artPanel.fit}
        </Button>
        <Button
          disabled={!art}
          onClick={() => art && onTransform(centerAt(art.width, art.height, art.transform.scale))}
        >
          {t.artPanel.center}
        </Button>
      </div>
    </Section>
  )
}
