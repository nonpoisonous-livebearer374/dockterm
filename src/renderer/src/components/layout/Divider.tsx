import { type MouseEvent } from 'react'

/** A 1px draggable splitter. Reports incremental pixel deltas during the drag;
 * the parent accumulates them with a functional state update. */
export function Divider({
  direction,
  onResize
}: {
  direction: 'v' | 'h'
  onResize: (delta: number) => void
}) {
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    let last = direction === 'v' ? e.clientX : e.clientY
    const move = (ev: globalThis.MouseEvent) => {
      const current = direction === 'v' ? ev.clientX : ev.clientY
      onResize(current - last)
      last = current
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    document.body.style.cursor = direction === 'v' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }

  return <div className={`rhandle rhandle--${direction}`} onMouseDown={onMouseDown} role="separator" />
}
