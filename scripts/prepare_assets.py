"""
Convierte los PNG crudos de `psd-exports/` en los assets que consume la app.

Uso:  npm run assets

Dos transformaciones:

1. CAPAS -> src/assets/layers/
   Se copian tal cual (750 x 1039 con transparencia), sólo se renombran a
   kebab-case. Excepción: las bandas de facción, que en el PSD están apiladas
   una debajo de la otra para mostrarlas todas juntas. En una carta real sólo
   se ve una, así que se alinean todas a la misma altura (FACTION_BAND_TOP).

2. ICONOS -> src/assets/icons/
   La hoja `Symbols.png` se rebana buscando huecos de filas y columnas, y cada
   icono se guarda recortado al contenido, porque se posicionan dinámicamente.
"""

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
    'Black Border.png': 'black-border.png',
    'Card Art Container.png': 'card-art-container.png',
    'Card Name Empty.png': 'card-name.png',
    'Starting Card Name Empty.png': 'card-name-starting.png',
    'Card Cost.png': 'card-cost.png',
    'Card Cost + Purchase Benefit.png': 'card-cost-benefit.png',
}

FACTION_LAYERS = {
    'Faction_Emperor.png': 'faction-emperor.png',
    'Faction_SpacingGuild.png': 'faction-spacing-guild.png',
    'Faction_BeneGesserit.png': 'faction-bene-gesserit.png',
    'Faction_Fremen.png': 'faction-fremen.png',
}

# En orden de lectura de la hoja: primero la fila suelta, después cada fila de
# izquierda a derecha. Nombres según el glosario del reglamento.
SYMBOLS = [
    'cost-arrow',
    'water', 'solari', 'spice', 'troop',
    'draw-card', 'draw-intrigue', 'trash', 'acquire-foldspace',
    'signet-ring', 'persuasion', 'sword',
    'influence-gain-one', 'influence-lose-one',
    'influence-gain-two', 'influence-lose-two',
]


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


def copy_layer(source, target):
    Image.open(SRC / source).convert('RGBA').save(LAYERS_OUT / target)
    print(f'  capa    {target}')


def align_faction_band(source, target):
    """Sube o baja la banda para que su borde superior quede en FACTION_BAND_TOP."""
    image = Image.open(SRC / source).convert('RGBA')
    top = alpha_mask(image).any(axis=1).argmax()
    shifted = Image.new('RGBA', image.size, (0, 0, 0, 0))
    shifted.paste(image, (0, FACTION_BAND_TOP - int(top)))
    shifted.save(LAYERS_OUT / target)
    print(f'  facción {target}  (movida {FACTION_BAND_TOP - int(top):+d} px)')


def slice_symbols(source):
    image = Image.open(SRC / source).convert('RGBA')
    mask = alpha_mask(image)

    boxes = []
    for top, bottom in runs(mask.any(axis=1), 12):
        band = mask[top:bottom + 1]
        for left, right in runs(band.any(axis=0), 2):
            ys = np.flatnonzero(band[:, left:right + 1].any(axis=1))
            boxes.append((left, top + int(ys[0]), right + 1, top + int(ys[-1]) + 1))

    if len(boxes) != len(SYMBOLS):
        print(
            f'\n! {source}: se detectaron {len(boxes)} símbolos pero SYMBOLS '
            f'tiene {len(SYMBOLS)} nombres. Revisá la lista en este script.',
            file=sys.stderr,
        )
        sys.exit(1)

    for name, box in zip(SYMBOLS, boxes):
        image.crop(box).save(ICONS_OUT / f'{name}.png')
        print(f'  icono   {name}.png  ({box[2] - box[0]}x{box[3] - box[1]})')


def main():
    LAYERS_OUT.mkdir(parents=True, exist_ok=True)
    ICONS_OUT.mkdir(parents=True, exist_ok=True)

    for source, target in LAYERS.items():
        copy_layer(source, target)
    for source, target in FACTION_LAYERS.items():
        align_faction_band(source, target)
    slice_symbols('Symbols.png')

    print('\nListo.')


if __name__ == '__main__':
    main()
