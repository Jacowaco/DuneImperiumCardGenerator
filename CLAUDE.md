# Dune: Imperium Card Generator

App de escritorio/web para armar cartas custom de *Dune: Imperium*. Web primero
(Vite + React + TypeScript + react-konva); la carcasa de escritorio (Tauri) se
agrega más adelante sin reescribir el render.

Para ubicarse rápido: **"Estado"** dice qué está hecho y qué sigue, y
**"Cómo trabajar acá"** explica el método y el harness para verificar cambios
en el navegador. El resto del documento son las decisiones de diseño y las
medidas, con el porqué de cada una.

## Cómo correrlo

```
npm run dev      # servidor de desarrollo, en http://localhost:5188/
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

### Los cuatro juegos del mismo emblema

Del PSD salen tres hojas con los mismos siete iconos de agente en columna, y
cada una tiene su razón de existir. `COLUMN_SHEETS` en el script las rebana a
una carpeta cada una:

| Carpeta | Hoja | Qué es | Dónde se usa |
|---|---|---|---|
| `locations/` | `location symbols.png` | placa negra con marco crema | la columna de agente de la carta |
| `infiltrate/` | `infiltrate symbols.png` | el estilo Infiltración de Ix | ídem, cuando se elige ese estilo |
| `badges/` | `simbolos con fondo.png` | placa negra, sin marco | los botones del panel |
| `emblems/` | `simbolos sin fondo.png` | el emblema pelado | componer los rombos de influencia |

`emblems/` es el único que **no** se importa desde TypeScript: lo consume el
script de assets. Los otros tres sí, desde `src/assets/icons/agents.ts`.

### Iconos propios

El usuario puede subir sus propios iconos, para reglas que el juego no trae.
Van en el mazo (`deck.icons`), no en la app: el PNG viaja como data URL dentro
del `.dune.json`, igual que la imagen del jugador, así que un mazo con reglas
custom abre igual en otra máquina. Su id lleva el prefijo `custom:` para que
nunca choque con uno del PSD.

Por eso el catálogo de iconos **dejó de ser una constante del build**:
`src/model/iconLibrary.ts` junta en una sola tabla lo que antes estaban en tres
(`ICONS`, `sizes.json` y `ICON_NUMBER_COLORS`) y le suma los del mazo abierto.
Va por contexto de React porque lo necesitan tanto el render como los paneles.
Ojo con los dos lugares que no cuelgan del árbol de la app:

- `renderCard.tsx` monta un root aparte, así que el provider hay que ponerlo de
  nuevo ahí adentro; si no, la hoja de impresión sale con los iconos del PSD y
  sin los propios.
- `prepare()` los tiene que precargar como cualquier otra imagen de la carta.

Al subirlo, `src/model/customIcon.ts` lo **recorta al contenido** en un canvas,
que es lo mismo que `prepare_assets.py` le hace a la hoja de símbolos: el
layout posiciona los iconos por su caja real, así que un PNG con margen
transparente quedaría flotando lejos del texto. Se guarda al doble del alto
nominal (198 px), que es lo que se dibuja a 1×; más que eso sólo engorda el
mazo. El recorte se busca sobre una copia reducida a 1024 px, porque barrer el
alpha de una foto de 4000 px cuesta caro y el resultado se guarda chico igual.

Lo que **no** se puede deducir de la imagen es qué tan grande quiere verse al
lado del texto: un icono recortado no lo dice. Por eso entra al 100% del alto
nominal y el panel tiene un % por icono. Tampoco llevan cantidad encima como
el solari o la especia — para eso se agrega una pieza de texto, que es lo que
hacen las cartas reales cuando el número no está dibujado en el símbolo.

Un icono borrado deja cartas que lo nombran. Eso no rompe nada y se resuelve
igual en los tres lados: la pieza no reserva lugar en el layout, la cinta del
beneficio de compra vuelve al rombo solo (una cinta vacía se lee como un error
de dibujo) y el editor marca la pieza en rojo, que es el único lugar donde el
usuario puede hacer algo al respecto. Borrar avisa antes en cuántas cartas
estaba.

#### La biblioteca

Para no volver a subir lo mismo en cada mazo, `src/model/iconStore.ts` guarda
los iconos propios en IndexedDB. La biblioteca es **sólo un lugar de donde
copiar**: traer un icono lo copia al mazo, no lo referencia, y el id viaja con
la copia, así que el mismo icono en dos mazos es el mismo icono y la biblioteca
no se llena de duplicados.

Eso es lo que sostiene la regla de arriba: **el render nunca ve la biblioteca**,
sólo el mazo. `App.tsx` arma el catálogo (`buildIconLibrary`) con `deck.icons`
y nada más. Si el selector de las cajas ofreciera iconos de la biblioteca
directamente, una carta podría dibujar algo que no está en el archivo — se
vería bien acá y saldría con un hueco en cualquier otra máquina.

Las dos direcciones son copias explícitas y la copia es **de ida nomás**:
cambiarle el tamaño a un icono en un mazo no toca la biblioteca. Al revés sería
peor: editar un icono te cambiaría cartas ya terminadas de otro mazo sin que lo
pidas. Subir uno sí lo guarda solo, porque subirlo ya es decir que te importa.
Por eso las dos copias no se comportan igual: del mazo a la biblioteca **pisa**
lo que hubiera con ese id (volver a guardarlo es decir "quedate con esta
versión"), y de la biblioteca al mazo **no**, porque el mazo puede tener un
tamaño ajustado para estas cartas.

Los dos diálogos muestran las dos listas, una sección cada una, porque son dos
cosas distintas y confundirlas se paga caro: borrar de la biblioteca es para
siempre y en todos los mazos, borrar del mazo no. La ficha del mazo dice
además en cuántas cartas se usa —o "sin usar"—, y la de la biblioteca marca si
ya está en el mazo.

`deck.icons` y `deck.factions` son **la lista del mazo**, no un resumen de lo
que las cartas usan: se traen a mano, pueden estar sin usar todavía, y se
guardan tal cual. Antes se recalculaban solas en cada cambio (`packIcons` /
`packFactions`, ya borradas) y eso hacía imposible tener un icono listo para
usar. Como son parte del mazo, se editan con `mutate` igual que una carta: se
deshacen y marcan el archivo como sin guardar.

IndexedDB y no localStorage porque ahí vive el autoguardado del mazo: unos
pocos iconos de decenas de KB competirían por los ~5 MB del mismo cupo y lo
primero que se rompería es el autoguardado.

**La base se abre en un solo lugar** (`src/model/db.ts`). Cada `open` declara
una versión y la base se queda con la más alta que le hayan pedido, así que un
módulo que abriera la 1 después de la migración a la 2 fallaría con
`VersionError`. Agregar un store es sumar un `createObjectStore` ahí y subir
`VERSION`, nunca abrir la base por afuera.

La biblioteca es de este navegador y no viaja — por eso mismo el mazo tiene que
seguir llevando el PNG adentro.

### Texto en las cajas de contenido

El contenido de cada caja es una lista de `ContentPart` (`src/model/card.ts`):
iconos, texto y cortes de renglón mezclados en el mismo orden en que se
dibujan. `layoutContent` (`src/render/contentLayout.ts`) los acomoda.

Cómo funciona el acomodo:

- Las piezas se miden en una **escala nominal** (icono = 99 px) y después todo
  se achica junto. La escala se busca probando: al achicar entra más texto por
  renglón, así que el corte de línea cambia y hay que rehacerlo. Se arranca a
  tamaño completo y se baja de a 2% hasta que el bloque entra a lo alto.
- La separación entre piezas contiguas la decide `separation()`: un espacio
  normal entre palabras, y el hueco grande en cuanto hay un icono de por medio.
  **El corte de renglón y el posicionado tienen que usar la misma cuenta**; si
  difieren, el renglón queda descentrado.
- Todo va centrado, horizontal y verticalmente — confirmado contra las cartas
  de `reference/cards/`.

Una pieza de texto **vacía** se dibuja con la palabra «Texto» atenuada, y por
eso `layoutContent` recibe la palabra de relleno como parámetro. Sin ella la
pieza no dibuja nada, así que recién soltada en la caja no había de dónde
agarrarla sobre la carta — que es justo cuando se la quiere mover. El relleno
lo pide el editor y nadie más: la galería, las hojas de impresión y el export
en lote no lo pasan, así que ven la carta igual que el PNG. El botón de
exportar la carta abierta sí saca el PNG del stage del preview, y por eso lo
apaga antes con `flushSync` (`placeholders` en `CardStage`): ocultar el relleno
no alcanzaría, porque el lugar que ocupaba corre el resto del renglón.

Las medidas de `CONTENT.text` salen de medir una carta impresa
(`reference/cards/appropriate.png`): ahí el bloque está al 66% porque tiene
tres renglones, y a tamaño completo dan icono 99 / mayúscula 33 /
interlineado 62.

### Falta exportar

Iconos del juego base que todavía no están:

- Las dos flechas de costo verticales (↓ y el chevrón ancho). Sólo está la
  horizontal.
- Espadachín (el rombo con "+"), Mentat, Control (la banderita), Robar intriga
  a oponentes, y Maker (el gusano).

Alianza, Fremen Bond y el requisito de influencia tipo "2 Influence" **no son
iconos sueltos**: en las cartas reales son texto con un icono al lado, dentro
de la caja de contenido. Ya se pueden armar con el editor.

De las expansiones falta conectar `unload.png`, que ya está en `layers/` pero
sin usar (es el Unload de Rise of Ix: una caja de revelación que además se
dispara al descartar o destruir la carta).

El icono que se creía que era el Dreadnought (nave) en realidad es el de
Carguero (`freighter`, el escudo con el chevrón claro adentro): el reglamento
de Ix lo confirma. `expansion icons.png` no trae un icono de Dreadnought
aparte — sólo está `unit` (tropa o acorazado fusionados). Falta exportarlo si
se necesita el símbolo suelto.

## Expansiones

Los reglamentos de Rise of Ix e Immortality están en `reference/`, y de ahí
salen los nombres de los iconos de `expansion icons.png`.

Dos cosas que aclara el reglamento de Ix y conviene no volver a deducir:

- Los iconos de la carpeta `icons/infiltrate/` son la **Infiltración** de Rise
  of Ix, no un estilo alternativo: dejan mandar un agente a un espacio que ya
  ocupa un rival. Por eso son los mismos siete iconos con otro marco.
- `unit` es "tropa o dreadnought" — por eso el icono es un cubo fusionado con
  el casco de un dreadnought.

## Cómo trabajar acá

Dos costumbres que vienen sosteniendo la calidad de este proyecto y conviene
mantener:

**Medir, no estimar.** Cada número de `constants.ts` salió de medir un PNG o un
render de referencia con Pillow, no de mirar a ojo. Cuando algo no encaja, casi
siempre es porque se dedujo en vez de medirse — pasó con el centro de los
rombos de influencia (el "?" no está en el centro geométrico) y con las bandas
de facción (el alto real es 43,27 px, no 44).

**Verificar mirando el resultado, no sólo que compile.** El typecheck no ve que
un icono quedó pegado al texto ni que un emblema quedó 8 px arriba. Todos los
bugs de layout de este proyecto se encontraron abriendo la app y mirando.

### Harness de verificación

No hay Playwright instalado en el proyecto ni navegadores descargados. En vez
de eso se maneja el **Edge que ya está en la máquina** con `playwright-core`
desde el scratchpad:

```js
import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
})
```

Con eso se llena el panel, se saca screenshot y se dispara "Exportar PNG"
capturando el evento `download` — o sea que se puede revisar el PNG exportado
de verdad, no sólo el preview. Conviene siempre escuchar `pageerror` y
`console` para no dar por bueno un render que tiró excepciones.

Detalles que hacen perder tiempo si no se saben:
- **El panel está en pestañas**: antes de buscar un control hay que abrir la
  suya con `page.getByRole('tab', { name: 'Reglas' }).click()`. Un control que
  "no aparece" casi siempre está en otra pestaña, o adentro de un diálogo —
  iconos propios e impresión se abren desde el pie de la galería.
- `inert` no se ve con `isEditable()`, que sólo mira `disabled` y `readonly`.
  Para chequear que algo quedó bloqueado: `el.closest('[inert]') !== null`.
- Las secciones del panel se ubican mejor con
  `page.locator('section').filter({ has: page.locator('h2', { hasText: … }) })`.
- Casi todos los botones necesitan `exact: true`: "Guardar" también matchea
  "Guardar como…", y "1 fila" matchea el nombre accesible del grupo entero.
- Conviene `localStorage.clear()` y recargar al empezar, porque el autoguardado
  arrastra el mazo de la corrida anterior.
- El diálogo nativo de archivos **no se puede automatizar**. Para probar el
  camino de respaldo se borra `window.showSaveFilePicker` con `addInitScript`.

### Referencias

- `reference/cards/` — 110 cartas reales bajadas de duneimperiumassets.com,
  con nombre. **Están en `.gitignore`**: son arte de Dire Wolf, se usan para
  resolver dudas de layout y no viajan con el repo. Ya sirvieron para confirmar
  que el contenido va centrado, que la columna de agente se llena desde abajo,
  y para sacar las medidas del texto.
- `reference/*.pdf` — los tres reglamentos. De ahí salen los nombres correctos
  de los iconos; el glosario está en las últimas páginas. Se leen con `pypdf`
  (no hay renderizador de PDF instalado).

### Cuidado con el watcher

`vite.config.ts` ignora `psd-exports/`, `reference/` y los `*.pdf`. Si Windows
tiene uno de esos archivos abierto en otro programa, el watcher de Vite se cae
con `EBUSY` y **se lleva puesto el servidor entero**, no sólo ese archivo.

## Arquitectura

`Card` (`src/model/card.ts`) es la única fuente de verdad y `CardStage` es una
función pura de ese objeto. Todo lo demás — guardar, cargar, exportar en lote,
hoja de impresión — sale de serializar `Card`.

El orden de los hijos del `<Layer>` en `CardStage` **es** el orden de apilado
del PSD, de abajo hacia arriba. Al agregar una capa nueva se inserta en el
punto que le corresponde y nada más cambia.

### El layout de la app

La app se usa en una pantalla de computadora: **ancha y baja**. Todo el layout
sale de ahí, porque lo que escasea es el alto y lo que sobra es el ancho.

```
┌─ TopBar ─ idioma · deshacer/rehacer · Exportar PNG ──────────────────┐
├──────────────┬─────────────────────────────────────┬────────────────┤
│ pestañas     │                                     │ galería        │
│ Imagen       │            preview                  │ (el mazo,      │
│ Carta        │                                     │  en columna)   │
│ Reglas       │                                     ├────────────────┤
│              │                                     │ nombre · Abrir │
│              │                                     │ Guardar/Como…  │
│              │                                     │ Iconos│Imprim  │
└──────────────┴─────────────────────────────────────┴────────────────┘
```

**La columna izquierda es la carta abierta y la derecha es el mazo**, de punta
a punta. Es la división que ordena todo lo demás, y romperla se nota: la
primera versión metía una pestaña "Mazo" entre las de la carta, y quedaba
fuera de lugar por partida doble — no es de la carta, y se usa mucho menos que
las que tenía al lado.

De ahí salen cuatro decisiones, todas para no gastar alto:

- **Todo lo que es del mazo va en su columna, no en la barra de arriba.**
  Nombre, Abrir, Guardar y Guardar como (`DeckFileControls`) viven al pie de
  la galería, junto con Iconos propios, Facciones propias e Imprimir —que
  además abren en diálogo (`src/ui/Dialog.tsx`, para lo que se usa cada
  tanto)— y exportar el mazo entero en PNGs sueltos. Antes Guardar y Abrir
  vivían arriba, por lo seguido que se usan, pero eso mezclaba en la misma
  barra cosas del mazo con cosas de la sesión de edición; agrupar por qué es
  cada cosa resultó más claro que agrupar por qué tan seguido se toca. La
  barra de arriba se quedó con lo que no es ni de una carta ni del mazo como
  archivo: deshacer/rehacer, el idioma, y exportar la carta abierta.
- **El panel va en pestañas** (`src/ui/Tabs.tsx`). Eran trece secciones
  apiladas en una sola columna. Cada pestaña agrupa una decisión distinta sobre
  la carta, y van en el orden en que se arma una: **Imagen** (`ArtPanel`),
  **Encabezado** (`CardPanel`) y **Reglas** (`RulesPanel`). La imagen es lo
  primero porque es lo que hace que la carta sea algo — por eso es también la
  pestaña con la que abre la app. Como todo el panel es de la carta abierta, se
  bloquea entero con `inert` al marcarla terminada.

  Los nombres son las **zonas de la carta**, no categorías abstractas:
  "Encabezado" es lo que se dibuja arriba —placa del nombre, banda de facción y
  rombo del costo— y "Reglas" son las cajas de abajo. La del medio se llamó
  "Carta" al principio y era un mal nombre: en un editor de cartas **todo** es
  la carta, así que no distinguía nada, y encima adentro tenía una sección
  llamada igual.
- **La galería va a la derecha, en columna.** El preview es una carta parada:
  el alto es justo lo que necesita y una tira de miniaturas abajo se lo
  quitaba. Al costado ocupa ancho, que es lo que sobra.
- **Lo que se usa cada tanto va en diálogo** (`src/ui/Dialog.tsx`, el `<dialog>`
  nativo). Iconos propios e impresión son del mazo entero, así que se abren
  desde el pie de la columna del mazo — que es donde se los busca — y no
  ocupan lugar fijo mientras no se usan. Ese pie es `children` de
  `CardGallery`, para que la galería siga siendo sólo cartas.

Donde el navegador no tiene la File System Access API, el aviso de que
«Guardar» baja una copia va al lado de `DeckFileControls`, en el pie de la
galería; la versión larga está en su `title`.

Entra sin scroll horizontal en 1024 × 640, que es la ventana más chica en la
que tiene sentido usarla.

### Iconos de la interfaz

**Nada de emoji.** Se dibujan a todo color con la fuente del sistema y el único
color de la pantalla tiene que ser el de la carta; al lado del arte del juego
se leen como un adorno pegado encima.

En su lugar, `src/ui/icons.tsx` tiene SVG monocromos en `currentColor`, así que
heredan el color del botón —incluido el atenuado de `disabled`— sin tener que
mantener una variante por estado. La regla de dónde van:

- **Sí** en botones que hacen algo con un archivo (abrir, guardar, exportar,
  imprimir, subir), en los que abren un diálogo y en las tres pestañas. Son los
  que se buscan de un vistazo, y ahí el símbolo llega antes que la palabra.
- **No** en títulos de sección, etiquetas de campo ni en los grupos de
  `Choice`/`MultiChoice`. Ahí el texto ya alcanza y el icono sólo agrega ruido —
  las facciones, además, ya se distinguen por color.

El de iconos propios es el **rombo del juego** y no un "shapes" genérico: la
forma de los iconos de Dune es esa, y así el botón dice de qué iconos habla.

Aparte de esos SVG hay dos lugares donde el botón muestra **arte del juego**:
los iconos de agente y las facciones. Los dos usan `AGENT_BADGE_URLS` —el
emblema sobre su placa negra, de `icons/badges/`— y no el emblema pelado.

El motivo es el fondo que tienen atrás. Los botones de facción van pintados del
color de la facción, y ahí el emblema solo **desaparece**: medidos contra su
propio color dan menos de 1,1 de contraste (bene gesserit 104 de luminancia
sobre 98, fremen 130 sobre 128, cofradía 81 sobre 89). No es casualidad — el
color del botón está muestreado de la banda de esa misma facción, así que
emblema y fondo salen de la misma paleta. La placa negra lo despega de
cualquier color que tenga atrás, incluido el dorado del botón elegido.

`Button` es `inline-flex` con `gap-1.5` para acomodarlos. Como flex y grid
convierten a sus hijos en bloques, los botones que ya estaban dentro de una
grilla siguen ocupando la celda entera.

## Estado

- [x] Fase 1 — lienzo, carga de imagen, encuadre (arrastrar + zoom), export PNG
- [x] Fase 2 — nombre (versalitas), variante de mazo inicial, banda de facción,
      costo de compra y beneficio de compra. Tipografía: **Jost**, elegida como
      reemplazo libre hasta saber cuál usa el PSD.
- [x] Fase 3 — sistema de iconos
  - [x] fondo negro y columna de iconos de agente (dos estilos)
  - [x] cajas de play (3 alturas) y banda de reveal
  - [x] filas de iconos dentro de esas cajas, con cantidad
  - [x] texto mezclado con los iconos, con corte de renglón automático
  - [x] iconos propios subidos por el usuario, guardados en el mazo y en una
        biblioteca del navegador para reusarlos entre mazos
- [ ] Fase 4 — pulido de UI
  - [x] layout de escritorio: barra de arriba, panel en pestañas, galería al
        costado
- [ ] Fase 5 — mazo
  - [x] galería de cartas, guardar y abrir el mazo entero, autoguardado
  - [x] Guardar / Guardar como con diálogo nativo, recordando el archivo
  - [x] hoja de impresión 3×3
  - [x] export en lote
- [ ] Fase 6 — empaquetado de escritorio

### Lo próximo

En orden de valor, y ninguno depende de exportar nada más del PSD:

1. **Conectar `unload.png`** — la banderola roja de Rise of Ix. En las cartas
   reales lleva texto y un icono adentro, así que se resuelve con el mismo
   `ContentPart` que ya existe.

Y lo que sigue trabado esperando arte del PSD está en "Falta exportar".

## Las hojas de impresión

`src/export/printSheet.ts` arma la grilla de cartas que entra en el papel
elegido y la baja como **un PDF con todas las páginas**, no como PNG sueltos.

Lo que aporta el PDF es el **tamaño físico**: la hoja viaja declarada en puntos,
así que se imprime 1:1 y no hay forma de que un "ajustar a la página" deje las
cartas del tamaño equivocado, que es la manera más común de arruinar el trabajo.
`src/export/pdf.ts` lo escribe a mano —una imagen por página, sin texto ni
fuentes— porque una dependencia de PDF pesa más que toda la app junta. La imagen
va con `FlateDecode` (`CompressionStream('deflate')`, que ya da formato zlib) y
no como JPEG: el texto y las líneas de la carta son justo lo que peor le sienta
a la compresión con pérdida. Un A4 de nueve cartas pesa ~1 MB.

Todo se dibuja a **300 DPI**, no al doble como el export de una carta suelta. A
300 DPI el template se dibuja píxel a píxel —los PNG del PSD son de esa
resolución—, así que subir la escala no agrega detalle: sólo cuadruplica el
archivo. La carta suelta sí sale a 2× porque ahí la imagen del jugador puede
tener más resolución que el template.

### Papeles y sangrado

`src/export/paper.ts` es el único lugar donde se decide la geometría. La grilla
**no está escrita**: sale de dividir el papel por el paso de la carta, así que
agregar un tamaño es agregar una línea a `PAPERS`.

| Papel | Pegadas | Con sangrado |
|---|---|---|
| A4 210 × 297 | 3 × 3 = 9 | 2 × 3 = 6 |
| Carta 215,9 × 279,4 | 3 × 3 = 9 | 2 × 2 = 4 |
| A3 297 × 420 | 4 × 4 = 16 | 4 × 4 = 16 |
| SRA3 320 × 450 | 4 × 4 = 16 | 4 × 4 = 16 |

Los dos modos son dos destinos distintos:

- **Pegadas** (casa): las cartas se tocan y comparten el corte, así que un corte
  de guillotina hace el borde de dos cartas. Entran más y no se desperdicia
  papel, pero no perdona el desalineado.
- **Con sangrado** (imprenta): cada carta se dibuja 3 mm más grande de negro por
  lado y se corta sola. **El sangrado no inventa nada**: el borde de la carta ya
  es negro sólido, con 2 mm de negro antes de que empiece el contenido, así que
  extenderlo con negro es continuar el mismo color. Un corte corrido 1 mm deja
  negro en vez de un filo blanco.

En A3 y SRA3 el sangrado sale gratis —entran las mismas 16 cartas— porque lo que
sobra es margen. En A4 cuesta un tercio de la hoja.

### Las marcas de corte

Van **afuera del bloque**, en los cuatro márgenes, y no entre las cartas: pegadas
se tocan y con sangrado el hueco entre dos es todo tinta. Como la grilla es
regular, marcarla en los bordes alcanza. Se dibujan con `fillRect` y no con
`stroke`, para que una línea de 2 px sobre una coordenada entera salga nítida.

**El largo se calcula, no es fijo**, y esto importa: el ancho del papel lo fija
la carta (tres de 63,5 mm son 190,5 de los 210 del A4), así que el margen que
queda es de 9,7 mm y en Carta el de arriba es de 7,8. Muchas impresoras no
imprimen los primeros 4 mm, así que una marca de largo fijo se perdería justo en
el papel más chico. `markLength()` la recorta a lo que entra entre `SAFE_EDGE` y
la carta: en A4 quedan a 5,2–9,7 mm del borde y en Carta a 4,0–7,2.

El bloque va **centrado** en la hoja, así que la última página queda igual de
encuadrada aunque tenga menos cartas — cada hoja se corta por separado, no
necesitan coincidir. Las marcas cubren el bloque entero: si la última fila está
incompleta, hay marcas que dan a papel en blanco.

### Dibujar cartas que no están abiertas

La hoja necesita hasta dieciséis cartas y en pantalla hay una sola. `renderCard.tsx` monta
**el mismo `CardStage`** en un contenedor fuera de la pantalla: la carta que se
imprime es exactamente la que se ve, y no hay un segundo renderizador que se
vaya desincronizando. El contenedor está en el documento y corrido con
`position: fixed`, no con `display: none`, porque Konva mide el contenedor al
montar el stage y uno oculto mide 0.

Lo que hace que salga completa es que **no quede nada asíncrono al momento de
dibujar**: `prepare()` deja fuentes e imágenes cargadas de antemano y
`flushSync` obliga a React a montar el stage antes de seguir. `toCanvas()`
dibuja la escena en un canvas nuevo, así que tampoco depende del redibujado
diferido de Konva ni se pisa con la carta siguiente.

Para eso está `src/render/imageCache.ts`, que reemplazó a `use-image`. La
diferencia es que responde **sincrónicamente** cuando la imagen ya se cargó una
vez: `use-image` crea un `Image` por componente y avisa recién en el `load`, o
sea que la primera pasada del canvas siempre sale incompleta. En el preview no
se nota porque se redibuja solo; en la hoja el icono faltante se va al PNG y
nadie se entera. De paso la galería dejó de cargar el mismo PNG una vez por
miniatura.

Si se agrega un tipo de imagen nuevo a la carta, hay que sumarlo a `prepare()`.
Es el único lugar donde el export sabe qué cargar, y olvidarse no rompe nada
visible: sale un hueco.

## El export en lote

`src/export/exportPngBatch.ts` baja **todas las cartas del mazo, cada una como
PNG suelto, dentro de un único `.zip`**. Reusa `prepare()` y
`createCardRenderer()` de `renderCard.tsx` —el mismo renderizador fuera de
pantalla de la hoja de impresión— y sólo itera la galería en vez de componer
una grilla.

Sale a **2× (600 DPI)**, la escala de un PNG suelto (`EXPORT_SCALE` en
`exportPng.ts`) y no la 1× de la hoja: acá no hay una hoja física que fije la
resolución, así que se mantiene la de exportar la carta abierta desde arriba.
`createCardRenderer()` recibe la escala como parámetro justo por esto —la hoja
sigue pidiendo 1×, sin tocarla.

Un archivo por carta bajado uno por uno abriría un diálogo de descarga por
cada uno, y varios navegadores bloquean las descargas después de la primera:
por eso salen empaquetadas juntas, en el mismo espíritu que la hoja de
impresión sale en un solo PDF y no en PNG sueltos. `src/export/zip.ts` escribe
el `.zip` a mano, igual que `pdf.ts` con el PDF, y sin comprimir (`STORE`): lo
que entra ya es PNG, así que deflatearlo de nuevo apenas lo achica y no vale la
complicación.

Dos cartas con el mismo nombre —o sin nombre— no pueden pisarse en el zip:
`uniqueName()` agrega `-2`, `-3`… al repetirse, y una carta sin título cae a
`carta-N` por posición.

## Guardar

`src/model/files.ts` implementa Guardar / Guardar como con la File System
Access API. El navegador no puede sobrescribir un archivo salvo que el usuario
lo haya elegido en un diálogo nativo: de ahí sale un *handle* que la app se
guarda y reusa, y eso es exactamente lo que separa "Guardar" de "Guardar
como". Sin handle, "Guardar" se comporta como "Guardar como".

La API sólo está en Chrome y Edge. Donde no está, las dos opciones bajan una
copia (el comportamiento viejo) y el panel lo avisa.

Que la función exista no alcanza: la **vista previa embebida de VSCode** da el
diálogo pero después `createWritable` falla con `NotAllowedError`. No hay forma
de detectarlo sin intentar escribir, así que `files.ts` anota el fallo en
`writesBlocked` y de ahí en más se comporta como Firefox. Probar la app ahí es
engañoso: hay que abrirla en una ventana de Chrome.

El handle **sobrevive a recargar la página**: va a IndexedDB
(`src/model/recentFile.ts`), porque es clonable pero no serializable a texto,
así que no entra en el localStorage del autoguardado. Sólo se recupera si el
mazo también viene del autoguardado — arrancar con una carta vacía y que
"Guardar" pise el mazo de ayer sería peor que preguntar.

**Abrir un archivo da permiso de lectura nada más.** `showOpenFilePicker` no
tiene opción para pedir escritura (`mode` es sólo del picker de carpetas), así
que el primer "Guardar" sobre un mazo abierto siempre pasa por el cartel de
Chrome — aceptarlo una vez alcanza para toda la sesión. El permiso tampoco
sobrevive a recargar, y pedirlo necesita un click reciente: por eso se pide
dentro de `saveDeck` y no al abrir ni al recuperar el handle, donde el click ya
se lo consumió el diálogo.

Por eso `saveDeck` devuelve `'saved' | 'denied' | 'missing'` y no un booleano.
Si el archivo ya no está sólo queda preguntar dónde guardar, pero si lo que
falta es el permiso hay que **decirlo**: abrir el diálogo en silencio se lee
como que "Guardar" ignoró el mazo abierto, que fue justamente el bug.

El estado "sin guardar" se marca en `mutate()` (`src/App.tsx`), que es el único
lugar por donde pasan los cambios del mazo — comparar el mazo serializado
contra el último guardado sería carísimo con las imágenes embebidas.

El diálogo nativo no se puede automatizar con Playwright, así que las pruebas
end-to-end cubren el camino de respaldo (borrando `window.showSaveFilePicker`)
y el estado de los botones; el diálogo en sí hay que probarlo a mano.

## Idioma

La UI y las palabras del juego (nombres de facción, iconos, papeles) se
pueden ver en español o en inglés. Dos decisiones lo mantienen simple:

**Es una preferencia del navegador, no del mazo.** `src/model/language.ts`
guarda el idioma elegido en su propio `localStorage`, aparte del autoguardado.
Un `.dune.json` no lleva el idioma adentro — abrirlo en otra máquina se ve en
el idioma que esa máquina tenga elegido, igual que el resto de la UI. Por eso
no es un campo de `Card` ni de `Deck`, y por eso `exportPrintSheets` recibe el
idioma como parámetro (`SheetOptions.language`) en vez de leerlo del mazo.

**Diccionario propio, sin librería.** `src/i18n/strings.ts` tiene un objeto
`Strings` por idioma (`es` y `en`), no un mapa `clave -> {es, en}`: así
TypeScript obliga a que los dos idiomas tengan exactamente los mismos campos,
con el mismo tipo — si a una función traducida (una que arma texto con un
número o un nombre adentro) le falta un parámetro en un solo idioma, no
compila. Es consistente con el resto del proyecto, que evita dependencias
pesadas para poco (el PDF de las hojas de impresión también se escribe a
mano).

Las palabras del **juego** —facciones, iconos, estilos de agente, variantes de
influencia, tamaños de papel— no viven en `strings.ts`: se traducen donde ya
vivían (`FACTIONS` en `card.ts`, `AGENT_ICONS`/`AGENT_ICON_STYLES` en
`agents.ts`, `INFLUENCE_VARIANTS` en `influence.ts`, las etiquetas de
`assets/icons/index.ts`, `PAPERS` en `paper.ts`), cada valor pasa de `string` a
`Record<Language, string>`. Van ahí y no en `strings.ts` porque además de la
UI los necesita el catálogo de iconos (`iconLibrary.ts`, que ahora recibe
`language` y arma las etiquetas para ese idioma) y el render de la carta.

**La banda de facción es la única parte de la carta impresa que lleva
palabras** (`FactionBand.tsx` dibuja el nombre con `TextShape`, confirmado
recorriendo los demás `render/layers/*`: todo lo demás son iconos). Por eso el
render también necesita el idioma, no sólo los paneles — usa
`useLanguage()`, el mismo patrón de contexto que `IconLibraryProvider`. Eso
implica el mismo cuidado que ya pedía la biblioteca de iconos: `renderCard.tsx`
monta un root de React aparte para la hoja de impresión, así que el
`LanguageProvider` hay que volver a ponerlo ahí adentro con el idioma vigente
al momento de exportar; si no, las hojas impresas saldrían siempre en español.

**Los errores también se traducen, pero no donde se tiran.** Un `parseDeck`
o un `loadCustomIcon` no tienen forma de saber qué idioma está eligiendo la
UI — son funciones de modelo, no componentes. En vez de armar el mensaje ahí,
tiran un `AppError` (`src/model/errors.ts`) con un código y sus parámetros
(por ejemplo `{ name: file.name }`), y quien atrapa el error —siempre un
componente, que sí tiene el idioma a mano— lo traduce con `describeError()`.
Los `DOMException` y demás errores que no son propios de la app se muestran
tal cual: no hay forma de traducir algo que no se vio venir.

`Faction`, `AgentIconStyle` e `InfluenceVariant` pasaron de `keyof typeof
FACTIONS` (etc.) a una unión de literales escrita a mano, declarada *antes*
que la constante. Con el valor tipado como `Record<Language, string>`,
`keyof typeof` después de la declaración quedaba en una referencia circular:
el tipo de la constante depende de una clave que depende del tipo de la
constante.

## La galería

El archivo guardado pasó a tener un **mazo** (`version: 8`, con `name`,
`cards[]`, `icons[]` y `factions[]`). `migrate()` en `src/model/storage.ts`
sube los archivos viejos al abrirlos: la versión 1 tenía una sola carta en
`card`, la 2 guardaba el contenido de las cajas como listas de iconos sueltos
(`playIcons` / `revealIcons`) en vez de piezas mezcladas con texto, la 3 no
tenía iconos propios, la 4 no tenía nombre propio y la 7 no tenía facciones
propias — un mazo así muestra en el pie de la galería el nombre del archivo,
hasta que se edita.

La 6 sumó `library?: CustomIcon[]` y la 8 sumó `factionLibrary?:
CustomFaction[]`, los dos opcionales: las bibliotecas enteras del que guardó,
no sólo lo que el mazo tiene disponible (eso lo siguen llevando
`icons[]`/`factions[]`). Es lo que arma el toggle "Incluir biblioteca"
al pie de la columna del mazo, junto a "Iconos…", "Facciones…" e
"Imprimir…" —es del mazo entero y se usa cada tanto, no algo que se mire en
cada guardado, así que no va en la `TopBar`—, sólo visible si hay algo en
alguna de las dos bibliotecas para ofrecer, para compartir mazo y bibliotecas
en un solo archivo sin que el guardado de todos los días —incluido el
autoguardado— arrastre toda la biblioteca. El contador del toggle suma las dos
listas.

Al abrir, **a la biblioteca entra sólo eso**: lo que el que guardó eligió
compartir (`adoptIcons` en `src/model/iconStore.ts`, `adoptFactions` en
`src/model/factionStore.ts`). Los `icons[]`/`factions[]` del mazo se quedan en
el mazo — se dibujan igual, y pasarlos a tu biblioteca es una copia que se pide
desde el diálogo. Antes se adoptaba todo, y abrir el mazo de otro te llenaba la
biblioteca de iconos ajenos.

El nombre del mazo (`deck.name`) es del usuario, no del archivo: se edita
clickeando el nombre al pie de la galería (`DeckFileControls`) y no tiene por
qué coincidir con cómo se guardó. Si nunca se tocó, cae al nombre del archivo
abierto (`deckName()`), y si tampoco hay archivo muestra "Mazo sin guardar".

Las miniaturas son el mismo `CardStage` que el preview grande, a escala chica
y sin `onArtChange` — ese prop es lo que decide si la carta es interactiva. Se
hace así, y no con una imagen aparte, para que una carta en la galería nunca
pueda verse distinta de como se va a exportar.

### El tilde de terminada

`card.done` marca las cartas que ya no hay que tocar. Es una anotación de
trabajo: viaja en el archivo del mazo pero **el render no la mira**, así que no
sale en el PNG — el sello de la galería y el tilde de la casilla son HTML
aparte del `Stage` de Konva, no capas de la carta.

La marca vive en tres lugares, y los tres son siempre visibles (nada depende
de pasar el mouse — la primera versión sí, y el resultado fue que la función
no se veía):
- Un sello verde en la esquina de la miniatura, para verlo de un vistazo
  recorriendo la galería.
- Una casilla en el pie, junto al nombre, que es el control para tildar y
  destildar.
- Una etiqueta "✓ Terminada" arriba a la izquierda del preview grande, para
  cuando se está mirando esa carta en particular y no la galería.

Los tres son HTML puesto encima, no parte del `Stage` de Konva — por eso no
aparecen en el PNG exportado, igual que el resto de la marca.

Marcar una carta como terminada la **bloquea para editar**: el panel de la
izquierda entero queda con `inert` — sin clics ni teclado, atenuado — y como
ahí sólo hay cosas de la carta abierta, alcanza con eso: la columna del mazo y
la barra de arriba siguen vivas. El drag/zoom de la imagen en el preview se
desactiva pasándole `onArtChange: undefined` a `CardStage` (así es como ya se
desactiva en las miniaturas de la galería). Arriba del panel aparece el aviso
con el botón **Desbloquear**, que es lo mismo que destildarla desde la
galería. Guardar y exportar siguen andando con la carta bloqueada — el
bloqueo es sólo para no tocar el contenido por error, no para impedir sacarle
el PNG.

Ojo con `inert`: React 19 trata `''` como `false` en atributos booleanos, así
que tiene que pasarse el booleano (`inert={card.done}`), no un string vacío.

Duplicar una carta terminada da una copia pendiente: se duplica para cambiar
algo.
