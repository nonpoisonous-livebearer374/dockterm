import { create } from 'zustand'
import type { GitStatusView, GitBranches } from '@shared/types'
import { useToastStore } from './useToastStore'
import { useDialogStore } from './useDialogStore'

interface GitState {
  status: GitStatusView | null
  branches: GitBranches | null
  busy: boolean
  log: string[]
  refresh: () => Promise<void>
  refreshBranches: () => Promise<void>
  stage: (paths: string[]) => Promise<void>
  stageAll: () => Promise<void>
  unstage: (paths: string[]) => Promise<void>
  discard: (paths: string[], label: string) => Promise<void>
  commit: (message: string) => Promise<boolean>
  push: (options?: { setUpstream?: boolean; forceWithLease?: boolean }) => Promise<void>
  pull: () => Promise<void>
  createBranch: (name: string) => Promise<void>
  switchBranch: (name: string) => Promise<void>
  deleteBranch: (name: string) => Promise<void>
  reset: () => void
}

const toast = (msg: string, kind: 'success' | 'error' | 'info' | 'warning') =>
  useToastStore.getState().push(msg, kind)

export const useGitStore = create<GitState>((set, get) => ({
  status: null,
  branches: null,
  busy: false,
  log: [],

  refresh: async () => {
    const res = await window.dockterm.invoke('git:status', undefined)
    if (res.ok) set({ status: res.value })
  },

  refreshBranches: async () => {
    const res = await window.dockterm.invoke('git:branches', undefined)
    if (res.ok) set({ branches: res.value })
  },

  stage: async (paths) => {
    const res = await window.dockterm.invoke('git:stage', { paths })
    if (!res.ok) toast(res.error.message, 'error')
    await get().refresh()
  },

  stageAll: async () => {
    const res = await window.dockterm.invoke('git:stageAll', undefined)
    if (!res.ok) toast(res.error.message, 'error')
    await get().refresh()
  },

  unstage: async (paths) => {
    const res = await window.dockterm.invoke('git:unstage', { paths })
    if (!res.ok) toast(res.error.message, 'error')
    await get().refresh()
  },

  discard: async (paths, label) => {
    const confirmed = await useDialogStore.getState().confirm({
      title: 'Discard changes',
      message: `Discard your changes to ${label}?`,
      detail: 'This restores the file(s) from Git and cannot be undone.',
      confirmLabel: 'Discard',
      danger: true,
      command: `git restore -- ${paths.join(' ')}`
    })
    if (!confirmed) return
    const res = await window.dockterm.invoke('git:discard', { paths })
    if (!res.ok) toast(res.error.message, 'error')
    await get().refresh()
  },

  commit: async (message) => {
    set({ busy: true })
    const res = await window.dockterm.invoke('git:commit', { message })
    set({ busy: false })
    if (!res.ok) {
      toast(res.error.message, 'error')
      return false
    }
    toast(`Committed ${res.value.hash.slice(0, 7)} — ${res.value.summary}`, 'success')
    await get().refresh()
    return true
  },

  push: async (options) => {
    set({ busy: true })
    const res = await window.dockterm.invoke('git:push', options ?? {})
    set({ busy: false })
    if (!res.ok) {
      if (res.error.code === 'NO_UPSTREAM') {
        const publish = await useDialogStore.getState().confirm({
          title: 'No upstream branch',
          message: 'This branch has not been published to the remote yet.',
          detail: 'Publish it to origin so you can push?',
          confirmLabel: 'Publish branch',
          command: 'git push --set-upstream origin <branch>'
        })
        if (publish) await get().push({ setUpstream: true })
        return
      }
      toast(res.error.message, 'error')
      return
    }
    set((s) => ({ log: [...s.log, res.value.output].slice(-50) }))
    toast(res.value.output, 'success')
    await get().refresh()
  },

  pull: async () => {
    set({ busy: true })
    const res = await window.dockterm.invoke('git:pull', undefined)
    set({ busy: false })
    if (!res.ok) {
      toast(res.error.message, 'error')
      return
    }
    set((s) => ({ log: [...s.log, res.value.output].slice(-50) }))
    toast(res.value.output, 'success')
    await get().refresh()
  },

  createBranch: async (name) => {
    const res = await window.dockterm.invoke('git:createBranch', { name })
    if (!res.ok) {
      toast(res.error.message, 'error')
      return
    }
    await Promise.all([get().refresh(), get().refreshBranches()])
  },

  switchBranch: async (name) => {
    const res = await window.dockterm.invoke('git:switchBranch', { name })
    if (!res.ok) {
      toast(res.error.message, 'error')
      return
    }
    await Promise.all([get().refresh(), get().refreshBranches()])
  },

  deleteBranch: async (name) => {
    const confirmed = await useDialogStore.getState().confirm({
      title: 'Delete branch',
      message: `Delete the branch "${name}"?`,
      detail: 'Git will refuse if the branch has unmerged commits.',
      confirmLabel: 'Delete branch',
      danger: true,
      command: `git branch -d ${name}`
    })
    if (!confirmed) return
    const res = await window.dockterm.invoke('git:deleteBranch', { name })
    if (!res.ok) {
      toast(res.error.message, 'error')
      return
    }
    await get().refreshBranches()
  },

  reset: () => set({ status: null, branches: null, log: [] })
}))
