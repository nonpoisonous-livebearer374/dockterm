/** The currently open project root, shared by the fs/git/watcher services. */
let root: string | null = null

export function setProjectRoot(path: string | null): void {
  root = path
}

export function getProjectRoot(): string {
  if (!root) throw new Error('No project is open')
  return root
}

export function hasProject(): boolean {
  return root !== null
}
