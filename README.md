# SheetMetal

**Status**: Active MVP (Browser-native BAML execution)
**Current Version**: 0.3 (Theme Support, New Layout, File UX)

## Philosophy
"BAML in the Sheets, LLM in the Streets."
- Zero build steps.
- Zero dependencies (except vendored WASM).
- Progressive Minimalism.

## Architecture
- `public/index.html`: 3-pane layout (Files | Editor | Output).
- `public/main.js`: Core logic (UI, VFS, Settings, BAML Bridge).
- `public/vendor/baml/`: Versioned BAML WASM runtime.

## Roadmap
- [x] MVP UI (Settings toggle, File list, Editor, Output)
- [x] OpenRouter Integration
- [x] Dark Mode / System Theme
- [x] File Management (Inline create, Rename)
- [ ] Google Sheets Integration (UI skeleton exists, logic pending)
- [ ] Dynamic test input parsing (currently regex-based discovery, fallback inputs)

## Development
Clone repo. Serve root with any static server (e.g. `python3 -m http.server`).
Navigate to `/public`.

## License
MIT
