import { promises as fs } from 'node:fs'
import { shell } from 'electron'
import { resolveInside } from './pathJail'
import { getProjectRoot } from './projectContext'
import { IGNORED_ENTRIES, MAX_EDIT_FILE_BYTES, MAX_TREE_ENTRIES } from '@shared/constants'
import type { TreeNode, ReadFileResult, WriteFileResult } from '@shared/ipc'

/** One level of children for `relPath` ('' = project root). Dirs first, then files. */
export async function readTree(relPath: string): Promise<TreeNode[]> {
  const root = getProjectRoot()
  const abs = relPath ? resolveInside(root, relPath) : root
  const entries = await fs.readdir(abs, { withFileTypes: true })
  const nodes: TreeNode[] = []
  for (const entry of entries) {
    if (IGNORED_ENTRIES.includes(entry.name)) continue
    if (entry.isSymbolicLink()) continue
    const childRel = relPath ? `${relPath}/${entry.name}` : entry.name
    nodes.push({ name: entry.name, relPath: childRel, type: entry.isDirectory() ? 'dir' : 'file' })
    if (nodes.length >= MAX_TREE_ENTRIES) break
  }
  nodes.sort((a, b) =>
    a.type !== b.type ? (a.type === 'dir' ? -1 : 1) : a.name.localeCompare(b.name)
  )
  return nodes
}

export async function readFile(relPath: string): Promise<ReadFileResult> {
  const abs = resolveInside(getProjectRoot(), relPath)
  const stat = await fs.stat(abs)
  if (stat.size > MAX_EDIT_FILE_BYTES) return { kind: 'too-large', size: stat.size }
  const buffer = await fs.readFile(abs)
  if (isBinary(buffer)) return { kind: 'binary', size: stat.size }
  return { kind: 'text', content: buffer.toString('utf8'), mtimeMs: stat.mtimeMs }
}

export async function writeFile(
  relPath: string,
  content: string,
  expectedMtimeMs: number | null
): Promise<WriteFileResult> {
  const abs = resolveInside(getProjectRoot(), relPath)
  if (expectedMtimeMs !== null) {
    try {
      const stat = await fs.stat(abs)
      if (Math.abs(stat.mtimeMs - expectedMtimeMs) > 1) {
        return { kind: 'conflict', mtimeMs: stat.mtimeMs }
      }
    } catch {
      // file vanished — fall through and recreate it
    }
  }
  await fs.writeFile(abs, content, 'utf8')
  const stat = await fs.stat(abs)
  return { kind: 'ok', mtimeMs: stat.mtimeMs }
}

export async function createFile(relPath: string): Promise<void> {
  const abs = resolveInside(getProjectRoot(), relPath)
  await fs.writeFile(abs, '', { flag: 'wx' })
}

export async function createDir(relPath: string): Promise<void> {
  const abs = resolveInside(getProjectRoot(), relPath)
  await fs.mkdir(abs)
}

export async function rename(fromRel: string, toRel: string): Promise<void> {
  const root = getProjectRoot()
  await fs.rename(resolveInside(root, fromRel), resolveInside(root, toRel))
}

export async function trash(relPath: string): Promise<void> {
  await shell.trashItem(resolveInside(getProjectRoot(), relPath))
}

export function reveal(relPath: string): void {
  shell.showItemInFolder(resolveInside(getProjectRoot(), relPath))
}

function isBinary(buffer: Buffer): boolean {
  const len = Math.min(buffer.length, 8000)
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true
  }
  return false
}
