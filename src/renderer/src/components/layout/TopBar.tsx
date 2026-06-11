import { GitBranch, FolderOpen, SquareTerminal } from 'lucide-react'
import { useAppStore } from '../../state/useAppStore'
import { PANELS } from './panels'

export function TopBar() {
  const project = useAppStore((s) => s.project)
  const openDialog = useAppStore((s) => s.openProjectDialog)
  const openPanel = useAppStore((s) => s.openPanel)
  const togglePanel = useAppStore((s) => s.togglePanel)
  const miniTermOpen = useAppStore((s) => s.miniTermOpen)
  const toggleMini = useAppStore((s) => s.toggleMiniTerm)

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__project"
          onClick={() => void openDialog()}
          title="Open another project"
        >
          <FolderOpen size={13} />
          <span>{project?.name ?? 'DockTerm'}</span>
        </button>
        {project?.branch && (
          <span className="topbar__branch">
            <GitBranch size={12} />
            {project.branch}
          </span>
        )}
      </div>
      <div className="topbar__right">
        {PANELS.map((panel) => {
          const Icon = panel.icon
          return (
            <button
              key={panel.id}
              className={`iconbtn${openPanel === panel.id ? ' iconbtn--active' : ''}`}
              title={panel.label}
              aria-label={panel.label}
              onClick={() => togglePanel(panel.id)}
            >
              <Icon size={15} />
            </button>
          )
        })}
        <span className="topbar__divider" />
        <button
          className={`iconbtn${miniTermOpen ? ' iconbtn--active' : ''}`}
          title="Toggle mini terminal"
          aria-label="Toggle mini terminal"
          onClick={toggleMini}
        >
          <SquareTerminal size={15} />
        </button>
      </div>
    </header>
  )
}
