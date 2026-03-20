import { db } from './db'
import type { ApiResult } from '../types/shared'

export type Draw = {
  id: string
  title: string
  drawAt: string
  status: 'OPEN' | 'CLOSED'
  winningNumbers?: number[]
}

export async function getActive(): Promise<ApiResult<Draw>> {
  await sleep(150)
  const d = db.draws.find(x => x.status === 'OPEN') ?? db.draws[0]
  return { ok: true, data: d }
}

export async function listAll(): Promise<ApiResult<Draw[]>> {
  await sleep(150)
  return { ok: true, data: [...db.draws].sort((a,b)=> b.drawAt.localeCompare(a.drawAt)) }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
