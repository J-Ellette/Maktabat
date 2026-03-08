# Fonts

## KFGQPC Uthmanic Hafs Font

This font is required for proper Quranic text rendering.

Download from: <https://fonts.quran.gov.sa/en/fonts/hafs>

Place the file `KFGQPCUthmanicScriptHAFS.ttf` in this directory (`assets/fonts/`).

## Google Fonts

The following fonts are loaded from Google Fonts CDN in development:

- **Noto Naskh Arabic** — Arabic display text
- **Amiri** — Arabic display alternative
- **IBM Plex Arabic** — Arabic body text
- **Cormorant Garamond** — Latin display headings
- **Source Serif 4** — Latin body text
- **JetBrains Mono** — Monospace / code

For production offline use, download and bundle these fonts locally by placing
the `.ttf` / `.woff2` files here and updating the `@font-face` declarations in
`packages/renderer/src/styles/global.css`.
