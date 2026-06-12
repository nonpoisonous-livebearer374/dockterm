import { describe, it, expect } from 'vitest'
import type { StatusResult } from 'simple-git'
import { statusToView, notRepoView } from '@main/services/gitStatusMap'

function makeStatus(over: Partial<StatusResult>): StatusResult {
  return {
    not_added: [],
    conflicted: [],
    created: [],
    deleted: [],
    modified: [],
    renamed: [],
    files: [],
    staged: [],
    ahead: 0,
    behind: 0,
    current: 'main',
    tracking: null,
    detached: false,
    isClean: () => true,
    ...over
  } as StatusResult
}

describe('statusToView', () => {
  it('splits staged and unstaged changes from a single file', () => {
    const view = statusToView(
      makeStatus({ files: [{ path: 'a.ts', index: 'M', working_dir: 'M' }] }),
      true
    )
    expect(view.staged.map((f) => f.path)).toEqual(['a.ts'])
    expect(view.unstaged.map((f) => f.path)).toEqual(['a.ts'])
    expect(view.clean).toBe(false)
    expect(view.repoState).toBe('ok')
  })

  it('classifies untracked files', () => {
    const view = statusToView(
      makeStatus({ files: [{ path: 'new.txt', index: '?', working_dir: '?' }] }),
      true
    )
    expect(view.untracked.map((f) => f.path)).toEqual(['new.txt'])
    expect(view.staged).toHaveLength(0)
  })

  it('reports conflicted files and repo state', () => {
    const view = statusToView(
      makeStatus({
        conflicted: ['both.txt'],
        files: [{ path: 'both.txt', index: 'U', working_dir: 'U' }]
      }),
      true
    )
    expect(view.conflicted.map((f) => f.path)).toEqual(['both.txt'])
    expect(view.repoState).toBe('conflicted')
  })

  it('marks an empty repo', () => {
    const view = statusToView(makeStatus({ current: 'main' }), false)
    expect(view.repoState).toBe('empty')
    expect(view.clean).toBe(true)
  })

  it('surfaces upstream ahead/behind', () => {
    const view = statusToView(
      makeStatus({ tracking: 'origin/main', ahead: 2, behind: 1 }),
      true
    )
    expect(view.upstream).toEqual({ remote: 'origin/main', ahead: 2, behind: 1 })
  })

  it('carries the rename origin', () => {
    const view = statusToView(
      makeStatus({
        renamed: [{ from: 'old.ts', to: 'new.ts' }],
        files: [{ path: 'new.ts', index: 'R', working_dir: ' ' }]
      }),
      true
    )
    expect(view.staged[0]).toMatchObject({ path: 'new.ts', status: 'renamed', origPath: 'old.ts' })
  })

  it('notRepoView is clean and flagged', () => {
    expect(notRepoView().repoState).toBe('not-repo')
    expect(notRepoView().clean).toBe(true)
  })
})
