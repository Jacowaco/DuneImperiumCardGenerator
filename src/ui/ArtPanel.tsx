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
import { Button, Section } from './controls'
import { ImageIcon, LockIcon, LockOpenIcon } from './icons'

type Props = {
  art: CardArt | null
  onPick: () => void
  onTransform: (transform: ArtTransform) => void
  onClear: () => void
  onToggleLock?: (locked: boolean) => void
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

export function ArtPanel({ art, onPick, onTransform, onClear, onToggleLock }: Props) {
  const t = useT()

  return (
    <Section title={t.artPanel.image} hint={t.artPanel.dragZoomHint}>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={onPick}>
          <ImageIcon />
          {art ? t.artPanel.changeImage : t.artPanel.chooseImage}
        </Button>
        {art && (
          <Button onClick={onClear} title={t.artPanel.remove} aria-label={t.artPanel.remove}>
            ×
          </Button>
        )}
      </div>

      {/* Etiqueta, barra y porcentaje en un solo renglón: en esta pantalla lo
          que escasea es el alto. El porcentaje va con ancho fijo para que la
          barra no se corra mientras se mueve. */}
      <label className="flex items-center gap-3 text-xs text-zinc-400">
        <span>{t.artPanel.zoom}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          disabled={!art || art?.locked}
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
          className="min-w-0 flex-1 accent-sand-500"
        />
        {/* Sin imagen el control está deshabilitado y la barra queda en el
            extremo izquierdo: 0% es lo que dice esa posición. Un guion se lee
            como que algo falta. */}
        <span className="w-10 text-right tabular-nums">
          {art ? Math.round(art.transform.scale * 100) : 0}%
        </span>
      </label>

      {/* El candado va en la misma fila que Ajustar y Centrar: es el otro
          control del encuadre, y el icono ya dice si está trabado — un cartel
          explicándolo repite lo que se ve. */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={!art || art?.locked}
          onClick={() => art && onTransform(fitCover(art.width, art.height))}
        >
          {t.artPanel.fit}
        </Button>
        <Button
          className="flex-1"
          disabled={!art || art?.locked}
          onClick={() => art && onTransform(centerAt(art.width, art.height, art.transform.scale))}
        >
          {t.artPanel.center}
        </Button>
        {art && onToggleLock && (
          <Button
            variant={art.locked ? 'primary' : 'ghost'}
            onClick={() => onToggleLock(!(art?.locked ?? false))}
            title={art.locked ? t.artPanel.frameLocked : t.artPanel.frameFree}
            aria-label={art.locked ? t.artPanel.frameLocked : t.artPanel.frameFree}
            aria-pressed={art.locked}
          >
            {art.locked ? <LockIcon /> : <LockOpenIcon />}
          </Button>
        )}
      </div>
    </Section>
  )
}
