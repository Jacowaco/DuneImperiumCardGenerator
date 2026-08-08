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

### Encuadre de la imagen

El encuadre **nunca puede destapar el fondo del contenedor**: `ART_RECT` siempre
queda cubierto por la imagen. `clampArtTransform` (`src/model/art.ts`) es el
único lugar donde se decide eso, y por ahí pasan las tres formas de mover la
imagen — rueda, arrastre y slider de zoom.

Son dos límites: el zoom no baja de `coverScale` (la escala que cubre justo el
recorte, o sea `object-fit: cover`) y el desplazamiento sólo llega hasta donde
la imagen sobra. Por eso el slider arranca en el cover de *esa* imagen y no en
un porcentaje fijo. Una imagen más chica que el recorte necesita más de
`MAX_ART_SCALE` sólo para cubrirlo, así que el techo también se calcula por
imagen (`maxArtScale`).

El arrastre además necesita `dragBoundFunc`: Konva mueve el nodo por su cuenta
mientras se arrastra, sin pasar por el estado de React, así que limitarlo sólo
al guardar el transform dejaría ver el borde durante el movimiento.

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

Las dos cajas van **siempre**: toda carta tiene turno de agente y banda de
revelación, aunque queden vacías. Lo único que se elige es el alto de la de
play (1, 2 o 3 filas).

La silueta del agente (`agent-icon.png`) va encima de la caja de play y en la
carta terminada queda casi tapada por los iconos de contenido; sola se ve más
marcada de lo que se va a ver después.

Las filas de iconos se centran dentro del área interior de la caja (el borde
de adentro, no el exterior): y 705–804 / 843 / 878 según la altura. La fila de
revelación no tiene caja propia, así que se centra en lo que queda entre el
pie de la caja de play y y=1007.

Todos los iconos de una fila se escalan con el **mismo factor**, no a la misma
altura: en el arte original no todos miden igual y unificar la altura les
cambiaría la proporción entre sí. Los tamaños naturales salen de
`src/assets/icons/sizes.json`, que genera el script, para que el layout se
calcule sin esperar a que carguen los PNG.

### Iconos generados

Los rombos de influencia por facción **no se exportan**: los compone
`prepare_assets.py` juntando el rombo vacío (`icons/blanks/`) con el emblema
de la facción (`icons/emblems/`), y salen las 16 combinaciones a
`icons/influence/`. El manifiesto de TypeScript los levanta con
`import.meta.glob`, así que agregar una combinación no toca código.

El centro del rombo se calcula por saturación, no por la fila más ancha: los
chevrones son igual de anchos que el rombo y correrían el centro.

### Deuda pendiente: texto en las cajas de contenido

Las cajas de play y reveal también pueden llevar **texto**, no sólo iconos
(las cartas reales tienen cosas como "Gana 1 influencia con una facción donde
un oponente tenga más que vos"). Todavía no está hecho.

Cuando se haga, `ContentEntry` (`src/model/card.ts`) tiene que pasar de ser
sólo `{ icon, amount }` a una unión discriminada — `{ type: 'icon', … }` |
`{ type: 'text', … }` — y `layoutIconRow` va a tener que medir texto además de
iconos. Eso rompe los archivos ya guardados, así que hay que subir el
`version` en `src/model/storage.ts` y migrar al abrir; el formato ya tiene el
campo previsto.

### Falta exportar

Iconos del juego base que todavía no están:

- Las dos flechas de costo verticales (↓ y el chevrón ancho). Sólo está la
  horizontal.
- Espadachín (el rombo con "+"), Mentat, Control (la banderita), Robar intriga
  a oponentes, y Maker (el gusano).
- Puede que estos sean texto con icono en vez de icono suelto: Alianza,
  Fremen Bond, y el requisito de influencia tipo "2 Influence".

De las expansiones falta conectar `unload.png`, que ya está en `layers/` pero
sin usar (es el Unload de Rise of Ix: una caja de revelación que además se
dispara al descartar o destruir la carta).

## Expansiones

Los reglamentos de Rise of Ix e Immortality están en `reference/`, y de ahí
salen los nombres de los iconos de `expansion icons.png`.

Dos cosas que aclara el reglamento de Ix y conviene no volver a deducir:

- Los iconos de la carpeta `icons/infiltrate/` son la **Infiltración** de Rise
  of Ix, no un estilo alternativo: dejan mandar un agente a un espacio que ya
  ocupa un rival. Por eso son los mismos siete iconos con otro marco.
- `unit` es "tropa o dreadnought" — por eso el icono es un cubo fusionado con
  el casco de un dreadnought.

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
  - [x] filas de iconos dentro de esas cajas, con cantidad
- [ ] Fase 4 — pulido de UI
- [ ] Fase 5 — mazo
  - [x] galería de cartas, guardar y abrir el mazo entero, autoguardado
  - [ ] export en lote
  - [ ] hoja de impresión 3×3
- [ ] Fase 6 — empaquetado de escritorio

## Guardar

`src/model/files.ts` implementa Guardar / Guardar como con la File System
Access API. El navegador no puede sobrescribir un archivo salvo que el usuario
lo haya elegido en un diálogo nativo: de ahí sale un *handle* que la app se
guarda y reusa, y eso es exactamente lo que separa "Guardar" de "Guardar
como". Sin handle, "Guardar" se comporta como "Guardar como".

La API sólo está en Chrome y Edge. Donde no está, las dos opciones bajan una
copia (el comportamiento viejo) y el panel lo avisa.

El estado "sin guardar" se marca en `mutate()` (`src/App.tsx`), que es el único
lugar por donde pasan los cambios del mazo — comparar el mazo serializado
contra el último guardado sería carísimo con las imágenes embebidas.

El diálogo nativo no se puede automatizar con Playwright, así que las pruebas
end-to-end cubren el camino de respaldo (borrando `window.showSaveFilePicker`)
y el estado de los botones; el diálogo en sí hay que probarlo a mano.

## La galería

El archivo guardado pasó a tener un **mazo** (`version: 2`, con `cards[]`).
`parseDeck` sigue abriendo los de `version: 1`, que tenían una sola carta en
`card`, envolviéndola en un array.

Las miniaturas son el mismo `CardStage` que el preview grande, a escala chica
y sin `onArtChange` — ese prop es lo que decide si la carta es interactiva. Se
hace así, y no con una imagen aparte, para que una carta en la galería nunca
pueda verse distinta de como se va a exportar.
