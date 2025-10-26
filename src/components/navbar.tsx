'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { Bars2Icon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

import { Link } from './link'
import { Logo } from './logo'
import { PlusGrid, PlusGridItem, PlusGridRow } from './plus-grid'

import { useAuth } from '@/app/components/auth-context'

/*
Permisos finales:
- ADMINISTRADOR:
    Clientes, Visitas (general), Mis visitas, Usuarios, Roles
- SUPERVISOR:
    Clientes, Visitas (general), Usuarios
    (NO Mis visitas, NO Roles)
- TECNICO:
    Mis visitas
    (NO Clientes, NO Visitas general, NO Usuarios, NO Roles)
*/
function buildPermissions(rolesUpper: string[]) {
  const isAdmin = rolesUpper.includes('ADMINISTRADOR')
  const isSupervisor = rolesUpper.includes('SUPERVISOR')
  const isTecnico = rolesUpper.includes('TECNICO')

  return {
    canClientes: isAdmin || isSupervisor,
    canVisitasGeneral: isAdmin || isSupervisor,
    canVisitasTecnico: isAdmin || isTecnico,
    canUsuarios: isAdmin || isSupervisor,
    canRoles: isAdmin,
  }
}

/* ======================= DESKTOP NAV ======================= */
function DesktopNav() {
  const { roles, logout, authReady } = useAuth()

  // caso SSR (authReady=false): no muestres links sensibles todavía
  if (!authReady) {
    return (
      <nav className="relative hidden lg:flex items-center">
        <PlusGridItem className="relative flex">
          <button
            disabled
            className="flex items-center px-4 py-3 text-base font-medium text-gray-400 cursor-wait"
          >
            …
          </button>
        </PlusGridItem>
      </nav>
    )
  }

  const rolesUpper = Array.isArray(roles)
    ? roles.map((r) => String(r).toUpperCase())
    : []
  const perms = buildPermissions(rolesUpper)

  return (
    <nav className="relative hidden lg:flex items-center">
      {perms.canClientes && (
        <PlusGridItem className="relative flex">
          <Link
            href="/clientes"
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/2.5"
          >
            Clientes
          </Link>
        </PlusGridItem>
      )}

      {perms.canVisitasGeneral && (
        <PlusGridItem className="relative flex">
          <Link
            href="/visitas"
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/2.5"
          >
            Visitas
          </Link>
        </PlusGridItem>
      )}

      {perms.canVisitasTecnico && (
        <PlusGridItem className="relative flex">
          <Link
            href="/visitas/tecnico"
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/2.5"
          >
            Mis visitas
          </Link>
        </PlusGridItem>
      )}

      {perms.canUsuarios && (
        <PlusGridItem className="relative flex">
          <Link
            href="/usuarios"
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/2.5"
          >
            Usuarios
          </Link>
        </PlusGridItem>
      )}

      {perms.canRoles && (
        <PlusGridItem className="relative flex">
          <Link
            href="/roles"
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/2.5"
          >
            Roles
          </Link>
        </PlusGridItem>
      )}

      {/* Logout SIEMPRE visible */}
      <PlusGridItem className="relative flex">
        <button
          onClick={logout}
          className="flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 data-hover:bg-black/2.5"
        >
          Cerrar sesión
        </button>
      </PlusGridItem>
    </nav>
  )
}

/* ======================= MOBILE NAV BUTTON ======================= */
function MobileNavButton() {
  return (
    <DisclosureButton
      className="flex size-12 items-center justify-center self-center rounded-lg data-hover:bg-black/5 lg:hidden"
      aria-label="Abrir menú"
    >
      <Bars2Icon className="size-6" />
    </DisclosureButton>
  )
}

