import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }
) {
  const { className, variant = 'primary', ...rest } = props

  if (variant === 'primary') return <button className={cn('blx-btn-primary', className)} {...rest} />
  if (variant === 'ghost') return <button className={cn('blx-btn-ghost', className)} {...rest} />

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl border border-blx-border bg-white/5 px-4 py-2 text-sm font-medium text-blx-text transition hover:bg-white/8 disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    />
  )
}
