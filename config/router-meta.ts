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

export const routerMeta = {
  '/': {
    isBack: false,
    showMenu: 'hidden'
  },
  '/blog': {
    isBack: true,
    backPath: '/',
    showMenu: 'show',
    menuItems: [
      { label: '首页', href: '/' },
      { label: '博客', href: '/blog' }
    ]
  },
  '/blog/[id]': {
    isBack: true,
    backPath: '/blog',
    showMenu: 'show',
    menuItems: [
      { label: '首页', href: '/' },
      { label: '博客', href: '/blog' }
    ]
  }
} as const satisfies Record<string, RouteMeta>
