import { siteUrl } from '@/config/site'
import {
  getArticles,
  getDirectoryOptions,
  type BlogArticle,
  type BlogDirectoryOption
} from '@/features/blog/blog-data'
import type { MetadataRoute } from 'next'

const SITEMAP_PAGE_SIZE = 50

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const directories = await getDirectoryOptions()
  const articlesByDirectory = await Promise.all(
    directories.map((directory) => getAllPublicArticles(directory.path))
  )
  const articles = articlesByDirectory.flat()
  const tags = [
    ...new Set(
      articles.flatMap((article) => article.tags.map((tag) => tag.name))
    )
  ]

  return [
    createEntry('/', { changeFrequency: 'weekly', priority: 1 }),
    createEntry('/blog', { changeFrequency: 'daily', priority: 0.9 }),
    ...directories.map(createDirectoryEntry),
    ...articles.map(createArticleEntry),
    ...tags.map(createTagEntry)
  ]
}

async function getAllPublicArticles(categoryPath: string) {
  const firstPage = await getArticles(
    categoryPath,
    1,
    'publish',
    SITEMAP_PAGE_SIZE,
    { auth: false }
  )

  if (firstPage.pagination.totalPages <= 1) {
    return firstPage.items
  }

  const remainingPages = await Promise.all(
    Array.from(
      { length: firstPage.pagination.totalPages - 1 },
      (_, index) =>
        getArticles(
          categoryPath,
          index + 2,
          'publish',
          SITEMAP_PAGE_SIZE,
          { auth: false }
        )
    )
  )

  return [firstPage, ...remainingPages].flatMap((page) => page.items)
}

function createDirectoryEntry(
  directory: BlogDirectoryOption
): MetadataRoute.Sitemap[number] {
  return createEntry(`/blog/${directory.path}`, {
    changeFrequency: 'weekly',
    priority: 0.7
  })
}

function createArticleEntry(
  article: BlogArticle
): MetadataRoute.Sitemap[number] {
  return createEntry(`/post/${article.path}`, {
    changeFrequency: 'monthly',
    lastModified: article.updatedAt || article.publishedAt || undefined,
    priority: 0.8
  })
}

function createTagEntry(tag: string): MetadataRoute.Sitemap[number] {
  return createEntry(`/tags/${encodeURIComponent(tag)}`, {
    changeFrequency: 'weekly',
    priority: 0.6
  })
}

function createEntry(
  path: string,
  metadata: Omit<MetadataRoute.Sitemap[number], 'url'>
): MetadataRoute.Sitemap[number] {
  return {
    ...metadata,
    url: new URL(path.replace(/^\/+/, ''), siteUrl).toString()
  }
}
