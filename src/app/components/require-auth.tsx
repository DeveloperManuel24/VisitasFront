"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isAuthenticated } from "../../../api/Auth/apiAuth"

/**
 * Envuelve páginas privadas.
 * Si NO hay token => redirige a /unauthorized
 */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    // chequeo de auth en el cliente
    if (!isAuthenticated()) {
      router.replace("/unauthorized")
      return
    }
    setAllowed(true)
  }, [router])

  // Mientras validamos, no parpadees toda la UI.
  if (!allowed) {
    return null // aquí podrías poner un loader/spinner si querés
  }

  return <>{children}</>
}
