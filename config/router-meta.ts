export const routerMeta = {
  '/': {
    isBack: false,
  },
  '/blog': {
    isBack: true,
    backPath: '/',
  },
  '/blog/[id]': {
    isBack: true,
    backPath: '/blog',
  }
} as const
