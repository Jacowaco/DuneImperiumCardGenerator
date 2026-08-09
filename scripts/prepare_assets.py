"""
Convierte los PNG crudos de `psd-exports/` en los assets que consume la app.

Uso:  npm run assets

Tres transformaciones:

1. CAPAS -> src/assets/layers/
   Se copian tal cual (750 x 1039 con transparencia), sólo se renombran a
   kebab-case. Excepción: las bandas de facción, que en el PSD están apiladas
   una debajo de la otra para mostrarlas todas juntas. En una carta real sólo
   se ve una, así que se alinean todas a la misma altura (FACTION_BAND_TOP).

2. HOJAS DE ICONOS -> src/assets/icons/
   Se rebanan buscando huecos de filas y columnas, y cada icono se guarda
   recortado al contenido, porque se posicionan dinámicamente.

3. ROMBOS DE INFLUENCIA -> src/assets/icons/influence/
   Se generan componiendo: rombo vacío + emblema de la facción. Con 4 rombos
   y 4 emblemas salen las 16 combinaciones, y si cambia el arte se regeneran
   todas de una.
"""

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'psd-exports'
LAYERS_OUT = ROOT / 'src' / 'assets' / 'layers'
ICONS_OUT = ROOT / 'src' / 'assets' / 'icons'

# Ranura donde va la banda de facción, justo debajo de la banda del nombre.
FACTION_BAND_TOP = 90

# origen -> destino. Los archivos con texto de ejemplo quemado ("Card Name.png",
# "Starting Card Name.png") quedan en psd-exports sólo como referencia: el texto
# lo dibuja la app.
LAYERS = {
    'Black Background.png': 'background.png',
    'Black Border.png': 'black-border.png',
    'Card Art Container.png': 'card-art-container.png',
    'Card Name Empty.png': 'card-name.png',
    'Starting Card Name Empty.png': 'card-name-starting.png',
    'Card Cost.png': 'card-cost.png',
    'Card Cost + Purchase Benefit.png': 'card-cost-benefit.png',
    'agent icon.png': 'agent-icon.png',
    'play1.png': 'play-box-1.png',
    'play2.png': 'play-box-2.png',
    'play3.png': 'play-box-3.png',
    'reveal.png': 'reveal-box.png',
    'unload.png': 'unload.png',
}

FACTION_LAYERS = {
    'Faction_Emperor.png': 'faction-emperor.png',
    'Faction_SpacingGuild.png': 'faction-spacing-guild.png',
    'Faction_BeneGesserit.png': 'faction-bene-gesserit.png',
    'Faction_Fremen.png': 'faction-fremen.png',
}

# Plantillas en blanco de la banda de facción, una por posición en la pila
# (1 = arriba y más ancha, 4 = abajo y más angosta). El código las tiñe con el
# color de cada facción y les dibuja el nombre encima: qué facción cae en qué
# posición depende de qué combinación eligió el usuario, así que no puede venir
# resuelto de antemano en un PNG por facción como antes.
FACTION_BAND_LAYERS = {
    'Faction Band 1.png': 'faction-band-1.png',
    'Faction Band 2.png': 'faction-band-2.png',
    'Faction Band 3.png': 'faction-band-3.png',
    'Faction Band 4.png': 'faction-band-4.png',
}

# Mismos cuatro colores que FACTION_COLORS en src/model/card.ts. Duplicado a
# mano porque el script no puede importar TypeScript; si cambia uno, cambian
# los dos.
FACTION_COLORS = {
    'emperor': (0x63, 0x63, 0x63),
    'spacing-guild': (0xCD, 0x3A, 0x3D),
    'bene-gesserit': (0x77, 0x58, 0x8B),
    'fremen': (0x6A, 0x81, 0xB9),
}

# Los siete iconos de agente, apilados en columna en el PSD.
AGENT_ICONS = [
    'emperor', 'spacing-guild', 'bene-gesserit', 'fremen',
    'landsraad', 'city', 'spice-trade',
]

# Hojas con los iconos de agente en columna. Cada estilo va a su carpeta.
COLUMN_SHEETS = {
    'location symbols.png': ('locations', None),
    'infiltrate symbols.png': ('infiltrate', None),
    # El emblema sobre su placa negra, sin el marco crema de `locations`. No va
    # en la carta: es para los botones del panel, donde el fondo negro despega
    # al emblema del color que tenga atrás.
    'simbolos con fondo.png': ('badges', None),
    # Esta hoja tiene los emblemas sueltos arriba a la izquierda y las filas de
    # símbolos abajo y a la derecha, con las dos zonas solapadas en x y en y.
    # Por eso hay que acotar con un rectángulo.
    'simbolos sin fondo.png': ('emblems', (0, 0, 130, 700)),
}

