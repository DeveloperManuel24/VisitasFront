import { Container } from './container'
import { Gradient } from './gradient'
import { Logo } from './logo'
import { PlusGrid, PlusGridItem, PlusGridRow } from '@/components/plus-grid'

function Tagline() {
  return (
    <div className="text-left">
      <p className="text-sm font-medium text-gray-950">
        SkyNet Visitas
      </p>
      <p className="text-xs text-gray-600">
        Adiccion por la exelencia
      </p>
    </div>
  )
}

function Copyright() {
  return (
    <div className="text-[11px]/5 text-gray-500">
      © {new Date().getFullYear()} SkyNet Visitas. Todos los derechos reservados.
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-24">
      <Gradient className="relative">
        {/* fondo blanco suave dentro del gradiente */}
        <div className="absolute inset-2 rounded-4xl bg-white/80 ring-1 ring-black/5" />

        <Container className="relative">
          <PlusGrid className="py-8">
            {/* fila principal: logo + tagline + copyright */}
            <PlusGridRow className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Izquierda: logo + tagline */}
              <div className="flex items-center gap-3">
                <PlusGridItem className="flex items-center">
                  <Logo className="h-9" />
                </PlusGridItem>

                <PlusGridItem>
                  <Tagline />
                </PlusGridItem>
              </div>

              {/* Derecha: copyright */}
              <PlusGridItem className="text-center sm:text-right">
                <Copyright />
              </PlusGridItem>
            </PlusGridRow>
          </PlusGrid>
        </Container>
      </Gradient>
    </footer>
  )
}
