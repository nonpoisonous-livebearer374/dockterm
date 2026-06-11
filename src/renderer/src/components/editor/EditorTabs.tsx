import { X } from 'lucide-react'
import { useEditorStore } from '../../state/useEditorStore'

export function EditorTabs() {
  const tabs = useEditorStore((s) => s.tabs)
  const activePath = useEditorStore((s) => s.activePath)
  const setActive = useEditorStore((s) => s.setActive)
  const close = useEditorStore((s) => s.close)

  if (tabs.length === 0) return null

  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <div
          key={tab.relPath}
          className={`tab${tab.relPath === activePath ? ' tab--active' : ''}`}
          onMouseDown={() => setActive(tab.relPath)}
          title={tab.relPath}
          role="tab"
          aria-selected={tab.relPath === activePath}
        >
          <span className="tab__name">{tab.name}</span>
          <button
            className="tab__close"
            onMouseDown={(e) => {
              e.stopPropagation()
              close(tab.relPath)
            }}
            aria-label={`Close ${tab.name}`}
          >
            {tab.dirty ? <span className="tab__dot" /> : <X size={12} />}
          </button>
        </div>
      ))}
    </div>
  )
}
