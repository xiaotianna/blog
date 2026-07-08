'use client'

import { BlogMobileNavigationTrigger } from '@/features/blog/blog-mobile-navigation-trigger'
import {
  routerMeta,
  type HeaderAction,
  type RouteMeta
} from '@/config/router-meta'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { HeaderSearchDialog } from './header-search-dialog'
import { Menu } from '@/components/menu'
import { AnimatedThemeToggler } from './ui/animated-theme-toggler'
import { Button } from './ui/button'

type HeaderClientProps = {
  authAction?: ReactNode
}

const routeMetaEntries = Object.entries(routerMeta) as Array<
  [keyof typeof routerMeta, RouteMeta]
>

const FLICKERING_GRID_VISIBLE_THRESHOLD = 76
const defaultHeaderActions: readonly HeaderAction[] = [
  'back',
  'menu',
  'blog-tree',
  'auth',
  'search',
  'theme'
]

const getRouteMeta = (pathname: string) => {
  const exactMatch = routerMeta[pathname as keyof typeof routerMeta]

  if (exactMatch) {
    return exactMatch
  }

  return routeMetaEntries.find(([route]) => {
    const routeSegments = route.split('/').filter(Boolean)
    const pathnameSegments = pathname.split('/').filter(Boolean)
    const catchAllIndex = routeSegments.findIndex(
      (segment) => segment.startsWith('[...') || segment.startsWith('[[...')
    )

    if (catchAllIndex >= 0) {
      return routeSegments
        .slice(0, catchAllIndex)
        .every((segment, index) => segment === pathnameSegments[index])
    }

    return (
      routeSegments.length === pathnameSegments.length &&
      routeSegments.every(
        (segment, index) =>
          segment.startsWith('[') ||
          segment === pathnameSegments[index]
      )
    )
  })?.[1]
}

const shouldRenderHeaderAction = (
  meta: RouteMeta | undefined,
  action: HeaderAction
) => (meta?.headerActions ?? defaultHeaderActions).includes(action)

function getBlogBackPath(pathname: string) {
  if (pathname === '/blog') {
    return '/'
  }

  if (!pathname.startsWith('/blog/')) {
    return undefined
  }

  const parentPath = pathname.split('/').filter(Boolean).slice(1, -1).join('/')

  return parentPath ? `/blog/${parentPath}` : '/blog'
}

export function HeaderClient({ authAction }: HeaderClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  const meta = getRouteMeta(pathname)

  const showBack = meta?.isBack && shouldRenderHeaderAction(meta, 'back')
  const showMenu = shouldRenderHeaderAction(meta, 'menu')

  const backPath = meta && 'backPath' in meta ? meta.backPath : undefined

  const handleBack = () => {
    const blogBackPath = getBlogBackPath(pathname)

    if (blogBackPath) {
      router.push(blogBackPath)
      return
    }

    if (backPath) {
      router.push(backPath)
      return
    }

    router.back()
  }

  useEffect(() => {
    let frameId: number | null = null

    const updateScrollState = () => {
      frameId = null
      setIsScrolled(window.scrollY > FLICKERING_GRID_VISIBLE_THRESHOLD)
    }

    const handleScroll = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateScrollState)
    }

    updateScrollState()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        'sticky top-3 z-50 -mx-3 mb-6 flex items-center justify-between rounded-xl border px-3 py-2 transition-all duration-300 max-md:top-2 max-md:-mx-2 max-md:px-2',
        isScrolled
          ? 'border-border/60 bg-background/40 backdrop-blur-md'
          : 'border-transparent bg-transparent shadow-none'
      )}
    >
      <div className='flex min-w-0 items-center gap-2'>
        {showBack && (
          <Button
            type='button'
            onClick={handleBack}
            variant='outline'
            className='inline-flex items-center gap-1 rounded-lg border border-border text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ChevronLeft className='size-3.5 transition-transform group-hover:-translate-x-px' />
            返回
          </Button>
        )}
        {showMenu && <Menu meta={meta} />}
      </div>

      <div className='flex items-center gap-2'>
        {shouldRenderHeaderAction(meta, 'blog-tree') && (
          <Suspense fallback={null}>
            <BlogMobileNavigationTrigger />
          </Suspense>
        )}
        {shouldRenderHeaderAction(meta, 'auth') && authAction}
        {shouldRenderHeaderAction(meta, 'search') && <HeaderSearchDialog />}
        {shouldRenderHeaderAction(meta, 'theme') && (
          <AnimatedThemeToggler duration={600} />
        )}
      </div>
    </div>
  )
}
