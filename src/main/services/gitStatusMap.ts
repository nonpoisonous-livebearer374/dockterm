import type { StatusResult } from 'simple-git'
import type { GitFileEntry, GitFileStatus, GitRepoState, GitStatusView, GitUpstream } from '@shared/types'

const CHAR_TO_STATUS: Record<string, GitFileStatus> = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  R: 'renamed',
  C: 'copied',
  T: 'typechange'
}

/**
 * Pure mapping from simple-git's StatusResult to DockTerm's beginner-friendly
 * view model. Kept free of electron/fs so it can be unit-tested directly.
 */
export function statusToView(status: StatusResult, hasCommits: boolean): GitStatusView {
  const conflictedPaths = new Set(status.conflicted)
  const renameFrom = new Map<string, string>()
  for (const r of status.renamed) renameFrom.set(r.to, r.from)

  const staged: GitFileEntry[] = []
  const unstaged: GitFileEntry[] = []
  const untracked: GitFileEntry[] = []
  const conflicted: GitFileEntry[] = status.conflicted.map((path) => ({
    path,
    status: 'conflicted',
    staged: false
  }))

  for (const file of status.files) {
    if (conflictedPaths.has(file.path)) continue
    const index = file.index
    const working = file.working_dir

    if (index === '?' || working === '?') {
      untracked.push({ path: file.path, status: 'untracked', staged: false })
      continue
    }
    if (index && index !== ' ') {
      const status_ = CHAR_TO_STATUS[index] ?? 'modified'
      const origPath = renameFrom.get(file.path)
      staged.push(
        origPath
          ? { path: file.path, status: status_, staged: true, origPath }
          : { path: file.path, status: status_, staged: true }
      )
    }
    if (working && working !== ' ') {
      unstaged.push({ path: file.path, status: CHAR_TO_STATUS[working] ?? 'modified', staged: false })
    }
  }

  const repoState: GitRepoState = !hasCommits
    ? 'empty'
    : status.detached
      ? 'detached'
      : conflicted.length > 0
        ? 'conflicted'
        : 'ok'

  const upstream: GitUpstream | null = status.tracking
    ? { remote: status.tracking, ahead: status.ahead, behind: status.behind }
    : null

  const clean =
    staged.length === 0 &&
    unstaged.length === 0 &&
    untracked.length === 0 &&
    conflicted.length === 0

  return {
    repoState,
    branch: status.current ?? null,
    upstream,
    staged,
    unstaged,
    untracked,
    conflicted,
    clean
  }
}

export function notRepoView(): GitStatusView {
  return {
    repoState: 'not-repo',
    branch: null,
    upstream: null,
    staged: [],
    unstaged: [],
    untracked: [],
    conflicted: [],
    clean: true
  }
}
