import { BentoCard } from '@/components/bento-card'
import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Gradient } from '@/components/gradient'
import { Keyboard } from '@/components/keyboard'
import { LinkedAvatars } from '@/components/linked-avatars'
import { LogoCluster } from '@/components/logo-cluster'
import { LogoTimeline } from '@/components/logo-timeline'
import { Map } from '@/components/map'
import { Navbar } from '@/components/navbar'
import { Testimonials } from '@/components/testimonials'
import { Heading, Subheading } from '@/components/text'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SkyNet Visitas',
  description:
    'Plataforma interna para la gestión de visitas técnicas, clientes, usuarios y evidencias.',
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar
          banner={
            <div className="flex items-center gap-1 rounded-full bg-blue-950/35 px-3 py-0.5 text-sm/6 font-medium text-white">
              SkyNet Visitas — Plataforma de control
              <ChevronRightIcon className="size-4" />
            </div>
          }
        />

        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
          <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
            Gestiona cada visita.
          </h1>

          <p className="mt-8 max-w-xl text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
            Controla clientes, usuarios y evidencias desde un solo lugar.
          </p>

          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap">
            <Button href="/visitas">Ir a Visitas</Button>

            <Button variant="secondary" href="/clientes">
              Ver Clientes
            </Button>

            {/* 👇 NUEVO acceso directo Usuarios */}
            <Button variant="secondary" href="/usuarios">
              Ver Usuarios
            </Button>

            <Button variant="secondary" href="/roles">
              Ver Roles
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

/* -------- Rail desplazable (módulos principales) -------- */
function RailSection() {
  return (
    <Container>
      <Subheading>Módulos</Subheading>
      <Heading as="h3" className="mt-2 max-w-3xl">
        Accesos rápidos a funcionalidades.
      </Heading>

      <div className="mt-10 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 sm:mt-16 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
        {/* Visitas */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Visitas"
            title="Control de visitas técnicas"
            description={
              <div>
                Crea, edita y da seguimiento en tiempo real. Check-in, check-out
                y registro de evidencias.
                <div className="mt-4 flex gap-3">
                  <Button href="/visitas">Abrir módulo</Button>
                  <Button variant="secondary" href="/visitas?tour=1">
                    Ver recorrido
                  </Button>
                </div>
              </div>
            }
            graphic={
              <div className="h-80 bg-[url(/screenshots/networking.png)] bg-[length:851px_344px] bg-no-repeat" />
            }
            fade={['top']}
            className="max-lg:rounded-t-4xl lg:rounded-4xl"
          />
        </div>

        {/* Clientes */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Clientes"
            title="Gestión de clientes"
            description={
              <div>
                Búsqueda, detalle fiscal y operativo; cuentas y validaciones.
                <div className="mt-4 flex gap-3">
                  <Button href="/clientes">Abrir módulo</Button>
                  <Button variant="secondary" href="/clientes?tour=1">
                    Ver recorrido
                  </Button>
                </div>
              </div>
            }
            graphic={
              <div className="absolute inset-0 bg-[url(/screenshots/profile.png)] bg-[length:1000px_560px] bg-[left_-109px_top_-112px] bg-no-repeat" />
            }
            fade={['bottom']}
            className="lg:rounded-4xl"
          />
        </div>

        {/* Usuarios */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Usuarios"
            title="Administración de usuarios"
            description={
              <div>
                Altas/bajas, supervisor asignado, estado activo/inactivo,
                foto de perfil y rol de acceso.
                <div className="mt-4 flex gap-3">
                  <Button href="/usuarios">Abrir módulo</Button>
                  <Button variant="secondary" href="/usuarios?tour=1">
                    Ver recorrido
                  </Button>
                </div>
              </div>
            }
            graphic={
              <div className="flex size-full items-center justify-center pt-10 pl-10">
                <Keyboard highlighted={['LeftCommand', 'LeftShift', 'D']} />
              </div>
            }
            className="lg:rounded-4xl"
          />
        </div>

        {/* Roles */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Roles"
            title="Configuración de roles"
            description={
              <div>
                Perfiles y permisos granulares por área y acción.
                <div className="mt-4 flex gap-3">
                  <Button href="/roles">Abrir módulo</Button>
                  <Button variant="secondary" href="/roles?tour=1">
                    Ver recorrido
                  </Button>
                </div>
              </div>
            }
            graphic={<LogoTimeline />}
            className="lg:rounded-4xl"
          />
        </div>

        {/* Evidencias */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Evidencias"
            title="Registro visual de campo"
            description={
              <div>
                Fotografías, documentos e informes por visita.
                <div className="mt-4 flex gap-3">
                  <Button href="/evidencias">Abrir módulo</Button>
                  <Button variant="secondary" href="/evidencias?tour=1">
                    Ver recorrido
                  </Button>
                </div>
              </div>
            }
            graphic={<LogoCluster />}
            className="lg:rounded-4xl"
          />
        </div>

        {/* Mapa */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Mapa"
            title="Cobertura y zonas de trabajo"
            description="Visualiza agencias, rutas y ubicaciones de visitas."
            graphic={<Map />}
            className="lg:rounded-4xl"
          />
        </div>
      </div>
    </Container>
  )
}

/* ------------- Sección oscura ------------- */
function DarkBentoSection() {
  return (
    <div className="mx-2 mt-2 rounded-4xl bg-gray-900 py-32">
      <Container>
        <Subheading dark>Colaboración</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Comunicación y coordinación sin fricción.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Networking"
            title="Seguimiento en tiempo real"
            description="Estado de las visitas y alertas operativas en vivo."
            graphic={
              <div className="h-80 bg-[url(/screenshots/networking.png)] bg-[length:851px_344px] bg-no-repeat" />
            }
            fade={['top']}
            className="max-lg:rounded-t-4xl lg:col-span-4 lg:rounded-tl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Integraciones"
            title="Conecta tus herramientas"
            description="CRM, correo y almacenamiento documental."
            graphic={<LogoTimeline />}
            className="z-10 overflow-visible! lg:col-span-2 lg:rounded-tr-4xl"
          />
          <BentoCard
            dark
            eyebrow="Reuniones"
            title="Coordinación de equipos"
            description="Agenda y recordatorios para el equipo de campo."
            graphic={<LinkedAvatars />}
            className="lg:col-span-2 lg:rounded-bl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Engagement"
            title="Reportes ejecutivos"
            description="Genera informes claros para dirección y auditoría."
            graphic={
              <div className="h-80 bg-[url(/screenshots/engagement.png)] bg-[length:851px_344px] bg-no-repeat" />
            }
            fade={['top']}
            className="max-lg:rounded-b-4xl lg:col-span-4 lg:rounded-br-4xl"
          />
        </div>
      </Container>
    </div>
  )
}

/* ---------------- Home ---------------- */
export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />

      <main>
        <div className="bg-linear-to-b from-white from-50% to-gray-100 py-32">
          <RailSection />
        </div>

        <DarkBentoSection />
      </main>

      <Testimonials />
      {/* Footer viene desde RootLayout */}
    </div>
  )
}
