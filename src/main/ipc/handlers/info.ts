import { z } from 'zod'
import { ok, err } from '@shared/result'
import { getProjectInfo } from '../../services/projectInfoService'
import type { Registrar } from '../register'

export function registerInfoHandlers(reg: Registrar): void {
  reg('info:get', z.void(), async () => {
    try {
      return ok(await getProjectInfo())
    } catch (e) {
      return err('IO', e instanceof Error ? e.message : 'Could not read project info')
    }
  })
}