# En orden de lectura: fila por fila, de izquierda a derecha.
SYMBOLS = [
    'cost-arrow', 'victory-point',
    'water', 'solari', 'spice', 'troop',
    'draw-card', 'draw-intrigue', 'trash', 'acquire-foldspace',
    'signet-ring', 'persuasion', 'sword',
    'influence-gain-one', 'influence-lose-one',
    'influence-gain-two', 'influence-lose-two',
]

# De la hoja con los rombos vacíos sólo se guardan los rombos: el resto de los
# símbolos ya viene de `symbols corrected.png`. Por eso se acota a la última
# fila y los tres primeros de esa fila se descartan.
BLANK_ROW = (0, 850, 750, 1039)
BLANK_SYMBOLS = [
    '_signet-ring', '_persuasion', '_sword',
    'blank-gain-one', 'blank-lose-one',
    'blank-gain-two', 'blank-lose-two',
]

# Iconos de Rise of Ix e Immortality, en orden de lectura de la hoja. Los
# nombres salen del glosario de cada reglamento (`reference/*.pdf`).
EXPANSION_SYMBOLS = [
    'research', 'combat',
    'tleilaxu', 'genetic-marker-two', 'genetic-marker-one', 'specimen',
    'trash-intrigue',
    'discard-card', 'freighter', 'unit', 'acquire-tech',
    'acquire-tech-discount-one',
]

INFLUENCE_VARIANTS = ['gain-one', 'lose-one', 'gain-two', 'lose-two']
INFLUENCE_FACTIONS = ['emperor', 'spacing-guild', 'bene-gesserit', 'fremen']

# Qué porción del ancho del rombo ocupa el emblema.
EMBLEM_FILL = 0.58


def runs(mask, min_gap):
    """Rangos contiguos de True, uniendo los separados por menos de min_gap."""
    idx = np.flatnonzero(mask)
    if not len(idx):
        return []
    out = [[int(idx[0]), int(idx[0])]]
    for i in idx[1:]:
        if i - out[-1][1] <= min_gap:
            out[-1][1] = int(i)
        else:
            out.append([int(i), int(i)])
    return out


def alpha_mask(image):
    return np.array(image.getchannel('A')) > 8


def load_sheet(source, region=None):
    """
    Abre una hoja y opcionalmente la acota a un rectángulo (x0, y0, x1, y1).

    Hace falta acotar porque algunas hojas mezclan una columna de iconos a la
    izquierda con filas de símbolos a la derecha, y ninguna de las dos se puede
    aislar con un corte de un solo eje.
    """
    image = Image.open(SRC / source).convert('RGBA')
    if region:
        image = image.crop(region)
    return image, alpha_mask(image)


def fail(message):
    print(f'\n! {message}', file=sys.stderr)
    sys.exit(1)


def copy_layer(source, target):
    Image.open(SRC / source).convert('RGBA').save(LAYERS_OUT / target)
    print(f'  capa     {target}')


def align_faction_band(source, target):
    """Sube o baja la banda para que su borde superior quede en FACTION_BAND_TOP."""
    image = Image.open(SRC / source).convert('RGBA')
    top = int(alpha_mask(image).any(axis=1).argmax())
    shifted = Image.new('RGBA', image.size, (0, 0, 0, 0))
    shifted.paste(image, (0, FACTION_BAND_TOP - top))
    shifted.save(LAYERS_OUT / target)
    print(f'  facción  {target}  (movida {FACTION_BAND_TOP - top:+d} px)')


def slice_rows_and_columns(source, names, out_dir, region=None):
    """Rebana una hoja con los iconos en filas. Los nombres con '_' se saltean."""
    image, mask = load_sheet(source, region)

    boxes = []
    for top, bottom in runs(mask.any(axis=1), 12):
        band = mask[top:bottom + 1]
        for left, right in runs(band.any(axis=0), 2):
            ys = np.flatnonzero(band[:, left:right + 1].any(axis=1))
            boxes.append((left, top + int(ys[0]), right + 1, top + int(ys[-1]) + 1))

    if len(boxes) != len(names):
        fail(f'{source}: se detectaron {len(boxes)} iconos pero la lista tiene {len(names)}.')

    out_dir.mkdir(parents=True, exist_ok=True)
    saved = 0
    for name, box in zip(names, boxes):
        if name.startswith('_'):
            continue
        image.crop(box).save(out_dir / f'{name}.png')
        saved += 1
    print(f'  iconos   {out_dir.name}/: {saved} de {source}')


