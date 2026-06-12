import { z } from 'zod'
import { ok, err, type Err } from '@shared/result'
import * as gitService from '../../services/gitService'
import type { Registrar } from '../register'

const pathsSchema = z.object({ paths: z.array(z.string().max(4096)).max(5000) })
const commitSchema = z.object({ message: z.string().min(1).max(10000) })
const pushSchema = z.object({
  setUpstream: z.boolean().optional(),
  forceWithLease: z.boolean().optional()
})
const branchSchema = z.object({ name: z.string().min(1).max(255) })

function mapGitError(e: unknown): Err {
  const msg = e instanceof Error ? e.message : String(e)
  const lower = msg.toLowerCase()
  if (lower.includes('not a git repository')) return err('NOT_REPO', 'Not a Git repository')
  if (
    lower.includes('no upstream') ||
    lower.includes('set-upstream') ||
    lower.includes('no configured push destination')
  ) {
    return err('NO_UPSTREAM', msg)
  }
  if (
    lower.includes('authentication') ||
    lower.includes('could not read username') ||
    lower.includes('permission denied') ||
    lower.includes('terminal prompts disabled')
  ) {
    return err('AUTH_WAIT', msg)
  }
  if (lower.includes('conflict') || lower.includes('needs merge') || lower.includes('unmerged')) {
    return err('MERGE_CONFLICT', msg)
  }
  if (
    lower.includes('could not resolve host') ||
    lower.includes('failed to connect') ||
    lower.includes('timed out') ||
    lower.includes('network')
  ) {
    return err('NETWORK', msg)
  }
  return err('GIT', msg.split('\n')[0])
}

export function registerGitHandlers(reg: Registrar): void {
  reg('git:status', z.void(), async () => {
    try {
      return ok(await gitService.getStatus())
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:stage', pathsSchema, async (req) => {
    try {
      await gitService.stage(req.paths)
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:stageAll', z.void(), async () => {
    try {
      await gitService.stageAll()
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:unstage', pathsSchema, async (req) => {
    try {
      await gitService.unstage(req.paths)
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:discard', pathsSchema, async (req) => {
    try {
      await gitService.discard(req.paths)
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:commit', commitSchema, async (req) => {
    try {
      return ok(await gitService.commit(req.message))
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:push', pushSchema, async (req) => {
    try {
      return ok({ output: await gitService.push(req) })
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:pull', z.void(), async () => {
    try {
      return ok({ output: await gitService.pull() })
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:branches', z.void(), async () => {
    try {
      return ok(await gitService.branches())
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:createBranch', branchSchema, async (req) => {
    try {
      await gitService.createBranch(req.name)
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:switchBranch', branchSchema, async (req) => {
    try {
      await gitService.switchBranch(req.name)
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })

  reg('git:deleteBranch', branchSchema, async (req) => {
    try {
      await gitService.deleteBranch(req.name)
      return ok(undefined)
    } catch (e) {
      return mapGitError(e)
    }
  })
}