/* ======================= MOBILE NAV PANEL ======================= */
function MobileNav() {
  const { roles, logout, authReady } = useAuth()

  // SSR first paint → authReady false → panel bloqueado (sin fugas de opciones)
  if (!authReady) {
    return (
      <DisclosurePanel className="lg:hidden">
        <div className="flex flex-col gap-6 py-4">
          <motion.div
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.15,
              ease: 'easeInOut',
              rotateX: { duration: 0.3, delay: 0 },
            }}
          >
            <span className="text-base font-medium text-gray-400">
              …
            </span>
          </motion.div>

          <motion.div
            key="logout"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.15,
              ease: 'easeInOut',
              rotateX: { duration: 0.3, delay: 0.2 },
            }}
          >
            <button
              disabled
              className="text-base font-medium text-gray-400 text-left cursor-wait"
            >
              Cerrar sesión
            </button>
          </motion.div>
        </div>

        <div className="absolute left-1/2 w-screen -translate-x-1/2">
          <div className="absolute inset-x-0 top-0 border-t border-black/5" />
          <div className="absolute inset-x-0 top-2 border-t border-black/5" />
        </div>
      </DisclosurePanel>
    )
  }

  const rolesUpper = Array.isArray(roles)
    ? roles.map((r) => String(r).toUpperCase())
    : []
  const perms = buildPermissions(rolesUpper)

  function MobileItem({
    delay,
    href,
    label,
  }: {
    delay: number
    href: string
    label: string
  }) {
    return (
      <motion.div
        initial={{ opacity: 0, rotateX: -90 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{
          duration: 0.15,
          ease: 'easeInOut',
          rotateX: { duration: 0.3, delay: delay * 0.1 },
        }}
      >
        <Link
          href={href}
          className="text-base font-medium text-gray-950"
        >
          {label}
        </Link>
      </motion.div>
    )
  }

  const mobileLinks: { href: string; label: string }[] = []

  if (perms.canClientes)
    mobileLinks.push({ href: '/clientes', label: 'Clientes' })
  if (perms.canVisitasGeneral)
    mobileLinks.push({ href: '/visitas', label: 'Visitas' })
  if (perms.canVisitasTecnico)
    mobileLinks.push({
      href: '/visitas/tecnico',
      label: 'Mis visitas',
    })
  if (perms.canUsuarios)
    mobileLinks.push({ href: '/usuarios', label: 'Usuarios' })
  if (perms.canRoles)
    mobileLinks.push({ href: '/roles', label: 'Roles' })

  return (
    <DisclosurePanel className="lg:hidden">
      <div className="flex flex-col gap-6 py-4">
        {mobileLinks.map((item, idx) => (
          <MobileItem
            key={item.href}
            delay={idx}
            href={item.href}
            label={item.label}
          />
        ))}

        <motion.div
          key="logout"
          initial={{ opacity: 0, rotateX: -90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{
            duration: 0.15,
            ease: 'easeInOut',
            rotateX: {
              duration: 0.3,
              delay: mobileLinks.length * 0.1,
            },
          }}
        >
          <button
            onClick={logout}
            className="text-base font-medium text-red-600 hover:text-red-700 text-left"
          >
            Cerrar sesión
          </button>
        </motion.div>
      </div>

      <div className="absolute left-1/2 w-screen -translate-x-1/2">
        <div className="absolute inset-x-0 top-0 border-t border-black/5" />
        <div className="absolute inset-x-0 top-2 border-t border-black/5" />
      </div>
    </DisclosurePanel>
  )
}

/* ======================= NAVBAR WRAPPER ======================= */
export function Navbar({ banner }: { banner?: React.ReactNode }) {
  return (
    <Disclosure as="header" className="pt-12 sm:pt-16">
      <PlusGrid>
        <PlusGridRow className="relative flex justify-between">
          {/* IZQUIERDA: logo + banner */}
          <div className="relative flex gap-6">
            <PlusGridItem className="py-3">
              <Link href="/" title="Inicio">
                <Logo className="h-9" />
              </Link>
            </PlusGridItem>

            {banner && (
              <div className="relative hidden items-center py-3 lg:flex">
                {banner}
              </div>
            )}
          </div>

          {/* DERECHA desktop */}
          <DesktopNav />

          {/* HAMBURGUESA mobile */}
          <MobileNavButton />
        </PlusGridRow>
      </PlusGrid>

      {/* NAV MÓVIL DESPLEGABLE */}
      <MobileNav />
    </Disclosure>
  )
}
