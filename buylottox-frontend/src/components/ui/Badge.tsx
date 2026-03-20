import { cn } from '../../utils/cn'

export function Badge({
  children,
  tone = 'gray',
}: {
  children: string
  tone?: 'gray' | 'green' | 'red' | 'yellow' | 'purple'
}) {
  const styles =
    tone === 'green'
      ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30'
      : tone === 'red'
      ? 'bg-rose-500/10 text-rose-200 border-rose-500/30'
      : tone === 'yellow'
      ? 'bg-amber-500/10 text-amber-200 border-amber-500/30'
      : tone === 'purple'
      ? 'bg-purple-500/10 text-purple-200 border-purple-500/30'
      : 'bg-white/5 text-blx-text border-white/10'

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', styles)}>
      {children}
    </span>
  )
}
