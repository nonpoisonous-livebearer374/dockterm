# DockTerm Architecture

DockTerm is an Electron app with three strictly separated layers. **All
capability lives in the main process**; the renderer is a pure React UI that can
only reach the system through a narrow, validated bridge.

```
┌──────────────────────────── main process ─────────────────────────────┐
│ window.ts (hardened BrowserWindow)  protocol.ts (app://)  security.ts   │
│ ipc/register.ts ── zod validate ── sender check ── route to handler     │
│   handlers: app · pty · settings · project · fs · git · review · claude │
│   services:                                                             │
│     ptyService (+ ptyFlow, shellDetect)   fileService (+ pathJail)      │
│     gitService (+ gitInvoke, gitStatusMap, checkpointService)           │
│     watcherService   configStore/settingsService                        │
│     claudeConfigService · skillsService (+ secretMask) · projectInfo    │
└───────────────┬────────────────────────────────────────────────────────┘
                │ contextBridge: frozen window.dockterm (invoke + on)
┌───────────────┴───────────────────── renderer (sandboxed) ─────────────┐
│ zustand stores: app · editor · git · review · claude · toast · dialog   │
│ TopBar · CommandPalette · Dock(Files/Git/Review/MCP/Skills/Info/Settings)│
│ Terminal (xterm, never unmounts) · Editor (Monaco) · DiffView · Mini    │
└─────────────────────────────────────────────────────────────────────────┘
PTY child: the user's shell (pwsh/powershell | $SHELL -l), cwd = project root
```

## Process model

- **Single window**, single instance (`requestSingleInstanceLock`).
- **Main**: owns the PTYs, filesystem, git, watcher, config, and the read-only
  Claude-config parsers. No business logic in the renderer.
- **Preload**: builds `window.dockterm` from the shared channel allowlists. It
  forwards `ipcRenderer.invoke`/`on` only for known channels; no Node objects
  cross the bridge.
- **Renderer**: React + zustand. Talks to main exclusively via `window.dockterm`.

## The IPC contract

`src/shared/ipc.ts` is the single source of truth. Channels are modeled as
function types so request/response types can be extracted (`ReqOf`/`ResOf`), and
mirrored in runtime allowlists. Each channel is an **explicit verb** — there is
no generic dispatcher. Every handler runs: sender check → zod validation → handler
→ a typed `Result<T>` (`{ ok, value } | { ok:false, error:{ code, message } }`).
The renderer never sees a thrown exception or a raw stack.

## Terminal data flow

`pty.onData` → batched (≤8 ms / 32 KB) → `pty:data` event → `xterm.write(data, ack)`
→ `pty:ack`. Unacknowledged bytes drive watermark flow control (pause at 128 KB,
resume at 32 KB) so Claude Code's multi-MB output never overruns xterm. Resize:
`ResizeObserver` → `FitAddon` → `pty:resize`. The terminal component never
unmounts while a project is open — panels resize it, they don't replace it.

## The "what changed" flow

The chokidar watcher (ignore list, `followSymlinks:false`) batches filesystem
events (300 ms) → `fs:watch`. The renderer debounces a `git:status` refresh
(400–500 ms) → the top-bar dirty chip, tree badges, and Review list update. The
Review panel diffs the working tree against the last commit, this session
(watcher-tracked), or a saved checkpoint commit.

## Key technology choices

Electron + electron-vite + electron-builder · React 19 + TypeScript (strict) ·
xterm.js + node-pty (prebuilt N-API binaries — no native rebuild) · Monaco
(bundled locally, including the diff editor) · simple-git · chokidar · zustand ·
zod · cmdk. See `docs/decisions/` for the decision records behind each.
