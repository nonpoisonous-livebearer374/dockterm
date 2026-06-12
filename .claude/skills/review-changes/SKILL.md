---
name: review-changes
description: Review the current DockTerm changes for correctness, security, and consistency before committing.
---

# Review changes

Summarize what changed with `git status` and `git diff`, then check:

- **Correctness**: obvious bugs, missed edge cases, types that lie.
- **Security**: every `git` call goes through `gitInvoke` (hooksPath neutralized);
  filesystem access stays inside `pathJail`; MCP/skills config is masked via
  `secretMask`; no `shell: true`; no secrets logged or returned.
- **IPC**: new channels are explicit verbs with zod validation and are on the
  shared allowlist.
- **Consistency**: matches the surrounding code; no new dependency without reason.
- **Tests**: pure logic has unit tests; `npm run typecheck && npm test && npm run
  build` all pass.

Report findings grouped by severity.
