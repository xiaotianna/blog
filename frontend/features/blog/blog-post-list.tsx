import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia
} from '@/components/ui/empty'
import BlurFade from '@/components/magicui/blur-fade'
import { getPublicArticleCoverUrl } from '@/lib/article-cover-url'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  ListFilter,
  Newspaper
} from 'lucide-react'
import Link from 'next/link'

import { BlogArticleThumbnail } from './blog-article-thumbnail'
import {
  getBlogPathHref,
  PAGE_SIZE,
  type ArticleStatus,
  type ArticleStatusFilter,
  type BlogArticle,
  type BlogCategory,
  type BlogTab,
  type Pagination
} from './blog-data'

type BlogContentListProps = {
  activeTab: BlogTab
  articles: BlogArticle[]
  articlePagination: Pagination
  articleStatus: ArticleStatusFilter
  articleTotal: number
  canManageArticles: boolean
  currentPath: string
  delay: number
  directories: BlogCategory[]
  directoryPagination: Pagination
  directoryTotal: number
}

const ARTICLE_STATUS_LABEL: Record<ArticleStatus, string> = {
  publish: '已发布',
  private: '私密',
  draft: '草稿'
}

const ARTICLE_STATUS_FILTER_OPTIONS: Array<{
  label: string
  value: ArticleStatusFilter
}> = [
  { label: '全部文章', value: 'all' },
  { label: '已发布', value: 'publish' },
  { label: '私密', value: 'private' },
  { label: '草稿', value: 'draft' }
]

export function BlogContentList({
  activeTab,
  articles,
  articlePagination,
  articleStatus,
  articleTotal,
  canManageArticles,
  currentPath,
  delay,
  directories,
  directoryPagination,
  directoryTotal
}: BlogContentListProps) {
  const isDirectoryTab = activeTab === 'directories'
  const items = isDirectoryTab ? directories : articles
  const pagination = isDirectoryTab ? directoryPagination : articlePagination

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <BlurFade
        className='mt-4'
        delay={delay * 2}
      >
        <div className='inline-flex items-center gap-6 border-b border-border'>
          <BlogTabLink
            active={isDirectoryTab}
            currentPath={currentPath}
            tab='directories'
            total={directoryTotal}
          >
            目录
          </BlogTabLink>
          {currentPath ? (
            <BlogTabLink
              active={!isDirectoryTab}
              articleStatus={articleStatus}
              currentPath={currentPath}
              showArticleStatusFilter={canManageArticles}
              tab='articles'
              total={articleTotal}
            >
              文章
            </BlogTabLink>
          ) : null}
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
                  <BlogListItem
                    description={directory.description}
                    icon='directory'
                    index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                    key={directory.id}
                    href={`/blog/${directory.path}`}
                    title={directory.name}
                  />
                ))
              : articles.map((article, index) => (
                  <BlogListItem
                    description={article.description}
                    icon='article'
                    index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                    key={article.id}
                    href={`/${canManageArticles ? 'blog' : 'post'}/${article.path}`}
                    showStatus={canManageArticles}
                    status={article.status}
                    time={getArticleListTime(article)}
                    thumbnailUrl={getPublicArticleCoverUrl(article.cover)}
                    title={article.title}
                  />
                ))}
          </div>
        </BlurFade>
      ) : (
        <BlurFade
          className='mt-4 flex flex-col items-center justify-center rounded-lg px-4 py-12'
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
        articleStatus={articleStatus}
        currentPath={currentPath}
        delay={delay * 4}
        pagination={pagination}
      />
    </div>
  )
}

