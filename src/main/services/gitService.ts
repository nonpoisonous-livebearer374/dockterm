import { simpleGit, type SimpleGit } from 'simple-git'
import { getProjectRoot } from './projectContext'
import { statusToView, notRepoView } from './gitStatusMap'
import type { GitStatusView, GitBranches, CommitResultView } from '@shared/types'

/**
 * Every git invocation goes through here. `core.hooksPath=` neutralizes any hooks
 * the (possibly untrusted) project repo defines — opening a malicious repo must
 * never run its code (CVE-2024-32002 class). A block timeout stops a call from
 * hanging forever if a credential helper dialog is left open.
 */
function git(): SimpleGit {
  return simpleGit({
    baseDir: getProjectRoot(),
    // Set hooksPath to EMPTY so the (possibly untrusted) repo's hooks never run.
    // simple-git guards core.hooksPath against malicious *values*; we opt in
    // because our value is the empty string — the safe, hook-disabling direction.
    config: ['core.hooksPath='],
    unsafe: { allowUnsafeHooksPath: true },
    trimmed: true,
    timeout: { block: 120_000 }
  })
}

export async function getStatus(): Promise<GitStatusView> {
  const g = git()
  let isRepo = false
  try {
    isRepo = await g.checkIsRepo()
  } catch {
    isRepo = false
  }
  if (!isRepo) return notRepoView()

  let hasCommits = true
  try {
    await g.revparse(['--verify', 'HEAD'])
  } catch {
    hasCommits = false
  }
  return statusToView(await g.status(), hasCommits)
}

export async function stage(paths: string[]): Promise<void> {
  await git().add(paths)
}

export async function stageAll(): Promise<void> {
  await git().add(['-A'])
}

export async function unstage(paths: string[]): Promise<void> {
  await git().raw(['restore', '--staged', '--', ...paths])
}

export async function discard(paths: string[]): Promise<void> {
  await git().raw(['restore', '--', ...paths])
}

export async function commit(message: string): Promise<CommitResultView> {
  const result = await git().commit(message)
  const s = result.summary
  return {
    hash: result.commit || 'HEAD',
    summary: `${s.changes} file(s) changed, +${s.insertions} -${s.deletions}`
  }
}

export async function push(options: {
  setUpstream?: boolean
  forceWithLease?: boolean
}): Promise<string> {
  const g = git()
  const args: string[] = []
  if (options.forceWithLease) args.push('--force-with-lease')
  if (options.setUpstream) {
    const branch = (await g.status()).current ?? 'HEAD'
    args.push('--set-upstream', 'origin', branch)
  }
  const result = await g.push(args)
  const updates = (result.pushed ?? []).length
  const remote = result.repo ?? 'remote'
  return `Pushed ${updates} ref(s) to ${remote}.`
}

export async function pull(): Promise<string> {
  const r = await git().pull()
  return `Updated: ${r.summary.changes} change(s), +${r.summary.insertions} -${r.summary.deletions}.`
}

export async function branches(): Promise<GitBranches> {
  const b = await git().branchLocal()
  return { current: b.current || null, all: b.all }
}

export async function createBranch(name: string): Promise<void> {
  await git().checkoutLocalBranch(name)
}

export async function switchBranch(name: string): Promise<void> {
  await git().checkout(name)
}

export async function deleteBranch(name: string): Promise<void> {
  // Non-force: git refuses to delete a branch with unmerged commits.
  await git().deleteLocalBranch(name, false)
}
