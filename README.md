# Dune: Imperium Card Generator

An app for building custom *Dune: Imperium* cards: upload an image, pick a
faction, cost, icons and rules text, and export the card ready to print (or a
full sheet with several cards).

**Try it online:** https://jacowaco.github.io/DuneImperiumCardGenerator/

## Running locally

```
npm install
npm run dev      # development server
npm run build    # typecheck + production build
```

`npm run assets` regenerates `src/assets/` from `psd-exports/` (needs Python +
Pillow) — only necessary when the PSD resources change.

## Documentation

The design decisions, the template measurements and how to verify changes are
in [`CLAUDE.md`](CLAUDE.md) (written in Spanish).