def slice_column(source, folder, region=None):
    """
    Rebana una hoja con iconos apilados en columna. Se corta en cualquier fila
    vacía: los iconos son sólidos, así que no hay huecos internos.

    Todos se recortan con el mismo rango horizontal para que compartan el
    origen izquierdo y la app pueda dibujarlos en una sola x.
    """
    image, mask = load_sheet(source, region)
    bands = runs(mask.any(axis=1), 1)

    if len(bands) != len(AGENT_ICONS):
        fail(f'{source}: se detectaron {len(bands)} iconos pero AGENT_ICONS tiene '
             f'{len(AGENT_ICONS)}.')

    columns = np.flatnonzero(mask.any(axis=0))
    left, right = int(columns[0]), int(columns[-1]) + 1

    out = ICONS_OUT / folder
    out.mkdir(parents=True, exist_ok=True)
    for name, (top, bottom) in zip(AGENT_ICONS, bands):
        image.crop((left, top, right, bottom + 1)).save(out / f'{name}.png')

    pitch = (bands[-1][0] - bands[0][0]) / (len(bands) - 1)
    offset_x, offset_y = (region[0], region[1]) if region else (0, 0)
    print(f'  columna  {folder}/: {len(bands)} iconos, x={left + offset_x}, '
          f'tope y={bands[0][0] + offset_y}, paso {pitch:.1f} px')


def emblem_slot(variant):
    """
    Dónde va el emblema dentro del rombo, y de qué tamaño.

    La posición sale de comparar el rombo con "?" contra el vacío: la
    diferencia entre los dos **es** el "?", o sea el hueco que el diseñador
    dejó para el símbolo.

    No sirve calcularlo por geometría, porque el "?" no está en el centro del
    rombo: en las variantes de ganar el chevrón tapa el vértice de arriba y lo
    corre para abajo, y en las de perder pasa al revés. Un centro geométrico
    cae en el medio de los dos casos y queda mal en ambos.

    El ancho sí sale de la geometría: el rombo son los píxeles sin saturación
    (los chevrones son dorados o rojos).
    """
    with_mark = Image.open(ICONS_OUT / f'influence-{variant}.png').convert('RGBA')
    blank = Image.open(ICONS_OUT / 'blanks' / f'blank-{variant}.png').convert('RGBA')

    if with_mark.size != blank.size:
        fail(f'influence-{variant} y blank-{variant} miden distinto '
             f'({with_mark.size} vs {blank.size}); no se pueden comparar.')

    difference = np.abs(np.array(with_mark).astype(int) - np.array(blank).astype(int))
    mark = difference.sum(axis=2) > 25
    rows = np.flatnonzero(mark.any(axis=1))
    columns = np.flatnonzero(mark.any(axis=0))

    pixels = np.array(blank).astype(int)
    rgb = pixels[..., :3]
    body = ((rgb.max(axis=2) - rgb.min(axis=2)) < 30) & (pixels[..., 3] > 200)
    body_columns = np.flatnonzero(body.any(axis=0))

    return (
        (int(columns[0]) + int(columns[-1])) / 2,
        (int(rows[0]) + int(rows[-1])) / 2,
        int(body_columns[-1]) - int(body_columns[0]) + 1,
    )


def compose_influence():
    """Rombo vacío + emblema de facción, para las 16 combinaciones."""
    out = ICONS_OUT / 'influence'
    out.mkdir(parents=True, exist_ok=True)

    for variant in INFLUENCE_VARIANTS:
        base = Image.open(ICONS_OUT / 'blanks' / f'blank-{variant}.png').convert('RGBA')
        cx, cy, width = emblem_slot(variant)

        for faction in INFLUENCE_FACTIONS:
            emblem = Image.open(ICONS_OUT / 'emblems' / f'{faction}.png').convert('RGBA')
            target = width * EMBLEM_FILL
            scale = min(target / emblem.width, target / emblem.height)
            emblem = emblem.resize(
                (max(1, round(emblem.width * scale)), max(1, round(emblem.height * scale))),
                Image.LANCZOS,
            )

            composed = base.copy()
            composed.alpha_composite(
                emblem,
                (round(cx - emblem.width / 2), round(cy - emblem.height / 2)),
            )
            composed.save(out / f'{faction}-{variant}.png')

    print(f'  compuesto influence/: {len(INFLUENCE_FACTIONS) * len(INFLUENCE_VARIANTS)} rombos')


