import BlurFade from '@/components/magicui/blur-fade'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia
} from '@/components/ui/empty'
import { BlogArticleThumbnail } from '@/features/blog/blog-article-thumbnail'
import {
  PAGE_SIZE,
  type ArticleStatus,
  type BlogArticle,
  type Pagination
} from '@/features/blog/blog-data'
import { getPublicArticleCoverUrl } from '@/lib/article-cover-url'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Newspaper
} from 'lucide-react'
import Link from 'next/link'

const ARTICLE_STATUS_LABEL: Record<ArticleStatus, string> = {
  publish: '已发布',
  private: '私密',
  draft: '草稿'
}

export function TagArticleList({
  articles,
  canManageArticles,
  pagination,
  tagName
}: {
  articles: BlogArticle[]
  canManageArticles: boolean
  pagination: Pagination
  tagName: string
}) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {articles.length > 0 ? (
        <BlurFade
          className='mt-8 min-h-0 flex-1'
          delay={0.12}
        >
          <div className='flex flex-col gap-5'>
            {articles.map((article, index) => (
              <TagArticleListItem
                article={article}
                canManageArticles={canManageArticles}
                index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                key={article.id}
              />
            ))}
          </div>
        </BlurFade>
      ) : (
        <BlurFade
          className='mt-8 flex flex-1 flex-col items-center justify-center rounded-lg px-4 py-16'
          delay={0.12}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Newspaper />
              </EmptyMedia>
              <EmptyDescription>
                标签 #{tagName} 下暂无可查看的文章
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </BlurFade>
      )}

      <TagPagination
        pagination={pagination}
        tagName={tagName}
      />
    </div>
  )
}

function TagArticleListItem({
  article,
  canManageArticles,
  index
}: {
  article: BlogArticle
  canManageArticles: boolean
  index: number
}) {
  const time = getArticleListTime(article)
  const thumbnailUrl = getPublicArticleCoverUrl(article.cover)

  return (
    <Link
      className='group flex cursor-pointer items-start gap-x-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      href={`/${canManageArticles ? 'blog' : 'post'}/${article.path}`}
    >
      <span className='mt-1 font-mono text-xs font-medium tabular-nums text-muted-foreground'>
        {String(index).padStart(2, '0')}.
      </span>
      <FileText className='mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground' />
      {thumbnailUrl ? (
        <BlogArticleThumbnail
          src={thumbnailUrl}
          title={article.title}
        />
      ) : null}
      <div className='flex min-w-0 flex-1 flex-col gap-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-base font-medium tracking-tight'>
            <span className='inline-flex items-center transition-colors group-hover:text-foreground'>
              {article.title}
              <ChevronRight
                aria-hidden
                className='ml-1 inline-block size-4 -translate-x-2 stroke-3 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'
              />
            </span>
          </p>
          {canManageArticles ? (
            <ArticleStatusBadge status={article.status} />
          ) : null}
        </div>
        {article.description ? (
          <p className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
            {article.description}
          </p>
        ) : null}
        {time ? (
          <p className='text-xs text-muted-foreground'>
            {time.label} {time.value}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <Badge
      className='shrink-0'
      variant={status === 'publish' ? 'secondary' : 'outline'}
    >
      {ARTICLE_STATUS_LABEL[status]}
    </Badge>
  )
}

function getArticleListTime(article: BlogArticle) {
  if (article.publishedAt) {
    return { label: '发布于' as const, value: article.publishedAt }
  }

  if (article.updatedAt) {
    return { label: '更新于' as const, value: article.updatedAt }
  }
}

function TagPagination({
  pagination,
  tagName
}: {
  pagination: Pagination
  tagName: string
}) {
  return (
    <BlurFade
      className='mt-8 flex flex-row items-center justify-between gap-3'
      delay={0.16}
    >
      <div className='text-sm text-muted-foreground'>
        第 {pagination.page} 页，共 {pagination.totalPages} 页
      </div>
      <div className='flex gap-2 sm:justify-end'>
        <PaginationLink
          direction='previous'
          disabled={!pagination.hasPreviousPage}
          href={getTagPageHref(tagName, pagination.page - 1)}
        />
        <PaginationLink
          direction='next'
          disabled={!pagination.hasNextPage}
          href={getTagPageHref(tagName, pagination.page + 1)}
        />
      </div>
    </BlurFade>
  )
}

function PaginationLink({
  direction,
  disabled,
  href
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  href: string
}) {
  const content = (
    <>
      {direction === 'previous' ? <ChevronLeft className='size-4' /> : null}
      {direction === 'previous' ? '上一页' : '下一页'}
      {direction === 'next' ? <ChevronRight className='size-4' /> : null}
    </>
  )
  const className =
    'flex h-8 w-fit items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm'

  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-50`}>
        {content}
      </span>
    )
  }

  return (
    <Link
      className={`${className} transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
      href={href}
    >
      {content}
    </Link>
  )
}

export function getTagPageHref(tagName: string, page: number) {
  return `/tags/${encodeURIComponent(tagName)}?page=${page}`
}
