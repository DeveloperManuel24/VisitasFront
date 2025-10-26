// src/app/unauthorized/page.tsx
'use client'

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center text-gray-800 p-8">
      <div className="text-3xl font-semibold text-red-600">
        Acceso denegado
      </div>
      <p className="mt-4 text-sm text-gray-600 max-w-sm">
        No tenés permisos para ver esta sección.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
      >
        Volver al panel
      </Link>
    </main>
  )
}
