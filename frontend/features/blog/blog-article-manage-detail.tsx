import { PermissionGate } from '@/components/server/permission-gate'
import { Button } from '@/components/ui/button'
import { getPublicArticleCoverUrl } from '@/lib/article-cover-url'
import { ArrowUpRight, CalendarClock } from 'lucide-react'
import Link from 'next/link'

import { BlogArticleCover } from './blog-article-cover'
import { BlogArticleActionsMenu } from './blog-article-actions-menu'
import type {
  ArticleStatus,
  BlogArticleDetail,
  BlogDirectoryOption
} from './blog-data'

type BlogArticleManageDetailProps = {
  article: BlogArticleDetail
  canManageArticle: boolean
  directoryOptions: BlogDirectoryOption[]
}

const ARTICLE_STATUS_META: Record<ArticleStatus, { label: string; dot: string }> =
  {
    publish: {
      label: '已发布',
      dot: 'bg-emerald-400'
    },
    private: {
      label: '私密',
      dot: 'bg-amber-400'
    },
    draft: {
      label: '草稿',
      dot: 'bg-blue-400'
    }
  }

export function BlogArticleManageDetail({
  article,
  canManageArticle,
  directoryOptions
}: BlogArticleManageDetailProps) {
  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-5xl flex-col px-6 pb-0 lg:min-h-0 lg:px-0'>
      <section className='min-h-0 flex-1'>
        <div className='flex flex-col gap-8'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-semibold tracking-tight'>
                  {article.title}
                </h1>
              </div>
              {article.description ? (
                <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
                  {article.description}
                </p>
              ) : null}
            </div>

            <div className='flex shrink-0 flex-wrap justify-end gap-2'>
              <Button
                asChild
                variant='outline'
              >
                <Link href={`/post/${article.path}`}>
                  <ArrowUpRight className='size-4' />
                  阅读正文
                </Link>
              </Button>
              <PermissionGate allowed={canManageArticle}>
                <BlogArticleActionsMenu
                  article={article}
                  directoryOptions={directoryOptions}
                />
              </PermissionGate>
            </div>
          </div>

          <div className='grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.72fr)] lg:items-start'>
            <ArticleThumbnail
              article={article}
              canManageArticle={canManageArticle}
            />
            <ArticleInfoPanel article={article} />
          </div>
        </div>
      </section>
    </main>
  )
}

function ArticleThumbnail({
  article,
  canManageArticle
}: {
  article: BlogArticleDetail
  canManageArticle: boolean
}) {
  const coverUrl = getPublicArticleCoverUrl(article.cover)

  return (
    <BlogArticleCover
      articleId={article.id}
      canManageArticle={canManageArticle}
      coverUrl={coverUrl}
      description={article.description}
      path={article.path}
      title={article.title}
    />
  )
}

function ArticleInfoPanel({ article }: { article: BlogArticleDetail }) {
  const statusMeta = ARTICLE_STATUS_META[article.status]
  const createdAt = article.createdAt || article.publishedAt || '未记录'
  const updatedAt = article.updatedAt || article.publishedAt || '未记录'

  return (
    <div className='min-w-0 space-y-4 py-0.5'>
      <div>
        <p className='text-xs text-muted-foreground'>状态</p>
        <div className='mt-2 flex items-center gap-2.5'>
          <span
            aria-hidden='true'
            className={`size-2.5 rounded-full ${statusMeta.dot}`}
          />
          <span className='text-sm font-semibold text-foreground'>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className='grid gap-x-6 gap-y-4 sm:grid-cols-2'>
        <div>
          <p className='text-xs text-muted-foreground'>创建时间</p>
          <p className='mt-2 flex items-center gap-2 text-sm font-semibold text-foreground'>
            <CalendarClock className='size-4 text-muted-foreground' />
            {createdAt}
          </p>
        </div>

        <div>
          <p className='text-xs text-muted-foreground'>更新时间</p>
          <p className='mt-2 flex items-center gap-2 text-sm font-semibold text-foreground'>
            <CalendarClock className='size-4 text-muted-foreground' />
            {updatedAt}
          </p>
        </div>
      </div>

      <div className='space-y-2'>
        <p className='text-xs text-muted-foreground'>标签</p>
        <div className='flex flex-wrap gap-1.5 text-sm text-foreground'>
          {article.tags.length > 0 ? (
            article.tags.map((tag) => (
              <span
                className='rounded-md bg-muted px-2 py-0.5 text-sm'
                key={tag.id}
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className='text-xs text-muted-foreground'>暂无标签</span>
          )}
        </div>
      </div>
    </div>
  )
}
