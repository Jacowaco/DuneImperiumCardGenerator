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

## Disclaimer

This is a fan project, made by fans for fans and **not for profit**: it is free,
it carries no ads and nothing is charged for using it.

*Dune: Imperium*, its expansions, artwork, icons and graphic design are property
of **Dire Wolf Digital, LLC**. "Dune" and the universe of the novel belong to
**Herbert Properties LLC**. All trademarks and rights belong to their respective
owners. This project is **not affiliated with, sponsored by or endorsed by** Dire
Wolf Digital or the holders of the Dune trademark.

The graphic assets in `src/assets/` and `reference/` come from the published game
and are included for one reason only: without them the tool cannot reproduce the
card template. They are not original work of this project and are not offered for
redistribution or for any commercial use.

Cards built with this tool are meant for personal use — playing at home, trying
out ideas, sharing them with your group — and not for sale or commercial
production. If you enjoy the game, buy the original and support the people who
made it.

If you hold rights over any of this material and want something taken down, open
an issue in this repository and it will be sorted out.
