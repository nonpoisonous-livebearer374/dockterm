---
name: ultraplan
description: Produce a detailed, reviewable implementation plan for a DockTerm change before building it.
---

# Ultraplan

Turn an agreed design into a step-by-step plan that another contributor could
execute without context.

Cover:

- Scope and the exact files to create/modify (use real paths).
- The IPC contract changes: new channels in `src/shared/ipc.ts` (type + runtime
  allowlist), the zod-validated handler, and the service it calls.
- Data flow renderer ↔ main, and any store changes.
- Security: filesystem jail usage, `gitInvoke` for git, `secretMask` for any
  config display.
- Tests to add in `tests/unit` (pure logic: parsers, mappers, validators).
- The order to build in, and acceptance criteria.

Stop and get approval before implementing. Keep `npm run typecheck && npm test &&
npm run build` green at every step.
