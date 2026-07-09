import { goApiFetch, readApiResponse } from '@/lib/server/go-api'

export const PAGE_SIZE = 10

export type BlogTab = 'directories' | 'articles'

export type BlogCategory = {
  id: string
  name: string
  slug: string
  path: string
  description: string
  parentId?: string | null
}

export type BlogDirectoryOption = {
  id: string
  label: string
  path: string
}

export type ArticleStatus = 'publish' | 'private' | 'draft'

export type BlogArticle = {
  id: string
  title: string
  slug: string
  path: string
  description: string
  status: ArticleStatus
  categoryId: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  tags: BlogArticleTag[]
}

export type BlogArticleTag = {
  id: string
  name: string
}

export type BlogArticleDetail = BlogArticle & {
  content: string
}

export type BlogNode =
  | {
      type: 'directory'
      item: BlogCategory
    }
  | {
      type: 'article'
      item: BlogArticleDetail
    }

export type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

type PageResponse<T> = {
  items: T[]
  pagination: Pagination
}

const ROOT_CATEGORY: BlogCategory = {
  id: '',
  name: 'Blog',
  slug: '',
  path: '',
  description: '关于技术、编程和生活的一些想法。',
  parentId: null
}

export async function getCurrentCategory(path: string) {
  if (!path) {
    return ROOT_CATEGORY
  }

  try {
    const response = await goApiFetch(
      `/category/detail?path=${encodeURIComponent(path)}`,
      { auth: false }
    )
    const result = await readApiResponse<BlogCategory>(response)

    if (!response.ok || !result.data) {
      return null
    }

    return result.data
  } catch {
    return null
  }
}

export async function getChildDirectories(parentPath: string, page: number) {
  return readPage<BlogCategory>(
    `/category/children?parentPath=${encodeURIComponent(parentPath)}&page=${page}&pageSize=${PAGE_SIZE}`,
    { auth: false }
  )
}

export async function getArticles(categoryPath: string, page: number) {
  const result = await readPage<ArticleApiResponse>(
    `/article/list?categoryPath=${encodeURIComponent(categoryPath)}&page=${page}&pageSize=${PAGE_SIZE}`
  )

  return {
    ...result,
    items: result.items.map(normalizeArticle)
  }
}

export async function getArticleDetail(path: string) {
  try {
    const response = await goApiFetch(
      `/article/detail?path=${encodeURIComponent(path)}`
    )
    const result = await readApiResponse<
      Omit<ArticleApiResponse, 'content'> & { content: string }
    >(response)

    if (!response.ok || !result.data) {
      return null
    }

    return normalizeArticle(result.data)
  } catch {
    return null
  }
}

export async function getBlogNode(path: string): Promise<BlogNode | null> {
  const category = await getCurrentCategory(path)

  if (category) {
    return {
      type: 'directory',
      item: category
    }
  }

  if (!path) {
    return null
  }

  const article = await getArticleDetail(path)

  if (!article) {
    return null
  }

  return {
    type: 'article',
    item: article
  }
}

export async function getDirectoryOptions() {
  try {
    const response = await goApiFetch('/category/options', { auth: false })
    const result = await readApiResponse<BlogDirectoryOption[]>(response)

    if (!response.ok || !result.data) {
      return []
    }

    return result.data
  } catch {
    return []
  }
}

export function normalizeBlogPath(slug: string[] | undefined) {
  return (slug ?? []).map((segment) => segment.trim()).filter(Boolean).join('/')
}

export function normalizePage(page: string | undefined) {
  const parsedPage = Number(page)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

export function normalizeTab(tab: string | undefined): BlogTab {
  return tab === 'articles' ? 'articles' : 'directories'
}

export function getBlogPathHref(path: string, tab: BlogTab, page = 1) {
  const pathname = path ? `/blog/${path}` : '/blog'
  const params = new URLSearchParams()

  params.set('tab', tab)
  params.set('page', String(page))

  return `${pathname}?${params.toString()}`
}

function emptyPage<T>(page: number): PageResponse<T> {
  return {
    items: [],
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: 0,
      totalPages: 1,
      hasPreviousPage: page > 1,
      hasNextPage: false
    }
  }
}

async function readPage<T>(path: string, init?: { auth?: boolean }) {
  const page = getPageFromPath(path)

  try {
    const response = await goApiFetch(path, init)
    const result = await readApiResponse<PageResponse<T>>(response)

    if (!response.ok || !result.data) {
      return emptyPage<T>(page)
    }

    return result.data
  } catch {
    return emptyPage<T>(page)
  }
}

function getPageFromPath(path: string) {
  const [, query = ''] = path.split('?')
  const page = new URLSearchParams(query).get('page') ?? undefined

  return normalizePage(page)
}

type ArticleApiResponse = Omit<
  BlogArticle,
  'createdAt' | 'updatedAt' | 'publishedAt' | 'tags'
> & {
  createdAt?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
  tags?: BlogArticleTag[] | null
}

function normalizeArticle<T extends ArticleApiResponse>(article: T) {
  return {
    ...article,
    createdAt: formatArticleDate(article.createdAt),
    updatedAt: formatArticleDate(article.updatedAt),
    publishedAt: formatArticleDate(article.publishedAt),
    tags: article.tags ?? []
  }
}

function formatArticleDate(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().slice(0, 10)
}