function BlogTabLink({
  active,
  articleStatus = 'all',
  children,
  currentPath,
  showArticleStatusFilter = false,
  tab,
  total
}: {
  active: boolean
  articleStatus?: ArticleStatusFilter
  children: string
  currentPath: string
  showArticleStatusFilter?: boolean
  tab: BlogTab
  total: number
}) {
  const stateClassName = active
    ? 'text-foreground'
    : 'text-muted-foreground hover:text-foreground'
  const dotClassName = active
    ? 'border-foreground/10 bg-foreground text-background'
    : 'border-border bg-muted text-muted-foreground group-hover:border-foreground/10 group-hover:bg-foreground group-hover:text-background'

  return (
    <span
      className={`group relative -mb-px inline-flex items-center gap-1.5 pb-2.5 text-sm font-semibold transition-colors ${stateClassName}`}
    >
      <Link
        className='inline-flex items-center gap-1.5'
        href={getBlogPathHref(currentPath, tab, 1, articleStatus)}
      >
        {children}
        <span
          aria-label={`${children}数量 ${total}`}
          className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full border px-0 text-[9px] font-medium leading-none tabular-nums transition-colors ${dotClassName}`}
        >
          {total}
        </span>
      </Link>
      {showArticleStatusFilter ? (
        <ArticleStatusFilterDropdown
          currentPath={currentPath}
          value={articleStatus}
        />
      ) : null}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground transition-all duration-200 ease-out ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
      />
    </span>
  )
}

function ArticleStatusFilterDropdown({
  currentPath,
  value
}: {
  currentPath: string
  value: ArticleStatusFilter
}) {
  const currentLabel =
    ARTICLE_STATUS_FILTER_OPTIONS.find((option) => option.value === value)
      ?.label ?? '全部文章'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`筛选文章状态：${currentLabel}`}
          className='inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none'
          type='button'
        >
          <ListFilter className='size-3.5' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='w-32'
      >
        {ARTICLE_STATUS_FILTER_OPTIONS.map((option) => (
          <DropdownMenuItem
            asChild
            key={option.value}
          >
            <Link
              className='w-full'
              href={getBlogPathHref(currentPath, 'articles', 1, option.value)}
            >
              {option.label}
              {value === option.value ? (
                <Check className='ml-auto size-3.5' />
              ) : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BlogListItem({
  description,
  href,
  icon,
  index,
  showStatus,
  status,
  thumbnailUrl,
  time,
  title
}: {
  description?: string
  href: string
  icon: 'article' | 'directory'
  index: number
  showStatus?: boolean
  status?: ArticleStatus
  thumbnailUrl?: string
  time?: ArticleListTime
  title: string
}) {
  const Icon = icon === 'directory' ? Folder : FileText

  return (
    <Link
      className='group flex cursor-pointer items-start gap-x-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      href={href}
    >
      <span className='mt-1 font-mono text-xs font-medium tabular-nums text-muted-foreground'>
        {String(index).padStart(2, '0')}.
      </span>
      <Icon className='mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground' />
      {thumbnailUrl ? (
        <BlogArticleThumbnail
          src={thumbnailUrl}
          title={title}
        />
      ) : null}
      <div className='flex min-w-0 flex-1 flex-col gap-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-base font-medium tracking-tight'>
            <span className='transition-colors group-hover:text-foreground inline-flex items-center'>
              {title}
              <ChevronRight
                aria-hidden
                className='ml-1 inline-block size-4 -translate-x-2 stroke-3 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'
              />
            </span>
          </p>
          {showStatus && status ? <ArticleStatusBadge status={status} /> : null}
        </div>
        {description ? (
          <p className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
            {description}
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

type ArticleListTime = {
  label: '发布于' | '更新于'
  value: string
}

function getArticleListTime(article: BlogArticle): ArticleListTime | undefined {
  if (article.publishedAt) {
    return {
      label: '发布于',
      value: article.publishedAt
    }
  }

  if (article.updatedAt) {
    return {
      label: '更新于',
      value: article.updatedAt
    }
  }
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
  articleStatus,
  currentPath,
  delay,
  pagination
}: {
  activeTab: BlogTab
  articleStatus: ArticleStatusFilter
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
            href={getBlogPathHref(
              currentPath,
              activeTab,
              pagination.page - 1,
              articleStatus
            )}
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
            href={getBlogPathHref(
              currentPath,
              activeTab,
              pagination.page + 1,
              articleStatus
            )}
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
