# DockTerm Roadmap

Dates are intentionally omitted — this is a young, community-paced project. Items
move up only when they're real.

## Shipped — V1

- Terminal-first workspace: main terminal + toggleable mini terminal
- Project open / reopen / recent, git detection, initialize-git
- File tree with git badges and trash-safe CRUD
- Monaco editor: tabs, dirty state, save-with-conflict-guard, binary/huge block
- Beginner-safe Git panel: status, stage/unstage/discard, commit, push/pull with
  publish-branch flow, branches, danger confirmations (`--force-with-lease` only)
- Review panel: diff baselines (last commit / session / checkpoint), Monaco diff
- Checkpoints
- MCP panel (parse-only, secrets masked) and Skills panel (with templates)
- Command palette and platform-adaptive shortcuts
- Settings (live-applied), three accent themes
- Cross-platform installers via CI (Windows `.exe`, macOS `.dmg`, Linux AppImage)

## Near-term — V1.x

- Persist panel sizes and the open panel across restarts
- Terminal search bar UI and OSC-8 link polish
- Branch ahead/behind detail and a richer "what changed" stats header
- Reload-from-disk option on the editor's external-change conflict
- Signed/notarized macOS builds; signed Windows builds
- A real e2e suite in CI and a broader unit-test net

## Later — V2 ideas (all clearly future)

- **MCP**: live tool/resource lists, per-server health checks (explicit, opt-in),
  per-project MCP profiles, an add-server flow
- **Skills**: richer skill/command authoring, plugin-provided skill discovery
- Multiple project windows
- A Linux-first pass (currently best-effort)
- Optional, local-only "what changed" summaries (no AI API — local commands only)

## Non-goals (still, and on purpose)

AI chat or any AI API calls, LSP/intellisense, an extension marketplace, terminal
tabs/splits/SSH, accounts, telemetry, or cloud sync. If a proposal needs one of
these, it belongs in a different project.
