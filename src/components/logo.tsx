// src/components/logo.tsx
import { clsx } from 'clsx'

export function Mark(props: React.ComponentPropsWithoutRef<'svg'>) {
  // 👇 deja tal cual el SVG existente de tu ícono si ya lo tienes
  // (este es un placeholder por si tu archivo tenía algo diferente)
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

// ✅ Wordmark “SkyNet” (antes decía Radiant)
export function Logo(props: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={clsx('flex items-center gap-2', props.className)}>
      <Mark className="h-6 w-6 fill-current" />
      <span className="text-base font-medium tracking-tight">SkyNet</span>
    </div>
  )
}

export default Logo
