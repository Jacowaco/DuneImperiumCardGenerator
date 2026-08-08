# Dune: Imperium Card Generator

App de escritorio/web para armar cartas custom de *Dune: Imperium*. Web primero
(Vite + React + TypeScript + react-konva); la carcasa de escritorio (Tauri) se
agrega más adelante sin reescribir el render.

## Cómo correrlo

```
npm run dev      # servidor de desarrollo
npm run assets   # regenera src/assets/ desde psd-exports/ (necesita Python + Pillow)
npm run build    # typecheck + build de producción
```

## El template

El lienzo es de **750 × 1039 px**, que es una carta póker estándar
(63,5 × 88 mm) a **300 DPI**. Exportar a 1× ya sirve para imprimir.

`reference/DuneCardTemplateFull.png` es el PSD aplanado, como referencia visual
de todos los elementos que existen.

## Convención de assets

**Todo lo que sale del PSD va crudo a `psd-exports/`**, con el nombre que le
ponga Photoshop. `npm run assets` lo procesa hacia `src/assets/`. La app nunca
lee `psd-exports/` directamente.

Al exportar del PSD: **PNG de 750 × 1039 con transparencia, sin recortar**.
Como todas las capas comparten el lienzo, se dibujan en `(0, 0)` y no hace
falta calcular posiciones.

`scripts/prepare_assets.py` hace dos cosas:

**1. Capas → `src/assets/layers/`**
Se copian tal cual, sólo renombradas a kebab-case. Excepción: las bandas de
facción, que en el PSD están apiladas una debajo de la otra para mostrarlas
todas juntas; el script las alinea a `FACTION_BAND_TOP` porque en una carta
real sólo se ve una.

**2. Iconos → `src/assets/icons/`**
La hoja `Symbols.png` se rebana buscando huecos de filas y columnas, y cada
icono se guarda recortado al contenido, porque se posicionan dinámicamente.
Los nombres están en la lista `SYMBOLS` del script, en orden de lectura de la
hoja — si se exporta una hoja nueva hay que actualizar esa lista.

Medidas útiles (todas en `src/render/constants.ts`, medidas de los PNG y del
render de referencia, no estimadas):
- `ART_RECT` — x 23, y 84, 704 × 626: el hueco de la imagen del jugador.
- `TITLE` — línea de base 76, inicial de 37 px y resto de 26 (versalitas).
- `COST` — rombo centrado en (676, 93), número de 71 px de alto.

### Geometría de las cajas de contenido

| Caja | y |
|---|---|
| `play-box-1` | 696 – 812 |
| `play-box-2` | 696 – 851 |
| `play-box-3` | 696 – 887 |
| `reveal-box` | 810 – 1007 |

**La banda de reveal es una sola y va fija.** La caja de play arranca siempre
en y=696 y crece hacia abajo, tapándola — por eso hay tres alturas de play y
una sola de reveal. El orden de dibujo (reveal abajo, play encima) es lo que
hace que funcione, y es el mismo del PSD.

La silueta del agente (`agent-icon.png`) va encima de la caja de play y en la
carta terminada queda casi tapada por los iconos de contenido; sola se ve más
marcada de lo que se va a ver después.

### Falta exportar

- Las hojas de iconos `Base Game Icons`, `Ix Icons`, `Immortality Icons`.
- `unload.png` ya está en `layers/` pero sin usar: es de la expansión y se
  hace más adelante.

## Arquitectura

`Card` (`src/model/card.ts`) es la única fuente de verdad y `CardStage` es una
función pura de ese objeto. Todo lo demás — guardar, cargar, exportar en lote,
hoja de impresión — sale de serializar `Card`.

El orden de los hijos del `<Layer>` en `CardStage` **es** el orden de apilado
del PSD, de abajo hacia arriba. Al agregar una capa nueva se inserta en el
punto que le corresponde y nada más cambia.

## Estado

- [x] Fase 1 — lienzo, carga de imagen, encuadre (arrastrar + zoom), export PNG
- [x] Fase 2 — nombre (versalitas), variante de mazo inicial, banda de facción,
      costo de compra y beneficio de compra. Tipografía: **Jost**, elegida como
      reemplazo libre hasta saber cuál usa el PSD.
- [ ] Fase 3 — sistema de iconos
  - [x] fondo negro y columna de iconos de agente (dos estilos)
  - [x] cajas de play (3 alturas) y banda de reveal
  - [ ] filas de iconos dentro de esas cajas
- [ ] Fase 4 — pulido de UI
- [ ] Fase 5 — biblioteca de cartas, export en lote, hoja de impresión 3×3
- [ ] Fase 6 — empaquetado de escritorio
