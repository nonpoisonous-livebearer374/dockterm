# DockTerm Product Plan

## Positioning

**DockTerm is the terminal workspace Claude Code always assumed you had.** You run
`claude` in a real terminal that stays the hero; DockTerm watches the project and
Git, lights up what changed, lets you review diffs and commit safely, and shows
your MCP servers and skills honestly (masked, parse-only). It is not an IDE and
never calls an AI API. Privacy is structural: no telemetry, no accounts, no
cloud — *not opt-out, just absent.*

The pain it solves: while Claude works, your state is scattered across a terminal,
an editor you opened "just to look", a Git client, and a browser. DockTerm
collapses that into one calm window without becoming an IDE.

## Anti-bloat rules (what keeps it from becoming an IDE)

1. The terminal never unmounts and is never visually subordinate.
2. One dock panel at a time.
3. No LSP/intellisense, no extension marketplace, no AI chat, no AI API calls.
4. No terminal tabs/splits/profiles/SSH — iTerm/Warp/Ghostty own that.
5. Nothing executes without being visible or confirmed.
6. Any feature that needs a server doesn't ship.

## V1 scope (shipped)

Project open/reopen + empty state + git detection (+ confirmed `git init`); main
terminal (Claude Code TUI-proof) + mini terminal; file tree (ignores, git badges,
CRUD with trash + confirm); Monaco editor (tabs, dirty dots, save with mtime
conflict guard, binary/huge block); Git panel (grouped status, stage/unstage/
discard, commit, push/pull with publish flow, branches, beginner mode, danger
matrix); Review panel (baselines: last commit / session / checkpoint; Monaco
diff; stage/commit from review); checkpoints; top-bar status chip; MCP panel
(parse-only tiers + masking + template); Skills panel (project default, user
opt-in, create-from-template); command palette; settings; platform-true
shortcuts.

## Explicitly out (V1)

AI anything, LSP, terminal tabs/splits/SSH, conflict-resolution UI, hard
reset / bare force-push / unmerged-branch delete, MCP execution or health checks,
hooks display, auto-update, light theme, Linux guarantees, telemetry.

## Landscape (why this wins)

The durable wedge is *wraps your terminal instead of replacing it* + parse-only
MCP/skills visibility + beginner-safe Git + a structural privacy stance. Editors
(VS Code, Cursor) want to be the AI; terminals (Warp, Ghostty) replace your shell;
Claude Code GUI managers tend to be cloud-tied or not terminal-first. DockTerm
sits in the empty cell: terminal-first, local-only, on-demand panels.

## Success & honesty

Success for an OSS launch is stars, quality issues, and forks — measured without
any telemetry (GitHub traffic only). The honest-claims policy is enforced in all
copy: never claim iTerm/Cursor replacement, enterprise security, an MCP
marketplace, or signed builds before they exist.

Monetization is explicitly a **future-only** consideration and nothing in V1
depends on it.
