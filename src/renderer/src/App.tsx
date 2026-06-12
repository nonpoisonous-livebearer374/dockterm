import { useEffect } from 'react'
import { useAppStore } from './state/useAppStore'
import { useShortcuts } from './hooks/useShortcuts'
import { Shell } from './components/layout/Shell'
import { EmptyState } from './components/common/EmptyState'
import { Toaster } from './components/common/Toaster'
import { DialogHost } from './components/common/DialogHost'
import { CommandPalette } from './components/command-palette/CommandPalette'

export default function App() {
  const ready = useAppStore((s) => s.ready)
  const project = useAppStore((s) => s.project)
  const accent = useAppStore((s) => s.settings?.ui.accent)
  const init = useAppStore((s) => s.init)

  useShortcuts()

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    if (accent) document.documentElement.dataset.accent = accent
  }, [accent])

  return (
    <>
      {!ready ? <div className="app app--loading" /> : project ? <Shell /> : <EmptyState />}
      <Toaster />
      <DialogHost />
      <CommandPalette />
    </>
  )
}
