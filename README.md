# Hidden World

Single-page marketing site for **Hidden World** — a collaborative night-photography project
documenting the unseen life of nature at night, revealed under ultraviolet light (365 nm / 395 nm).

> "We don't only photograph the night sky — we capture the hidden world beneath it."

## Stack

Plain static site — no framework, no build step. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8777
```

```
index.html    semantic sections + inline SVG icon sprite
styles.css    design tokens -> components -> sections -> responsive -> reduced motion
script.js     star field, scroll reveal, smooth anchors, sticky nav, image fallback
assets/       photographs (JPEG)
```

The only external dependency is Google Fonts (Zilla Slab, Inter).

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#0A0E2A` | page background |
| `--navy2` / `--card` | `#141A3D` / `#1B2350` | surfaces |
| `--glow` | `#2AF5C0` | primary accent (fluorescence) |
| `--violet` | `#8B6FE8` | UV accent |
| `--ice` / `--mute` | `#CFE0FF` / `#8C9ACB` | body text / secondary text |

Headings use Century Schoolbook (Zilla Slab fallback); body uses Calibri (Inter fallback).

## Accessibility

- Semantic landmarks, alt text on every image, visible focus states.
- All text pairings meet WCAG AA contrast on the navy background.
- Animation is disabled under `prefers-reduced-motion`; the page is fully readable with JavaScript off.

## Credits

Photography by Ali MatinFar (Iran) and Amir (Canada).
