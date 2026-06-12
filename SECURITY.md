# Security Policy

## Reporting a vulnerability

Please report security issues **privately**, not in public issues or PRs.

- Preferred: open a [private security advisory](https://github.com/munvard/dockterm/security/advisories/new) on this repository.

You'll get an acknowledgement as soon as possible. Please include: affected version, platform, a description, and reproduction steps or a proof of concept. Please give a reasonable window to address the issue before any public disclosure.

## Scope

DockTerm is a **local desktop application**. There is no DockTerm server, account system, or backend — so the threat model is local. Areas most relevant to report:

- Escaping the project filesystem jail (path traversal, symlink escape).
- Executing code from an opened (untrusted) project repository — e.g. via git hooks, or via the MCP/skills config readers.
- Leaking masked secrets from the MCP/skills panels.
- Renderer sandbox escapes, IPC validation bypasses, or remote-content loading.

What is **not** a vulnerability: that the terminal runs whatever you type. DockTerm grants no privilege a normal terminal doesn't; it only ensures that *only its own local UI* can drive that terminal.

## Supported versions

This is pre-1.0 software. Security fixes target the latest release on `main`. There are no backports yet.

## What DockTerm guarantees

- No telemetry, analytics, or crash reporting.
- No network calls at runtime except git operations you initiate (push/pull) and external links you click.
- No accounts, no cloud, no stored credentials/tokens.
- Renderer runs with `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; production loads from a custom `app://` origin under a strict CSP with no remote content.

See [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md) for the full model.
