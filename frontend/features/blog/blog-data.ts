import {
  isNotFoundApiError,
  requestGoApiData
} from '@/lib/server/go-api'

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
export type ArticleStatusFilter = ArticleStatus | 'all'

export type BlogArticle = {
  id: string
  title: string
  slug: string
  path: string
  description: string
  cover: string
  status: ArticleStatus
  categoryId: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  tags: BlogArticleTag[]
}

export type BlogArticleTag = {
  color: string
  id: string
  name: string
}

export type TagArticlePage = {
  tag: BlogArticleTag
  items: BlogArticle[]
  pagination: Pagination
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
    return await requestGoApiData<BlogCategory>(
      `/category/detail?path=${encodeURIComponent(path)}`,
      { auth: false }
    )
  } catch (error) {
    if (!isNotFoundApiError(error)) {
      throw error
    }

    return null
  }
}

export async function getChildDirectories(
  parentPath: string,
  page: number,
  pageSize = PAGE_SIZE
) {
  const params = new URLSearchParams({
    parentPath,
    page: String(page),
    pageSize: String(pageSize)
  })

  return readPage<BlogCategory>(
    `/category/children?${params.toString()}`,
    { auth: false }
  )
}

export async function getArticles(
  categoryPath: string,
  page: number,
  status: ArticleStatusFilter = 'all',
  pageSize = PAGE_SIZE,
  init?: { auth?: boolean }
) {
  const params = new URLSearchParams({
    categoryPath,
    page: String(page),
    pageSize: String(pageSize)
  })

  if (status !== 'all') {
    params.set('status', status)
  }

  const result = await readPage<ArticleApiResponse>(
    `/article/list?${params.toString()}`,
    init
  )

  return {
    ...result,
    items: result.items.map(normalizeArticle)
  }
}

export async function getArticleDetail(path: string) {
  try {
    const article = await requestGoApiData<
      Omit<ArticleApiResponse, 'content'> & { content: string }
    >(
      `/article/detail?path=${encodeURIComponent(path)}`
    )

    return normalizeArticle(article)
  } catch (error) {
    if (!isNotFoundApiError(error)) {
      throw error
    }

    return null
  }
}

export async function getArticleDetailById(id: string) {
  const article = await requestGoApiData<
    Omit<ArticleApiResponse, 'content'> & { content: string }
  >(`/article/by-id/${encodeURIComponent(id)}`)

  return normalizeArticle(article)
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
    return await requestGoApiData<BlogDirectoryOption[]>('/category/options', {
      auth: false
    })
  } catch (error) {
    if (!isNotFoundApiError(error)) {
      throw error
    }

    return []
  }
}

export async function getTagOptions() {
  try {
    return await requestGoApiData<BlogArticleTag[]>('/tag/options', {
      auth: false
    })
  } catch (error) {
    if (!isNotFoundApiError(error)) {
      throw error
    }

    return []
  }
}

export async function getArticlesByTag(tag: string, page: number) {
  const params = new URLSearchParams({
    name: tag,
    page: String(page),
    pageSize: String(PAGE_SIZE)
  })

  try {
    const result = await requestGoApiData<
      Omit<TagArticlePage, 'items'> & { items: ArticleApiResponse[] }
    >(`/tag/articles?${params.toString()}`)

    return {
      ...result,
      items: result.items.map(normalizeArticle)
    }
  } catch (error) {
    if (!isNotFoundApiError(error)) {
      throw error
    }

    return null
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

export function normalizeArticleStatusFilter(
  status: string | undefined
): ArticleStatusFilter {
  return status === 'publish' || status === 'private' || status === 'draft'
    ? status
    : 'all'
}

export function getBlogPathHref(
  path: string,
  tab: BlogTab,
  page = 1,
  status: ArticleStatusFilter = 'all'
) {
  const pathname = path ? `/blog/${path}` : '/blog'
  const params = new URLSearchParams()

  params.set('tab', tab)
  params.set('page', String(page))

  if (tab === 'articles' && status !== 'all') {
    params.set('status', status)
  }

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
    return await requestGoApiData<PageResponse<T>>(path, init)
  } catch (error) {
    if (!isNotFoundApiError(error)) {
      throw error
    }

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
  'cover' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'tags'
> & {
  cover?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
  tags?: BlogArticleTag[] | null
}

function normalizeArticle<T extends ArticleApiResponse>(article: T) {
  return {
    ...article,
    cover: article.cover ?? '',
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
