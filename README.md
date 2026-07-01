# Field Motion Lab

Vite React + TypeScript animation prototype for checking premium residential-style motion patterns:
intro overlay, hero fade, Swiper visual slider, BLANZ-style scroll expansion, scroll story parallax, gallery cards, and fixed CTA.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

The project already includes optimized WebP assets under `public/assets/site-images/`.
Original local image folders are not required to run this project on another computer.

## Setup

```bash
git clone https://github.com/cozyai1997/TESTPAGE.git
cd TESTPAGE
npm install
npm run dev
```

On Windows PowerShell, if script execution blocks `npm`, use:

```powershell
npm.cmd install
npm.cmd run dev
```

Then open the local URL printed by Vite, usually `http://localhost:5173/`.

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- `crawl-output/`, `dist/`, and `node_modules/` are intentionally ignored.
- Run `npm run build` before handing off major animation changes.
- The BLANZ expansion section is in `src/App.tsx` and its motion styling is in `src/styles.css`.
