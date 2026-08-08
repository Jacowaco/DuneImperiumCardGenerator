# Dune: Imperium Card Generator

App de escritorio/web para armar cartas custom de *Dune: Imperium*. Web primero
(Vite + React + TypeScript + react-konva); la carcasa de escritorio (Tauri) se
agrega más adelante sin reescribir el render.

## Cómo correrlo

```
npm run dev      # servidor de desarrollo
npm run build    # typecheck + build de producción
```

## El template

El lienzo es de **750 × 1039 px**, que es una carta póker estándar
(63,5 × 88 mm) a **300 DPI**. Exportar a 1× ya sirve para imprimir.

`reference/DuneCardTemplateFull.png` es el PSD aplanado, como referencia visual
de todos los elementos que existen.

## Convención de assets

Hay dos tipos de asset y se tratan distinto:

**1. Capas de marco → `src/assets/layers/`**
PNG de **750 × 1039 con transparencia**, exportados del PSD sin recortar. Como
todos comparten el lienzo, se dibujan en `(0, 0)` y no hace falta calcular
posiciones. Nombres en kebab-case, uno por capa del PSD.

Ya exportadas:
- `black-border.png` — marco negro con interior transparente. Va **último**,
  arriba de todo, y recorta lo que se desborde en las esquinas.
- `card-art-container.png` — rectángulo gris donde el jugador encuadra su
  imagen. Su área útil está en `ART_RECT` (`src/render/constants.ts`):
  x 23, y 84, 704 × 626 px.

**2. Iconos → `src/assets/icons/`**
Recortados al contenido (sin padding transparente), uno por archivo, porque se
posicionan dinámicamente en las filas de Agent / Reveal. Nombres en inglés
según el glosario del reglamento: `water`, `spice`, `solari`, `troop`, `sword`,
`persuasion`, `intrigue`, `trash`, `card-draw`, `victory-point`, etc.

## Arquitectura

`Card` (`src/model/card.ts`) es la única fuente de verdad y `CardStage` es una
función pura de ese objeto. Todo lo demás — guardar, cargar, exportar en lote,
hoja de impresión — sale de serializar `Card`.

El orden de los hijos del `<Layer>` en `CardStage` **es** el orden de apilado
del PSD, de abajo hacia arriba. Al agregar una capa nueva se inserta en el
punto que le corresponde y nada más cambia.

## Estado

- [x] Fase 1 — lienzo, carga de imagen, encuadre (arrastrar + zoom), export PNG
- [ ] Fase 2 — capas estáticas y texto (título, costo, facción). Falta definir
      la tipografía.
- [ ] Fase 3 — sistema de iconos (Agent icons, Agent box, Reveal box)
- [ ] Fase 4 — pulido de UI
- [ ] Fase 5 — biblioteca de cartas, export en lote, hoja de impresión 3×3
- [ ] Fase 6 — empaquetado de escritorio
