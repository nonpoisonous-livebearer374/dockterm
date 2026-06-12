import { create } from 'zustand'

/** Lets other panels (e.g. Project Info "run script") paste a command into the
 * mini terminal — visibly, for the user to review and run. */
interface TerminalBus {
  pendingCmd: string | null
  runInMini: (cmd: string) => void
  consumePending: () => string | null
}

export const useTerminalBus = create<TerminalBus>((set, get) => ({
  pendingCmd: null,
  runInMini: (cmd) => set({ pendingCmd: cmd }),
  consumePending: () => {
    const cmd = get().pendingCmd
    if (cmd !== null) set({ pendingCmd: null })
    return cmd
  }
}))
