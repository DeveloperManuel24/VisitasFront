import { BentoCard } from '@/components/bento-card'
import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Gradient } from '@/components/gradient'
import { LinkedAvatars } from '@/components/linked-avatars'
import { LogoTimeline } from '@/components/logo-timeline'
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

          {/* Botones de acceso rápido */}
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap">
            <Button href="/visitas">Ir a Visitas</Button>

            <Button variant="secondary" href="/clientes">
              Ver Clientes
            </Button>

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

      {/* carrusel horizontal */}
      <div className="mt-10 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2 sm:mt-16 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
        {/* VISITAS */}
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
                </div>
              </div>
            }
            graphic={
              <div className="relative h-80 overflow-hidden rounded-xl ring-1 ring-black/10 bg-black">
                <img
                  src="/visita.jpg"
                  alt="Técnico realizando una visita en sitio"
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent mix-blend-screen" />
                <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-[11px]/4 font-medium text-white ring-1 ring-white/20 shadow-lg">
                  En sitio • Check-in activo
                </div>
              </div>
            }
            fade={['top']}
            className="max-lg:rounded-t-4xl lg:rounded-4xl"
          />
        </div>

        {/* CLIENTES */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Clientes"
            title="Gestión de clientes"
            description={
              <div>
                Registro de clientes, datos de contacto, dirección y asignación
                de técnico responsable.
                <div className="mt-4 flex gap-3">
                  <Button href="/clientes">Abrir módulo</Button>
                </div>
              </div>
            }
            graphic={
              <div className="relative h-80 overflow-hidden rounded-xl ring-1 ring-black/10 bg-white">
                <img
                  src="/clientes.webp"
                  alt="Ficha del cliente / información de contacto"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute left-4 top-4 w-[220px] rounded-lg bg-white/80 p-3 text-[11px]/5 text-gray-700 shadow-xl ring-1 ring-black/10 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
                      <img
                        src="/clientes.webp"
                        alt="Cliente avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="text-xs leading-tight text-gray-700">
                      <div className="font-semibold text-gray-900 text-sm leading-tight">
                        Agencia Central Zona 1
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Responsable: Carlos Peña
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Tel. (502) 1234-5678
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                    <div>
                      <div className="text-[10px]/4 uppercase text-gray-400 font-medium">
                        Dirección
                      </div>
                      <div className="text-gray-800 text-[11px]/5">
                        6a avenida 12-34 zona 5
                        <br />
                        Cdad. de Guatemala
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px]/4 uppercase text-gray-400 font-medium">
                        Técnico asignado
                      </div>
                      <div className="text-gray-800 text-[11px]/5">
                        Kevin López
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px]/4 uppercase text-gray-400 font-medium">
                        Última visita
                      </div>
                      <div className="text-gray-800 text-[11px]/5">
                        25/10/2025 • 14:20
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px]/4 uppercase text-gray-400 font-medium">
                        Estado
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px]/5 text-emerald-600 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Activo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            className="lg:rounded-4xl"
          />
        </div>

        {/* USUARIOS */}
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
                </div>
              </div>
            }
            graphic={
              <div className="relative flex h-80 flex-col overflow-hidden rounded-xl bg-gray-900 ring-1 ring-white/10 text-white">
                <img
                  src="/usuarios.jpg"
                  alt="Equipo interno / personal operativo"
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />

                <div className="relative flex items-center gap-3 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                    <img
                      src="/usuarios.jpg"
                      alt="Usuario interno"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="text-xs leading-tight">
                    <div className="font-semibold text-white text-sm leading-tight">
                      María González
                    </div>
                    <div className="text-[11px] text-white/60">
                      Supervisor • Activa
                    </div>
                  </div>

                  <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px]/4 font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                    ONLINE
                  </span>
                </div>

                <div className="relative flex-1 grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 text-[11px]/5 text-white">
                  <div>
                    <div className="text-[10px]/4 uppercase text-white/40 font-medium">
                      Rol
                    </div>
                    <div className="text-white font-medium">TÉCNICO</div>
                  </div>

                  <div>
                    <div className="text-[10px]/4 uppercase text-white/40 font-medium">
                      Reporta a
                    </div>
                    <div className="text-white font-medium">
                      Carlos Peña
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px]/4 uppercase text-white/40 font-medium">
                      Último acceso
                    </div>
                    <div className="text-white font-medium">
                      25/10/2025 • 08:13
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px]/4 uppercase text-white/40 font-medium">
                      Estado
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px]/5 text-emerald-400 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Activo
                    </div>
                  </div>
                </div>

                <div className="relative mt-auto flex items-center gap-2 border-t border-white/10 bg-black/40 px-4 py-3 text-[10px]/4 text-white/60 backdrop-blur-sm">
                  <span className="rounded-md border border-white/20 bg-white/5 px-2 py-1 font-medium text-[10px]/4 text-white shadow-sm">
                    Reset pass
                  </span>
                  <span className="rounded-md border border-white/20 bg-white/5 px-2 py-1 font-medium text-[10px]/4 text-white shadow-sm">
                    Desactivar
                  </span>
                </div>
              </div>
            }
            className="lg:rounded-4xl"
          />
        </div>

        {/* ROLES */}
        <div className="snap-start shrink-0 w-[min(92vw,560px)]">
          <BentoCard
            eyebrow="Roles"
            title="Configuración de roles"
            description={
              <div>
                Perfiles y permisos granulares por área y acción. Define quién
                puede ver, editar o aprobar cada parte del sistema.
                <div className="mt-4 flex gap-3">
                  <Button href="/roles">Abrir módulo</Button>
                </div>
              </div>
            }
            graphic={
              <div className="relative h-80 overflow-hidden rounded-xl ring-1 ring-black/10 bg-white">
                <img
                  src="/roles.webp"
                  alt="Pantalla de permisos y roles"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-[2px]" />
                <div className="absolute bottom-4 left-4 rounded-md bg-black/70 px-2 py-1 text-[10px]/4 font-medium text-white ring-1 ring-white/20 shadow-md">
                  Permisos granulares
                </div>
              </div>
            }
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
    <div className="mx-2 mt-2 rounded-4xl bg-gray-900 py-8 sm:py-12">
      <Container className="max-w-4xl mx-auto">
        <Subheading dark>Colaboración</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Comunicación y coordinación
          <br />
          sin fricción.
        </Heading>

        <div className="mt-8 sm:mt-10">
          <BentoCard
            dark
            eyebrow="Reuniones"
            title="Coordinación de equipos"
            description="Agenda y recordatorios para el equipo de campo."
            graphic={<LinkedAvatars />}
            className="rounded-4xl"
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
