import type { PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('blx-panel p-5', className)}>{children}</div>
}
