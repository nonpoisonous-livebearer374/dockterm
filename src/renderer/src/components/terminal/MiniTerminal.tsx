import { useEffect } from 'react'
import { useTerminal, type TerminalOptions } from './useTerminal'
import { useTerminalBus } from '../../state/useTerminalBus'

export function MiniTerminal(props: TerminalOptions) {
  const term = useTerminal(props)
  const pending = useTerminalBus((s) => s.pendingCmd)
  const consume = useTerminalBus((s) => s.consumePending)

  useEffect(() => {
    if (pending !== null) {
      term.paste(pending)
      term.focus()
      consume()
    }
    // term is stable for this mounted instance; we only react to new commands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  return (
    <div className="terminal">
      <div className="terminal__surface" ref={term.containerRef} />
    </div>
  )
}
