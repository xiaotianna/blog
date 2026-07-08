import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia
} from '@/components/ui/empty'
import BlurFade from '@/components/magicui/blur-fade'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  Newspaper
} from 'lucide-react'
import Link from 'next/link'

import {
  getBlogPathHref,
  PAGE_SIZE,
  type ArticleStatus,
  type BlogArticle,
  type BlogCategory,
  type BlogTab,
  type Pagination
} from './blog-data'

type BlogContentListProps = {
  activeTab: BlogTab
  articles: BlogArticle[]
  articlePagination: Pagination
  currentPath: string
  delay: number
  directories: BlogCategory[]
  directoryPagination: Pagination
}

const ARTICLE_STATUS_LABEL: Record<ArticleStatus, string> = {
  publish: '已发布',
  private: '私密',
  draft: '草稿'
}

export function BlogContentList({
  activeTab,
  articles,
  articlePagination,
  currentPath,
  delay,
  directories,
  directoryPagination
}: BlogContentListProps) {
  const isDirectoryTab = activeTab === 'directories'
  const items = isDirectoryTab ? directories : articles
  const pagination = isDirectoryTab ? directoryPagination : articlePagination

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <BlurFade
        className='mt-8'
        delay={delay * 2}
      >
        <div className='flex items-center gap-8 border-b border-border'>
          <BlogTabLink
            active={isDirectoryTab}
            currentPath={currentPath}
            tab='directories'
          >
            目录
          </BlogTabLink>
          <BlogTabLink
            active={!isDirectoryTab}
            currentPath={currentPath}
            tab='articles'
          >
            文章
          </BlogTabLink>
        </div>
      </BlurFade>

      {items.length > 0 ? (
        <BlurFade
          className='mt-8 min-h-0 flex-1'
          delay={delay * 3}
        >
          <div className='flex h-full max-h-[calc(100dvh-25rem)] flex-col gap-5 overflow-y-auto pr-2 max-lg:max-h-none'>
            {isDirectoryTab
              ? directories.map((directory, index) => (
                  <BlogDirectoryListItem
                    directory={directory}
                    index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                    key={directory.id}
                  />
                ))
              : articles.map((article, index) => (
                  <BlogArticleListItem
                    article={article}
                    index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                    key={article.id}
                  />
                ))}
          </div>
        </BlurFade>
      ) : (
        <BlurFade
          className='mt-8 flex flex-col items-center justify-center rounded-lg border border-border px-4 py-12'
          delay={delay * 3}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                {isDirectoryTab ? <Folder /> : <Newspaper />}
              </EmptyMedia>
              <EmptyDescription>
                {isDirectoryTab ? '当前目录下暂无子目录' : '当前目录下暂无文章'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </BlurFade>
      )}

      <BlogPagination
        activeTab={activeTab}
        currentPath={currentPath}
        delay={delay * 4}
        pagination={pagination}
      />
    </div>
  )
}

function BlogTabLink({
  active,
  children,
  currentPath,
  tab
}: {
  active: boolean
  children: string
  currentPath: string
  tab: BlogTab
}) {
  const stateClassName = active
    ? 'text-foreground'
    : 'text-muted-foreground hover:text-foreground'

  return (
    <Link
      className={`relative -mb-px pb-3 text-base font-semibold transition-colors ${stateClassName}`}
      href={getBlogPathHref(currentPath, tab)}
    >
      {children}
      {active ? (
        <span className='absolute inset-x-0 bottom-0 h-0.5 bg-foreground' />
      ) : null}
    </Link>
  )
}

function BlogDirectoryListItem({
  directory,
  index
}: {
  directory: BlogCategory
  index: number
}) {
  return (
    <Link
      className='group flex cursor-pointer items-start gap-x-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      href={`/blog/${directory.path}`}
    >
      <span className='mt-[5px] font-mono text-xs font-medium tabular-nums text-muted-foreground'>
        {String(index).padStart(2, '0')}.
      </span>
      <Folder className='mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground' />
      <div className='flex min-w-0 flex-1 flex-col gap-y-2'>
        <p className='text-lg font-medium tracking-tight'>
          <span className='transition-colors group-hover:text-foreground'>
            {directory.name}
            <ChevronRight
              aria-hidden
              className='ml-1 inline-block size-4 -translate-x-2 stroke-3 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'
            />
          </span>
        </p>
        {directory.description ? (
          <p className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
            {directory.description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

function BlogArticleListItem({
  article,
  index
}: {
  article: BlogArticle
  index: number
}) {
  return (
    <Link
      className='group flex cursor-pointer items-start gap-x-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      href={`/post/${article.path}`}
    >
      <span className='mt-[5px] font-mono text-xs font-medium tabular-nums text-muted-foreground'>
        {String(index).padStart(2, '0')}.
      </span>
      <FileText className='mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground' />
      <div className='flex min-w-0 flex-1 flex-col gap-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-lg font-medium tracking-tight'>
            <span className='transition-colors group-hover:text-foreground'>
              {article.title}
              <ChevronRight
                aria-hidden
                className='ml-1 inline-block size-4 -translate-x-2 stroke-3 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'
              />
            </span>
          </p>
          <ArticleStatusBadge status={article.status} />
        </div>
        {article.description ? (
          <p className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
            {article.description}
          </p>
        ) : null}
        {article.publishedAt ? (
          <p className='text-xs text-muted-foreground'>{article.publishedAt}</p>
        ) : null}
      </div>
    </Link>
  )
}

function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const variant = status === 'publish' ? 'secondary' : 'outline'

  return (
    <Badge
      className='shrink-0'
      variant={variant}
    >
      {ARTICLE_STATUS_LABEL[status] ?? status}
    </Badge>
  )
}

function BlogPagination({
  activeTab,
  currentPath,
  delay,
  pagination
}: {
  activeTab: BlogTab
  currentPath: string
  delay: number
  pagination: Pagination
}) {
  return (
    <BlurFade
      className='mt-8 flex flex-row items-center justify-between gap-3'
      delay={delay}
    >
      <div className='text-sm text-muted-foreground'>
        第 {pagination.page} 页，共 {pagination.totalPages} 页
      </div>
      <div
        className='flex gap-2 sm:justify-end'
        data-blog-pagination-actions
      >
        {pagination.hasPreviousPage ? (
          <Link
            className='flex h-8 w-fit items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href={getBlogPathHref(currentPath, activeTab, pagination.page - 1)}
          >
            <ChevronLeft
              aria-hidden
              className='size-4'
            />
            上一页
          </Link>
        ) : (
          <span className='flex h-8 w-fit cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm opacity-50'>
            <ChevronLeft
              aria-hidden
              className='size-4'
            />
            上一页
          </span>
        )}
        {pagination.hasNextPage ? (
          <Link
            className='flex h-8 w-fit items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href={getBlogPathHref(currentPath, activeTab, pagination.page + 1)}
          >
            下一页
            <ChevronRight
              aria-hidden
              className='size-4'
            />
          </Link>
        ) : (
          <span className='flex h-8 w-fit cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm opacity-50'>
            下一页
            <ChevronRight
              aria-hidden
              className='size-4'
            />
          </span>
        )}
      </div>
    </BlurFade>
  )
}
