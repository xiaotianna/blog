'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { RouteMeta } from '@/config/router-meta'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

type MenuProps = {
  meta?: RouteMeta
}

function RouteMenuItems({
  meta
}: {
  meta: RouteMeta
}) {
  const pathname = usePathname()
  const menuItems = meta.menuItems ?? []

  if (menuItems.length === 0) {
    return null
  }

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <NavigationMenu
      viewport={false}
      className='justify-start'
    >
      <NavigationMenuList className='justify-start gap-1'>
        {menuItems.map((item) => (
          <NavigationMenuItem key={`${item.href}-${item.label}`}>
            <NavigationMenuLink
              asChild
              className={cn(
                'text-sm py-1 px-3 border-none inline-flex items-center gap-1 group text-muted-foreground font-normal',
                isActiveRoute(item.href) && 'text-foreground font-semibold'
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function Menu({ meta }: MenuProps) {
  const showMenu = meta?.showMenu ?? 'hidden'

  if (!meta || showMenu === 'hidden') {
    return null
  }

  if (showMenu === 'show') {
    return <RouteMenuItems meta={meta} />
  }

  return null
}
