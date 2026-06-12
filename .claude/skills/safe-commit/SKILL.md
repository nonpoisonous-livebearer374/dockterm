---
name: safe-commit
description: Stage and commit DockTerm changes safely with a clear, conventional message.
---

# Safe commit

1. Run `git status` and review exactly what will be committed.
2. Stage intentionally — don't blindly `git add -A`. Keep unrelated changes out.
3. Make sure `npm run typecheck && npm test && npm run build` pass first.
4. Write a clear conventional message (`feat:`, `fix:`, `chore:`, `docs:`) that
   says what changed and why.
5. Never force-push or rewrite shared history without explicit confirmation; if a
   force push is truly needed, use `--force-with-lease`.
