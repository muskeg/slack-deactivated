# Slack Deactivated Avatar Generator

Generate Slack-style "deactivated account" profile pictures.

Upload any image, preview it with the deactivated overlay, optionally convert to grayscale, and download a 512x512 PNG. All processing happens in your browser — no data is uploaded.

## Architecture

- [index.html](index.html) provides the basic layout: drop zone, preview canvas, and controls.
- [src/main.ts](src/main.ts) wires up drag-and-drop, keyboard interaction, pointer dragging, zooming, and download.
- [src/canvas.ts](src/canvas.ts) handles drawing the avatar, overlay, and clamping the image position and scale.
- [src/style.css](src/style.css) contains the UI styling and accessibility focus states.
- The overlay image lives in [public/deactivated.png](public/deactivated.png) and is loaded at runtime.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Output goes to `dist/`. Deployed automatically to GitHub Pages on push to `main`.

GitHub Pages URL: https://<your-username>.github.io/slack-deactivated/
