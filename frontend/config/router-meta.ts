export type ShowMenu = 'show' | 'hidden' | 'custom'
export type HeaderAction =
  | 'back'
  | 'menu'
  | 'blog-tree'
  | 'search'
  | 'auth'
  | 'theme'

export type MenuItem = {
  label: string
  href: string
}

export type RouteMeta = {
  isBack: boolean
  backPath?: string
  headerActions?: readonly HeaderAction[]
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
    headerActions: ['back', 'menu', 'auth', 'search', 'theme'],
    showMenu: 'show',
    menuItems: baseMenuItems
  },
  '/blog/[[...slug]]': {
    isBack: true,
    backPath: '/blog',
    headerActions: ['back', 'menu', 'auth', 'search', 'theme'],
    showMenu: 'show',
    menuItems: baseMenuItems
  },
  '/post/[...slug]': {
    isBack: true,
    headerActions: ['back', 'menu', 'blog-tree', 'auth', 'search', 'theme'],
    showMenu: 'show',
    menuItems: baseMenuItems
  },
  '/login': {
    isBack: true,
    backPath: '/',
    headerActions: ['theme'],
    showMenu: 'show',
    menuItems: baseMenuItems
  }
} as const satisfies Record<string, RouteMeta>
