# CMS NCD Browser Demo

Standalone Bun dashboard demo for exploring CMS National Coverage Determinations, Local Coverage Determinations, and associated billing articles through a hand-curated disease metamodel.

Current bundled prototype:
- `obstructive-sleep-apnea`

Commands:

```bash
bun run build
bun run preview
```

Then open `http://localhost:3001`.

What lives here:
- `data/`: self-contained metamodel JSON, including typed treatment comparisons, LCD layering, MAC variation, and timeline data
- `src/`: browser viewer code
- `public/`: static shell, styles, and built browser bundle
- `server.ts`: tiny Bun static preview server for local verification
- `.github/workflows/build.yml`: CI build plus GitHub Pages deployment
