'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const BARE_ROUTES = new Set<string>(['/login'])

export function AppChrome({
  children,
  navbar,
  footer,
}: {
  children: ReactNode
  navbar?: ReactNode
  footer?: ReactNode
}) {
  const pathname = usePathname()
  const bare = BARE_ROUTES.has(pathname)

  if (bare) {
    // En /login no mostramos Navbar/Footer
    return <>{children}</>
  }

  return (
    <>
      {navbar}
      <main>{children}</main>
      {footer}
    </>
  )
}
