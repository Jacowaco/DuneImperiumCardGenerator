# Dune: Imperium Card Generator

App para armar cartas custom de *Dune: Imperium*: subís una imagen, elegís
facción, costo, iconos y texto de reglas, y exportás la carta lista para
imprimir (o una hoja completa con varias cartas).

**Probala online:** https://jacowaco.github.io/DuneImperiumCardGenerator/

## Correr en local

```
npm install
npm run dev      # servidor de desarrollo
npm run build    # typecheck + build de producción
```

`npm run assets` regenera `src/assets/` desde `psd-exports/` (necesita Python
+ Pillow) — sólo hace falta si se tocan los recursos del PSD.

## Documentación

Las decisiones de diseño, las medidas del template y cómo verificar cambios
están en [`CLAUDE.md`](CLAUDE.md).
