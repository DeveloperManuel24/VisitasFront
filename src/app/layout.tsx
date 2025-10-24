import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: {
    template: '%s - Visitas',
    default: 'Visitas - Panel Administrativo',
  },
  description: 'Plataforma interna para la gestión de visitas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&display=swap"
        />
      </head>
      <body className="text-gray-950 antialiased bg-gray-50">
        {children}
        <Footer />
      </body>
    </html>
  )
}
