import { create } from 'zustand'
import { languageForFile } from '../components/editor/language'
import { useToastStore } from './useToastStore'
import { useDialogStore } from './useDialogStore'

export interface EditorTab {
  relPath: string
  name: string
  content: string
  mtimeMs: number
  dirty: boolean
  language: string
}

interface EditorState {
  tabs: EditorTab[]
  activePath: string | null
  open: (relPath: string, name: string) => Promise<void>
  close: (relPath: string) => void
  closeActive: () => void
  closeAll: () => void
  setActive: (relPath: string) => void
  markDirty: (relPath: string, dirty: boolean) => void
  save: (relPath: string, content: string) => Promise<void>
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activePath: null,

  open: async (relPath, name) => {
    if (get().tabs.some((t) => t.relPath === relPath)) {
      set({ activePath: relPath })
      return
    }
    const res = await window.dockterm.invoke('fs:readFile', { relPath })
    if (!res.ok) {
      useToastStore.getState().push(res.error.message, 'error')
      return
    }
    const file = res.value
    if (file.kind === 'binary') {
      useToastStore.getState().push(`${name} is a binary file and can't be edited here`, 'warning')
      return
    }
    if (file.kind === 'too-large') {
      useToastStore
        .getState()
        .push(`${name} is too large to open (${Math.round(file.size / 1024)} KB)`, 'warning')
      return
    }
    const tab: EditorTab = {
      relPath,
      name,
      content: file.content,
      mtimeMs: file.mtimeMs,
      dirty: false,
      language: languageForFile(name)
    }
    set((s) => ({ tabs: [...s.tabs, tab], activePath: relPath }))
  },

  close: (relPath) =>
    set((s) => {
      const tabs = s.tabs.filter((t) => t.relPath !== relPath)
      const activePath =
        s.activePath === relPath ? (tabs.length ? tabs[tabs.length - 1].relPath : null) : s.activePath
      return { tabs, activePath }
    }),

  closeActive: () => {
    const path = get().activePath
    if (path) get().close(path)
  },

  closeAll: () => set({ tabs: [], activePath: null }),

  setActive: (relPath) => set({ activePath: relPath }),

  markDirty: (relPath, dirty) =>
    set((s) => ({ tabs: s.tabs.map((t) => (t.relPath === relPath ? { ...t, dirty } : t)) })),

  save: async (relPath, content) => {
    const tab = get().tabs.find((t) => t.relPath === relPath)
    if (!tab) return

    const res = await window.dockterm.invoke('fs:writeFile', {
      relPath,
      content,
      expectedMtimeMs: tab.mtimeMs
    })
    if (!res.ok) {
      useToastStore.getState().push(res.error.message, 'error')
      return
    }
    if (res.value.kind === 'ok') {
      const mtimeMs = res.value.mtimeMs
      set((s) => ({
        tabs: s.tabs.map((t) => (t.relPath === relPath ? { ...t, dirty: false, content, mtimeMs } : t))
      }))
      return
    }

    // Disk changed under us — never clobber silently.
    const overwrite = await useDialogStore.getState().confirm({
      title: 'File changed on disk',
      message: `"${tab.name}" was modified outside DockTerm since you opened it.`,
      detail: 'Overwrite the version on disk with your edits?',
      confirmLabel: 'Overwrite',
      danger: true
    })
    if (!overwrite) return

    const forced = await window.dockterm.invoke('fs:writeFile', {
      relPath,
      content,
      expectedMtimeMs: null
    })
    if (!forced.ok) {
      useToastStore.getState().push(forced.error.message, 'error')
      return
    }
    if (forced.value.kind === 'ok') {
      const mtimeMs = forced.value.mtimeMs
      set((s) => ({
        tabs: s.tabs.map((t) => (t.relPath === relPath ? { ...t, dirty: false, content, mtimeMs } : t))
      }))
    }
  }
}))
