// src/app/unauthorized/page.tsx
import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/button"
import { Heading, Subheading } from "@/components/text"

export default function UnauthorizedPage() {
  return (
    <main className="bg-gray-50 min-h-dvh text-gray-950 overflow-hidden">
      <Container>
        <Navbar
          banner={
            <div className="flex items-center gap-1 rounded-full bg-red-800/40 px-3 py-0.5 text-sm/6 font-medium text-white">
              Acceso restringido
            </div>
          }
        />
      </Container>

      <Container className="pb-24">
        <div className="mt-24 max-w-xl">
          <Subheading>Sesión requerida</Subheading>

          <Heading as="h1" className="mt-2">
            No autorizado.
          </Heading>

          <p className="mt-4 text-sm/6 text-gray-600">
            Necesitas iniciar sesión para ver esta sección.
          </p>

          <div className="mt-8 flex gap-4">
            <Button href="/login">Ir al login</Button>
            <Button variant="secondary" href="/">
              Volver al inicio
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}
