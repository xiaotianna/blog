import { Badge } from '@/components/ui/badge'
import {
  BlogArticleTagBadge,
  getArticleTagHref
} from '@/features/blog/blog-article-tag-badge'
import type {
  ArticleStatus,
  BlogArticleTag
} from '@/features/blog/blog-data'
import { CalendarDays } from 'lucide-react'
import type { ReactNode } from 'react'

type BlogPostHeaderProps = {
  action?: ReactNode
  description: string
  publishedAt: string
  status: ArticleStatus
  tags: BlogArticleTag[]
  title: string
  updatedAt: string
}

const ARTICLE_PREVIEW_LABEL: Partial<Record<ArticleStatus, string>> = {
  private: '私密预览',
  draft: '草稿预览'
}

export function BlogPostHeader({
  action,
  description,
  publishedAt,
  status,
  tags,
  title,
  updatedAt
}: BlogPostHeaderProps) {
  const isPublished = status === 'publish'
  const displayTime = isPublished ? publishedAt : updatedAt
  const timeLabel = isPublished ? '发布于' : '更新于'

  return (
    <header className='not-prose mb-10'>
      <div className='flex items-center justify-between gap-4 sm:items-start'>
        <h1
          className='m-0 min-w-0 flex-1 text-[40px] font-semibold leading-[1.16] tracking-normal text-(--ds-gray-1000)'
          data-search-field='title'
        >
          {title}
        </h1>

        {action ? <div className='shrink-0 sm:pt-1'>{action}</div> : null}
      </div>

      {description ? (
        <p
          className='mb-0 mt-4 max-w-190 text-[17px] leading-7 text-(--ds-gray-900)'
          data-search-field='description'
        >
          {description}
        </p>
      ) : null}

      {!isPublished || displayTime ? (
        <div className='mt-5 flex flex-wrap items-center gap-3 text-xs text-(--ds-gray-900)'>
          {!isPublished ? (
            <Badge variant='outline'>{ARTICLE_PREVIEW_LABEL[status]}</Badge>
          ) : null}

          {displayTime ? (
            <span className='inline-flex items-center gap-1.5 font-mono'>
              <CalendarDays className='size-3.5' />
              {timeLabel} {displayTime}
            </span>
          ) : null}
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div
          className='mt-5 flex flex-wrap gap-2 lg:hidden'
          data-search-field='tag'
        >
          {tags.map((tag) => (
            <BlogArticleTagBadge
              href={getArticleTagHref(tag)}
              key={tag.id}
              tag={tag}
            />
          ))}
        </div>
      ) : null}
    </header>
  )
}
