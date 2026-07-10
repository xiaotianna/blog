export const siteConfig = {
  author: 'T1an',
  description: '一个关于个人经历和对技术、编程以及生活思考的博客。',
  keywords: [
    'T1an',
    '个人博客',
    '前端开发',
    '全栈开发',
    'TypeScript',
    'React',
    'Next.js',
    'Go',
    'AI'
  ],
  locale: 'zh_CN',
  name: "小T1an's Blog",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    'http://localhost:3000'
} as const

export const siteUrl = new URL(ensureTrailingSlash(siteConfig.url))

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}
