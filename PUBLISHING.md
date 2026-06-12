# Publishing DockTerm

> The local repository at `E:\dockterm` is fully built, committed, tagged
> (`v0.1.0`), and its `origin` remote is already set to
> `https://github.com/munvard/dockterm.git`. The only remaining step needs your
> GitHub authentication, which an automated agent can't do for you.
>
> Once you push, the **Release** GitHub Action builds the Windows `.exe`, macOS
> `.dmg` (arm64 + x64), and Linux `.AppImage`, and attaches them to the
> `v0.1.0` release automatically. Then "go to Releases and download" just works.

## Option A — one command (recommended): use `scripts/publish.ps1`

From a terminal in `E:\dockterm`, authenticate once, then run the helper:

```powershell
# If you have GitHub CLI (install: winget install --id GitHub.cli):
gh auth login
./scripts/publish.ps1

# …or, without gh, provide a token (repo scope) once:
$env:GH_TOKEN = "ghp_yourtoken"
./scripts/publish.ps1
```

The script creates the public repo, pushes `main`, and pushes the `v0.1.0` tag.

## Option B — fully manual

1. Create an **empty** public repo at <https://github.com/new>:
   - Name: `dockterm`
   - Public
   - **Do not** add a README, .gitignore, or license (the repo already has them).
2. Push:
   ```powershell
   cd E:\dockterm
   git push -u origin main      # authenticate in the browser popup when asked
   git push origin v0.1.0       # triggers the installer build
   ```

## After pushing

- Watch the **Actions** tab — the `Release` workflow runs on the `v0.1.0` tag.
- When it finishes, the installers appear under **Releases**:
  `DockTerm-0.1.0-windows-x64.exe`, `DockTerm-0.1.0-mac-arm64.dmg`,
  `DockTerm-0.1.0-mac-x64.dmg`, `DockTerm-0.1.0-linux-x64.AppImage`.
- Builds are unsigned in V1 — see the README for the Gatekeeper/SmartScreen bypass.

## Repo settings to set on GitHub (optional, nice to have)

- **Description**: `Terminal-first workspace for Claude Code — files, Git, MCP, and skills panels on demand. No telemetry. MIT.`
- **Topics**: `claude-code`, `terminal`, `electron`, `mcp`, `git`, `developer-tools`, `xterm-js`, `monaco-editor`, `typescript`, `react`
