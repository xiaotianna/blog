import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { BlogArticleTag } from './blog-data'

export const ARTICLE_TAG_COLOR_OPTIONS = [
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#a78bfa',
  '#22d3ee',
  '#f97316',
  '#94a3b8'
] as const

export const DEFAULT_ARTICLE_TAG_COLOR = ARTICLE_TAG_COLOR_OPTIONS[0]

type BlogArticleTagBadgeBaseProps = {
  className?: string
  tag: BlogArticleTag
}

type BlogArticleTagBadgeProps = BlogArticleTagBadgeBaseProps &
  (
    | {
        href: string
        trailing?: never
      }
    | {
        href?: never
        trailing?: ReactNode
      }
  )

export function BlogArticleTagBadge({
  className,
  href,
  tag,
  trailing
}: BlogArticleTagBadgeProps) {
  const color = getArticleTagColor(tag)

  const badge = (
    <Badge
      className={cn(
        'group rounded-full bg-transparent px-3.5 py-1 text-xs leading-none',
        href ? 'cursor-pointer' : '',
        trailing
          ? 'relative transition-[padding] hover:pr-8 focus-within:pr-8'
          : '',
        className
      )}
      style={{ borderColor: color, color }}
      variant='outline'
    >
      <span className='max-w-32 truncate'># {tag.name}</span>
      {trailing ? (
        <span className='absolute right-1 inline-flex'>{trailing}</span>
      ) : null}
    </Badge>
  )

  return href ? (
    <Link
      className='inline-flex'
      href={href}
    >
      {badge}
    </Link>
  ) : (
    badge
  )
}

export function getArticleTagHref(tag: BlogArticleTag) {
  return `/tags/${encodeURIComponent(tag.name)}`
}

export function getArticleTagColor(tag: BlogArticleTag) {
  const color = tag.color?.toLowerCase()
  const matchedColor = ARTICLE_TAG_COLOR_OPTIONS.find(
    (option) => option === color
  )

  return matchedColor ?? DEFAULT_ARTICLE_TAG_COLOR
}

export function isArticleTagColor(color: string) {
  const normalizedColor = color.toLowerCase()

  return ARTICLE_TAG_COLOR_OPTIONS.some(
    (option) => option === normalizedColor
  )
}

export function getArticleTagBackgroundColor(color: string) {
  return `${color}66`
}
