# SheetMetal Architecture

SheetMetal follows a "Progressive Minimalism" architecture. It uses native ES modules with no build step.

## Folder Structure

- **`core/`**: Business logic and state management.
  - `state.js`: Central state store (Pub/Sub), settings, and VFS.
  - `runtime.js`: WASM execution environment and BAML runtime integration.
- **`ui/`**: Presentation layer.
  - `events.js`: Main UI orchestrator (UIManager). Binds events and renders views.
  - `layout.js`: CSS Grid layout management (resizing).
  - `dom.js`: Low-level DOM helpers (get, on, create).
- **`lib/`**: Shared utilities.
  - `utils.js`: Toast notifications, debounce, etc.
- **`vendor/`**: Third-party dependencies (WASM, etc.).

## Dependency Flow

`main.js` (Bootstrap) -> `core/*` + `ui/*`
`ui/*` -> `core/*` (State/Runtime) + `lib/*`
`core/*` -> `lib/*`

Dependencies should flow "inwards" towards core or "downwards" towards lib. UI modules should not depend on each other circularly.
