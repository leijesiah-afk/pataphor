# Pataphor - agent guide

A minimalist music journaling app. Built with Vite, React 18, and TypeScript.

## Commands (run from `C:\pataphor`)

```powershell
# Dev server (Vite, port 3000, open=false)
npm run dev

# Build for production (tsc + Vite)
npm run build

# Preview production build
npm run preview
```

## Architecture

- **Entry point**: `src/main.tsx` renders `src/App.tsx` into `#root` in `index.html`
- **State management**: React `useState` + `useEffect`; journal state persisted to `localStorage` key `pataphor_journal_state_v1` (`src/App.tsx:27-57`)
- **Navigation**: 4-step wizard - Landing - Search - Cover - Journal (`src/App.tsx:21`, `src/components/NavigationHeader.tsx`)
- **Styles**: Global CSS variables in `src/index.css`; component-scoped classes; no CSS-in-JS

### Key directories

| Directory | Purpose |
|---|---|
| `src/components/` | Page components: Landing, Search, Cover, Journal, Navigation, AudioPlayer, Logo |
| `src/services/` | `itunesApi.ts` - search + iTunes API + `prepareSongForJournal`; `exportJournal.ts` - png rendering via html2canvas/html-to-image; `imageConverter.ts` - CORS-safe blob->dataURL |
| `src/types/` | `Song` interface, `PageStep` type, `JournalState` interface |
| `src/App.tsx` | Main component with step logic, localStorage sync, FEATURED_SAMPLE_SONGS |
| `src/index.html` | HTML entry; title "Pataphor - Music Journal" |

## Data flow

1. **Landing** - user clicks "Begin Journal" -> `setCurrentStep("search")`
2. **Search** - user searches combined Deezer and iTunes catalogs (debounced 380ms); results are deduplicated and sample songs are used only if both providers fail (`src/services/itunesApi.ts`)
3. **Cover** - user selects song; `selectedSong` passed down; `onOpenJournal` -> `setCurrentStep("journal")`
4. **Journal** - user writes entry, chooses font (Caveat/Homemade Apple/Playpen) and date format; `handleDownloadImage` -> `renderJournalToPng` -> `downloadDataUrl` (`src/services/exportJournal.ts:13-82`)

## Constraints / Gotchas

- **CORS**: Artwork fetched from iTunes may be tainted; `imageConverter.ts` attempts blob->dataURL with `crossOrigin: "anonymous"` fallback, then returns original URL if all fails (`src/services/imageConverter.ts:5-61`)
- **png export**: `src/services/exportJournal.ts:33-61` uses `html2canvas` first, falls back to `html-to-image`; both require `document.fonts.ready` and CORS-clean artwork
- **localStorage**: `STORAGE_KEY = "pataphor_journal_state_v1"` (`src/App.tsx:10`); catch errors silently (`try / console.warn`)
- **Fonts**: Five journal fonts - Caveat (default), Homemade Apple, Playpen Sans, Times New Roman, and Helvetica; defined as CSS `font-family` in `src/index.css` and per-component `style` props
- **Audio preview**: 30s iTunes preview; `AudioPlayer` component manages single audio element ref; playback stops when song changes (`src/components/AudioPlayer.tsx`)
- **No test framework configured** - no `.test.*` or `.spec.*` files present

## Adding a new page step

1. Add a case to `PageStep` in `src/types/index.ts:12`
2. Add a conditional block in `src/App.tsx` render return (`src/App.tsx:83-113`)
3. Add `onNavigate` handler for the new step
4. Add breadcrumb in `src/components/NavigationHeader.tsx:50-76`
5. Wire up in `src/App.tsx` switch/if chain
