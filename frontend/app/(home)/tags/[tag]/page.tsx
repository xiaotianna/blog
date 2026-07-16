import BlurFade from '@/components/magicui/blur-fade'
import { getArticleTagColor } from '@/features/blog/blog-article-tag-badge'
import {
  getArticlesByTag,
  normalizePage
} from '@/features/blog/blog-data'
import {
  getTagPageHref,
  TagArticleList
} from '@/features/tags/tag-article-list'
import { isAuthenticated } from '@/lib/server/permissions/check'
import { ArrowLeft, Hash } from 'lucide-react'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type TagPageParams = {
  tag: string
}

export default async function TagPage({
  params,
  searchParams
}: {
  params: Promise<TagPageParams>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ tag }, { page: pageParam }] = await Promise.all([
    params,
    searchParams
  ])
  const currentPage = normalizePage(pageParam)
  const [result, canManageArticles] = await Promise.all([
    getArticlesByTag(tag, currentPage),
    isAuthenticated()
  ])

  if (!result) {
    notFound()
  }

  if (currentPage > result.pagination.totalPages) {
    redirect(getTagPageHref(result.tag.name, result.pagination.totalPages))
  }

  const color = getArticleTagColor(result.tag)

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-5xl flex-col px-6 pb-20 lg:px-0'>
      <BlurFade delay={0.04}>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-3'>
              <span
                className='inline-flex size-9 shrink-0 items-center justify-center rounded-full border'
                style={{ borderColor: color, color }}
              >
                <Hash className='size-4' />
              </span>
              <h1 className='truncate text-3xl font-semibold tracking-tight'>
                # {result.tag.name}
              </h1>
            </div>
            <p className='mt-3 text-sm text-muted-foreground'>
              共 {result.pagination.total} 篇文章
            </p>
          </div>
          <Link
            className='inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href='/blog'
          >
            <ArrowLeft className='size-4' />
            返回博客
          </Link>
        </div>
      </BlurFade>

      <TagArticleList
        articles={result.items}
        canManageArticles={canManageArticles}
        pagination={result.pagination}
        tagName={result.tag.name}
      />
    </main>
  )
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<TagPageParams>
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const [{ tag }, { page: pageParam }] = await Promise.all([
    params,
    searchParams
  ])
  const page = normalizePage(pageParam)
  const pageLabel = page > 1 ? ` - 第 ${page} 页` : ''
  const path = `/tags/${encodeURIComponent(tag)}${
    page > 1 ? `?page=${page}` : ''
  }`

  return buildPageMetadata({
    description: `查看标签“${tag}”下的文章${pageLabel}`,
    keywords: [tag],
    path,
    tags: [tag],
    title: `# ${tag}${pageLabel}`
  })
}
