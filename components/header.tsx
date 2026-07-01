'use client'

import { ChevronLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatedThemeToggler } from './ui/animated-theme-toggler'
import { Button } from './ui/button'
import { routerMeta } from '@/config/router-meta'

type RouterMeta = (typeof routerMeta)[keyof typeof routerMeta]

const routeMetaEntries = Object.entries(routerMeta) as Array<
  [keyof typeof routerMeta, RouterMeta]
>

const getRouteMeta = (pathname: string) => {
  const exactMatch = routerMeta[pathname as keyof typeof routerMeta]

  if (exactMatch) {
    return exactMatch
  }

  return routeMetaEntries.find(([route]) => {
    const routeSegments = route.split('/').filter(Boolean)
    const pathnameSegments = pathname.split('/').filter(Boolean)

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

export const Header = () => {
  const pathname = usePathname()
  const router = useRouter()

  const meta = getRouteMeta(pathname)

  const showBack = meta?.isBack

  const backPath = meta && 'backPath' in meta ? meta.backPath : undefined

  const handleBack = () => {
    if (backPath) {
      router.push(backPath)
      return
    }

    router.back()
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        {showBack && (
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg inline-flex items-center gap-1 mb-6 group"
          >
            <ChevronLeft className="size-3.5 group-hover:-translate-x-px transition-transform" />
            返回
          </Button>
        )}
      </div>

      <AnimatedThemeToggler duration={600} />
    </div>
  )
}
