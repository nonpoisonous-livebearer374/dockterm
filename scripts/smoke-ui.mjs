// UI smoke: open the Files panel, click a file, confirm the Monaco editor opens.
import { _electron as electron } from '@playwright/test'
import { setTimeout as sleep } from 'node:timers/promises'

const CWD = 'E:\\dockterm'
const SHOT = process.env.SMOKE_SHOT ?? 'E:\\dt-tmp\\smoke-ui.png'

const app = await electron.launch({ args: ['.'], cwd: CWD })
try {
  const win = await app.firstWindow()
  await win.waitForSelector('.xterm', { timeout: 20000 })
  await sleep(1500)

  await win.click('button[aria-label="Files"]')
  await win.waitForSelector('.tree', { timeout: 6000 })
  await sleep(700)

  await win.locator('.tree__row', { hasText: 'package.json' }).first().click()
  await win.waitForSelector('.monaco-editor', { timeout: 10000 })
  await sleep(1800)

  await win.screenshot({ path: SHOT })
  console.log('SCREENSHOT=' + SHOT)
  console.log('SMOKE_UI_DONE')
} finally {
  await app.close()
}
