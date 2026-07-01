import { readdir, readFile } from 'node:fs/promises'
import { extname, join, parse } from 'node:path'

import BlurFade from '@/components/magicui/blur-fade'
import { parseFrontmatter } from '@/components/markdown/parse-frontmatter'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog',
  description: '关于技术、编程和生活的一些想法。',
  openGraph: {
    title: 'Blog',
    description: '关于技术、编程和生活的一些想法。'
  }
}

const PAGE_SIZE = 5
const BLUR_FADE_DELAY = 0.04
const MARKDOWN_EXTENSIONS = ['.mdx', '.md'] as const

type BlogPost = {
  slug: string
  title: string
  description?: string
  publishedAt: string
}

type Pagination = {
  page: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

function isMarkdownFile(file: string) {
  return MARKDOWN_EXTENSIONS.includes(
    extname(file) as (typeof MARKDOWN_EXTENSIONS)[number]
  )
}

function getPublishedAt(metadata: Record<string, unknown>) {
  if (typeof metadata.date === 'string') {
    return metadata.date
  }

  if (typeof metadata.lastUpdated === 'string') {
    return metadata.lastUpdated
  }

  return ''
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const publicDir = join(process.cwd(), 'public')
  const entries = await readdir(publicDir, { withFileTypes: true })
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => entry.name)

  const posts = await Promise.all(
    markdownFiles.map(async (file) => {
      const slug = parse(file).name
      const source = await readFile(join(publicDir, file), 'utf8')
      const { metadata } = parseFrontmatter(source)

      return {
        slug,
        title: String(metadata.title || slug),
        description:
          typeof metadata.description === 'string'
            ? metadata.description
            : undefined,
        publishedAt: getPublishedAt(metadata)
      }
    })
  )

  return posts.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime()
    const timeB = new Date(b.publishedAt).getTime()

    if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
      return timeB - timeA
    }

    return a.title.localeCompare(b.title)
  })
}

function normalizePage(page: string | undefined, totalPages: number) {
  const parsedPage = Number(page)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return Math.min(parsedPage, Math.max(totalPages, 1))
}

function paginatePosts(posts: BlogPost[], page: number) {
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE

  return {
    posts: posts.slice(startIndex, startIndex + PAGE_SIZE),
    pagination: {
      page,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    } satisfies Pagination
  }
}

export default async function BlogPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const sortedPosts = await getBlogPosts()
  const currentPage = normalizePage(
    pageParam,
    Math.ceil(sortedPosts.length / PAGE_SIZE)
  )
  const { posts, pagination } = paginatePosts(sortedPosts, currentPage)

  return (
    <main className='mx-auto w-full max-w-2xl px-6 pb-24'>
      <section id='blog'>
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h1 className='mb-2 text-2xl font-semibold tracking-tight'>
            {metadata.title as string}
            <span className='ml-2 inline-flex rounded-md border border-border bg-card px-2 py-1 align-middle text-sm text-muted-foreground'>
              {sortedPosts.length} 篇文章
            </span>
          </h1>
          <p className='text-sm text-muted-foreground'>
            {metadata.description}
          </p>
        </BlurFade>

        {posts.length > 0 ? (
          <>
            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <div className='mt-8 flex flex-col gap-5'>
                {posts.map((post, index) => {
                  const indexNumber =
                    (pagination.page - 1) * PAGE_SIZE + index + 1

                  return (
                    <BlurFade
                      delay={BLUR_FADE_DELAY * 3 + index * 0.05}
                      key={post.slug}
                    >
                      <Link
                        className='group flex cursor-pointer items-start gap-x-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        href={`/blog/${post.slug}`}
                      >
                        <span className='mt-[5px] font-mono text-xs font-medium tabular-nums text-muted-foreground'>
                          {String(indexNumber).padStart(2, '0')}.
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
                            <p className='text-xs text-muted-foreground'>
                              {post.publishedAt}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </BlurFade>
                  )
                })}
              </div>
            </BlurFade>

            {pagination.totalPages > 1 ? (
              <BlurFade
                className='mt-8 flex flex-row items-center justify-between gap-3'
                delay={BLUR_FADE_DELAY * 4}
              >
                <div className='text-sm text-muted-foreground'>
                  第 {pagination.page} 页，共 {pagination.totalPages} 页
                </div>
                <div className='flex gap-2 sm:justify-end'>
                  {pagination.hasPreviousPage ? (
                    <Link
                      className='flex h-8 w-fit items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      href={`/blog?page=${pagination.page - 1}`}
                    >
                      <ChevronLeft aria-hidden className='size-4' />
                      上一页
                    </Link>
                  ) : (
                    <span className='flex h-8 w-fit cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm opacity-50'>
                      <ChevronLeft aria-hidden className='size-4' />
                      上一页
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <Link
                      className='flex h-8 w-fit items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      href={`/blog?page=${pagination.page + 1}`}
                    >
                      下一页
                      <ChevronRight aria-hidden className='size-4' />
                    </Link>
                  ) : (
                    <span className='flex h-8 w-fit cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border px-2 text-sm opacity-50'>
                      下一页
                      <ChevronRight aria-hidden className='size-4' />
                    </span>
                  )}
                </div>
              </BlurFade>
            ) : null}
          </>
        ) : (
          <BlurFade
            className='mt-8 flex flex-col items-center justify-center rounded-xl border border-border px-4 py-12'
            delay={BLUR_FADE_DELAY * 2}
          >
            <p className='text-center text-muted-foreground'>
              还没有文章，晚点再来看看吧。
            </p>
          </BlurFade>
        )}
      </section>
    </main>
  )
}
