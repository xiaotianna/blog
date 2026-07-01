import BlurFade from '@/components/magicui/blur-fade'
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react'
import Link from 'next/link'

import type { BlogPost, Pagination } from './blog-data'
import { PAGE_SIZE } from './blog-data'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/components/ui/empty'

type BlogPostListProps = {
  activeFolderId?: string
  delay: number
  pagination: Pagination
  posts: BlogPost[]
}

export function BlogPostList({
  activeFolderId,
  delay,
  pagination,
  posts
}: BlogPostListProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {posts.length > 0 ? (
        <BlurFade
          className='mt-8 min-h-0 flex-1'
          delay={delay * 2}
        >
          <div className='flex h-full max-h-[calc(100dvh-24rem)] flex-col gap-5 overflow-y-auto pr-2 max-lg:max-h-none'>
            {posts.map((post, index) => (
              <BlogPostListItem
                index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                key={post.slug}
                post={post}
                delay={delay * 3 + index * 0.05}
              />
            ))}
          </div>
        </BlurFade>
      ) : (
        <BlurFade
          className='mt-8 flex flex-col items-center justify-center rounded-xl border border-border px-4 py-12'
          delay={delay * 2}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Newspaper />
              </EmptyMedia>
              <EmptyDescription>该目录还没有文章</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </BlurFade>
      )}

      <BlogPagination
        activeFolderId={activeFolderId}
        delay={delay * 4}
        pagination={pagination}
      />
    </div>
  )
}

function BlogPostListItem({
  delay,
  index,
  post
}: {
  delay: number
  index: number
  post: BlogPost
}) {
  return (
    <BlurFade delay={delay}>
      <Link
        className='group flex cursor-pointer items-start gap-x-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        href={`/blog/${post.slug}`}
      >
        <span className='mt-[5px] font-mono text-xs font-medium tabular-nums text-muted-foreground'>
          {String(index).padStart(2, '0')}.
        </span>
        <div className='flex flex-1 flex-col gap-y-2'>
          <p className='text-lg font-medium tracking-tight'>
            <span className='transition-colors group-hover:text-foreground'>
              {post.title}
              <ChevronRight
                aria-hidden
                className='ml-1 inline-block size-4 -translate-x-2 stroke-3 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100'
              />
            </span>
          </p>
          {post.description ? (
            <p className='line-clamp-2 text-sm leading-6 text-muted-foreground'>
              {post.description}
            </p>
          ) : null}
          {post.publishedAt ? (
            <p className='text-xs text-muted-foreground'>{post.publishedAt}</p>
          ) : null}
        </div>
      </Link>
    </BlurFade>
  )
}

function BlogPagination({
  activeFolderId,
  delay,
  pagination
}: {
  activeFolderId?: string
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
      <div className='flex gap-2 sm:justify-end'>
        {pagination.hasPreviousPage ? (
          <Link
            className='flex h-8 w-fit items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href={getBlogPageHref(pagination.page - 1, activeFolderId)}
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
            href={getBlogPageHref(pagination.page + 1, activeFolderId)}
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

function getBlogPageHref(page: number, folderId?: string) {
  if (folderId) {
    return `/blog?folder=${folderId}&page=${page}`
  }

  return `/blog?page=${page}`
}