def compose_faction_bands():
    """
    Tiñe cada plantilla en blanco con cada uno de los cuatro colores de
    facción, para las 16 combinaciones posición × facción.

    La plantilla es la banda en gris: el canal de color es la sombra (más clara
    a la izquierda, degradando hacia la derecha) y el alpha es la silueta. Para
    teñirla, cada fila se normaliza contra su propio píxel más claro —el del
    borde izquierdo, que es donde la banda real muestra el color puro— y esa
    proporción multiplica el color de la facción hacia el negro. Así la sombra
    de la plantilla queda igual sea cual sea el color que reciba.
    """
    out = LAYERS_OUT / 'faction-bands'
    out.mkdir(parents=True, exist_ok=True)

    count = 0
    for source, target in FACTION_BAND_LAYERS.items():
        template = Image.open(SRC / source).convert('RGBA')
        raw = np.array(template)
        top = int(alpha_mask(template).any(axis=1).argmax())
        shifted = np.zeros_like(raw)
        shift = FACTION_BAND_TOP - top
        if shift >= 0:
            shifted[shift:, :] = raw[: raw.shape[0] - shift, :]
        else:
            shifted[: raw.shape[0] + shift, :] = raw[-shift:, :]

        arr = shifted.astype(float)
        gray = arr[..., 0]  # el PNG es gris puro: los tres canales son iguales
        alpha = arr[..., 3]

        opaque = alpha > 8
        left_edge = np.full(gray.shape[0], np.nan)
        for y in range(gray.shape[0]):
            xs = np.flatnonzero(opaque[y])
            if len(xs):
                left_edge[y] = gray[y, xs[0]]

        rows_with_band = ~np.isnan(left_edge)
        ratio = np.zeros_like(gray)
        ratio[rows_with_band] = gray[rows_with_band] / left_edge[rows_with_band, None]
        ratio = np.clip(ratio, 0, 1)

        rank = target.removeprefix('faction-band-').removesuffix('.png')
        for faction, color in FACTION_COLORS.items():
            tinted = np.zeros_like(arr)
            for channel in range(3):
                tinted[..., channel] = ratio * color[channel]
            tinted[..., 3] = alpha
            Image.fromarray(tinted.astype(np.uint8), 'RGBA').save(
                out / f'{faction}-{rank}.png'
            )
            count += 1

    print(f'  compuesto faction-bands/: {count} bandas')


def write_icon_sizes():
    """
    Deja el tamaño natural de cada icono en un JSON.

    La app arma las filas de iconos midiendo antes de dibujar, y si tuviera que
    esperar a que cada PNG cargue para saber cuánto mide, el layout saltaría en
    pantalla. Con esto el cálculo es sincrónico.
    """
    sizes = {}
    for path in sorted(ICONS_OUT.glob('*.png')):
        sizes[path.stem] = Image.open(path).size
    for path in sorted((ICONS_OUT / 'influence').glob('*.png')):
        sizes[f'influence-{path.stem}'] = Image.open(path).size

    target = ICONS_OUT / 'sizes.json'
    target.write_text(json.dumps(dict(sorted(sizes.items())), indent=2), encoding='utf-8')
    print(f'  medidas  {target.name}: {len(sizes)} iconos')


def main():
    LAYERS_OUT.mkdir(parents=True, exist_ok=True)
    ICONS_OUT.mkdir(parents=True, exist_ok=True)

    for source, target in LAYERS.items():
        copy_layer(source, target)
    for source, target in FACTION_LAYERS.items():
        align_faction_band(source, target)

    slice_rows_and_columns('symbols corrected.png', SYMBOLS, ICONS_OUT)
    slice_rows_and_columns('expansion icons.png', EXPANSION_SYMBOLS, ICONS_OUT)
    slice_rows_and_columns(
        'simbolos sin fondo.png', BLANK_SYMBOLS, ICONS_OUT / 'blanks', region=BLANK_ROW
    )
    for source, (folder, region) in COLUMN_SHEETS.items():
        slice_column(source, folder, region)

    compose_influence()
    compose_faction_bands()
    write_icon_sizes()

    print('\nListo.')


if __name__ == '__main__':
    main()
