// Git smoke: create a temp untracked file, open Source Control, screenshot.
import { _electron as electron } from '@playwright/test'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFileSync, rmSync } from 'node:fs'

const CWD = 'E:\\dockterm'
const SHOT = process.env.SMOKE_SHOT ?? 'E:\\dt-tmp\\smoke-git.png'
const dummy = `${CWD}\\__smoke_change__.txt`

writeFileSync(dummy, 'temporary change so the git panel has something to show\n')

const app = await electron.launch({ args: ['.'], cwd: CWD })
try {
  const win = await app.firstWindow()
  await win.waitForSelector('.xterm', { timeout: 20000 })
  await sleep(1500)
  await win.click('button[aria-label="Source Control"]')
  await sleep(3000)
  win.on('console', (m) => console.log('PAGE:', m.text()))
  await win.screenshot({ path: SHOT })
  console.log('SCREENSHOT=' + SHOT)
  console.log('SMOKE_GIT_DONE')
} finally {
  await app.close()
  rmSync(dummy, { force: true })
}
