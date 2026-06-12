import { useMemo } from 'react'
import { Command } from 'cmdk'
import { useAppStore } from '../../state/useAppStore'
import { buildCommands, type AppCommand } from './commands'

function groupBy(commands: AppCommand[]): Record<string, AppCommand[]> {
  const groups: Record<string, AppCommand[]> = {}
  for (const c of commands) {
    ;(groups[c.group] ??= []).push(c)
  }
  return groups
}

export function CommandPalette() {
  const open = useAppStore((s) => s.paletteOpen)
  const setOpen = useAppStore((s) => s.setPaletteOpen)

  const groups = useMemo(() => (open ? groupBy(buildCommands()) : {}), [open])

  const onSelect = (command: AppCommand) => {
    setOpen(false)
    command.run()
  }

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette" className="palette">
      <Command.Input placeholder="Type a command…" className="palette__input" />
      <Command.List className="palette__list">
        <Command.Empty className="palette__empty">No matching commands.</Command.Empty>
        {Object.entries(groups).map(([group, commands]) => (
          <Command.Group key={group} heading={group} className="palette__group">
            {commands.map((command) => (
              <Command.Item
                key={command.id}
                value={`${command.group} ${command.title}`}
                onSelect={() => onSelect(command)}
                className="palette__item"
              >
                <span>{command.title}</span>
                {command.shortcut && <kbd className="palette__kbd">{command.shortcut}</kbd>}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
