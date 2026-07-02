export type ShowMenu = 'show' | 'hidden' | 'custom'

export type MenuItem = {
  label: string
  href: string
}

export type RouteMeta = {
  isBack: boolean
  backPath?: string
  showMenu?: ShowMenu
  menuItems?: readonly MenuItem[]
}

const baseMenuItems: readonly MenuItem[] = [
  { label: '首页', href: '/' },
  { label: '博客', href: '/blog' }
]

export const routerMeta = {
  '/': {
    isBack: false,
    showMenu: 'hidden'
  },
  '/blog': {
    isBack: true,
    backPath: '/',
    showMenu: 'show',
    menuItems: baseMenuItems
  },
  '/blog/[id]': {
    isBack: true,
    backPath: '/blog',
    showMenu: 'show',
    menuItems: baseMenuItems
  }
} as const satisfies Record<string, RouteMeta>
