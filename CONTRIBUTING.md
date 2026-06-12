# Contributing to DockTerm

Thanks for your interest! DockTerm is an early, terminal-first workspace for Claude Code. Issues and PRs are welcome.

## Project principles

Before proposing a feature, know what DockTerm intentionally is **not**:

- Not an IDE — no LSP/intellisense, no extension marketplace, no debugger.
- Not an AI client — DockTerm never calls an AI API; Claude Code is the AI.
- No telemetry, accounts, cloud sync, or stored tokens.
- The terminal is the hero; panels are on-demand and one-at-a-time.

Changes that pull DockTerm toward "another IDE" will likely be declined. Changes that make the terminal-first workflow calmer and safer are very welcome.

## Development setup

Requires **Node 20+** and **git**. On most platforms `node-pty` installs from a prebuilt binary, so no compiler is needed. If your platform/arch has no prebuild, you'll need a C++ toolchain (Visual Studio Build Tools with the "Desktop development with C++" workload on Windows; Xcode Command Line Tools on macOS).

```bash
git clone https://github.com/munvard/dockterm
cd dockterm
npm install

npm run dev          # launch with hot reload
npm run typecheck    # strict tsc --noEmit (main + renderer)
npm test             # Vitest unit tests
npm run build        # production bundles
npm run package      # build an installer for your current OS
```

> Behind a TLS-intercepting proxy and seeing `UNABLE_TO_VERIFY_LEAF_SIGNATURE` during install? Point Node at your system trust store: set `NODE_EXTRA_CA_CERTS` to a PEM of your corporate root CA (or run Node with `--use-system-ca`).

## Architecture, briefly

```
src/
  shared/      types.ts · ipc.ts (the renderer↔main contract) · result.ts · constants.ts
  main/        Electron main process — all capability lives here
    window.ts · protocol.ts (app://) · security.ts
    ipc/       register.ts (zod-validated verb channels) · handlers/*
    services/  pty · fs (+ pathJail) · git (+ gitInvoke) · watcher · config · claude · skills · info
  preload/     a frozen, allowlisted window.dockterm bridge (no Node objects cross)
  renderer/    React UI only — zustand stores, components, styles
```

Rules of the road:

- **All capability is in the main process.** The renderer talks only through `window.dockterm.invoke(...)` / `.on(...)`.
- **Add IPC as explicit verbs.** New channel → add it to `src/shared/ipc.ts` (type + runtime allowlist), write a handler with a zod schema in `src/main/ipc/handlers/`, register it.
- **Filesystem access is jailed** to the open project via `pathJail`. Don't bypass it.
- **Every `git` call goes through `gitInvoke`** (which sets `core.hooksPath=`). Don't call `simpleGit` directly elsewhere.
- **Never log or return secrets.** MCP/skills config is masked by `secretMask`.

## Pull requests

1. Branch from `main`.
2. Keep PRs focused; match the surrounding code's style (Prettier-ish, 2-space, single quotes, no semicolons-omitted-debates — just run `npm run typecheck`).
3. `npm run typecheck && npm test && npm run build` must pass.
4. Add or update unit tests for logic in `tests/unit` (path jail, parsers, mappers, validators).
5. Describe the change and, for UI, include a screenshot.

## Reporting bugs

Open an issue with your OS, DockTerm version, steps to reproduce, and (if relevant) the terminal output. For security issues, see [SECURITY.md](SECURITY.md) instead.
