import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { GradientBackground } from '@/components/gradient'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { Heading, Lead, Subheading } from '@/components/text'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  RssIcon,
} from '@heroicons/react/16/solid'
import { clsx } from 'clsx'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stay informed with product updates, company news, and insights on how to sell smarter at your company.',
}

/* ===================================================
   🔧 Mock Data (temporal, hasta que conectes tu backend)
   =================================================== */
const mockPosts = [
  {
    slug: 'visitas-inteligentes',
    title: 'Sistema de Visitas Inteligente',
    excerpt:
      'Descubre cómo optimizar la gestión de visitas con automatización y reportes dinámicos.',
    author: { name: 'Equipo de Desarrollo Bantrab' },
    publishedAt: '2025-10-23',
  },
  {
    slug: 'modulo-seguridad',
    title: 'Nuevo módulo de seguridad en el sistema',
    excerpt:
      'Integración con autenticación JWT y manejo de roles por microservicios.',
    author: { name: 'Equipo de Arquitectura' },
    publishedAt: '2025-10-22',
  },
]

const mockCategories = [
  { slug: 'novedades', title: 'Novedades' },
  { slug: 'actualizaciones', title: 'Actualizaciones' },
  { slug: 'tecnologia', title: 'Tecnología' },
]

const postsPerPage = 5

/* ===================================================
   🏷️ Categories Component
   =================================================== */
function Categories({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Menu>
        <MenuButton className="flex items-center justify-between gap-2 font-medium">
          {mockCategories.find(({ slug }) => slug === selected)?.title ||
            'Todas las categorías'}
          <ChevronUpDownIcon className="size-4 fill-gray-900" />
        </MenuButton>
        <MenuItems
          anchor="bottom start"
          className="min-w-40 rounded-lg bg-white p-1 shadow-lg ring-1 ring-gray-200"
        >
          <MenuItem>
            <Link
              href="/blog"
              data-selected={selected === undefined ? true : undefined}
              className="group grid grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-2 py-1 data-focus:bg-gray-950/5"
            >
              <CheckIcon className="hidden size-4 group-data-selected:block" />
              <p className="col-start-2 text-sm/6">Todas las categorías</p>
            </Link>
          </MenuItem>
          {mockCategories.map((category) => (
            <MenuItem key={category.slug}>
              <Link
                href={`/blog?category=${category.slug}`}
                data-selected={category.slug === selected ? true : undefined}
                className="group grid grid-cols-[16px_1fr] items-center gap-2 rounded-md px-2 py-1 data-focus:bg-gray-950/5"
              >
                <CheckIcon className="hidden size-4 group-data-selected:block" />
                <p className="col-start-2 text-sm/6">{category.title}</p>
              </Link>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      <Button variant="outline" href="/blog/feed.xml" className="gap-1">
        <RssIcon className="size-4" />
        RSS Feed
      </Button>
    </div>
  )
}

/* ===================================================
   📰 Posts Component
   =================================================== */
function Posts({ page }: { page: number }) {
  const posts = mockPosts.slice((page - 1) * postsPerPage, page * postsPerPage)

  if (posts.length === 0) {
    return <p className="mt-6 text-gray-500">No se encontraron publicaciones.</p>
  }

  return (
    <div className="mt-6">
      {posts.map((post) => (
        <div
          key={post.slug}
          className="relative grid grid-cols-1 border-b border-b-gray-100 py-10 first:border-t first:border-t-gray-200 max-sm:gap-3 sm:grid-cols-3"
        >
          <div>
            <div className="text-sm/5 text-gray-700 sm:font-medium">
              {new Date(post.publishedAt).toLocaleDateString('es-GT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            {post.author && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="text-sm/5 text-gray-700">
                  {post.author.name}
                </div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2 sm:max-w-2xl">
            <h2 className="text-sm/5 font-medium">{post.title}</h2>
            <p className="mt-3 text-sm/6 text-gray-500">{post.excerpt}</p>
            <div className="mt-4">
              <Link
                href={`/blog/${post.slug}`}
                className="flex items-center gap-1 text-sm/5 font-medium"
              >
                Leer más
                <ChevronRightIcon className="size-4 fill-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===================================================
   🔢 Pagination Component (mock)
   =================================================== */
function Pagination() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button variant="outline" disabled>
        <ChevronLeftIcon className="size-4" />
        Anterior
      </Button>
      <Button variant="outline" disabled>
        Siguiente
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}

/* ===================================================
   🧠 Blog Page
   =================================================== */
export default function Blog() {
  const page = 1

  return (
    <main className="overflow-hidden">
      <GradientBackground />
      <Container>
        <Navbar />
        <Subheading className="mt-16">Blog</Subheading>
        <Heading as="h1" className="mt-2">
          Novedades del sistema de visitas.
        </Heading>
        <Lead className="mt-6 max-w-3xl">
          Actualizaciones, noticias y mejoras implementadas en los sistemas de
          Bantrab.
        </Lead>
      </Container>

      <Container className="mt-16 pb-24">
        <Categories />
        <Posts page={page} />
        <Pagination />
      </Container>

      <Footer />
    </main>
  )
}
