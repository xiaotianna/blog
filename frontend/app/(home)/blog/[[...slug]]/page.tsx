import BlurFade from '@/components/magicui/blur-fade'
import {
  getArticles,
  getChildDirectories,
  getCurrentCategory,
  getDirectoryOptions,
  normalizeBlogPath,
  normalizePage,
  normalizeTab
} from '@/features/blog/blog-data'
import { BlogPageAction } from '@/features/blog/blog-page-action'
import { BlogContentList } from '@/features/blog/blog-post-list'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: '关于技术、编程和生活的一些想法。',
  openGraph: {
    title: 'Blog',
    description: '关于技术、编程和生活的一些想法。'
  }
}

const BLUR_FADE_DELAY = 0.04

export default async function BlogPage({
  params,
  searchParams
}: {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ page?: string; tab?: string }>
}) {
  const [{ slug }, { page: pageParam, tab: tabParam }] = await Promise.all([
    params,
    searchParams
  ])
  const currentPath = normalizeBlogPath(slug)
  const currentCategory = await getCurrentCategory(currentPath)

  if (!currentCategory) {
    notFound()
  }

  const activeTab = normalizeTab(tabParam)
  const currentPage = normalizePage(pageParam)
  const [directoryPage, articlePage, directoryOptions] = await Promise.all([
    getChildDirectories(
      currentPath,
      activeTab === 'directories' ? currentPage : 1
    ),
    getArticles(currentPath, activeTab === 'articles' ? currentPage : 1),
    getDirectoryOptions()
  ])

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-5xl flex-col px-6 pb-0 lg:min-h-0 lg:px-0'>
      <section
        className='min-h-0 flex-1'
        id='blog'
      >
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-semibold tracking-tight'>
                  {currentCategory.name}
                </h1>
                <span className='inline-flex rounded-md border border-border bg-card px-2 py-1 align-middle text-sm text-muted-foreground'>
                  {activeTab === 'directories'
                    ? `${directoryPage.pagination.total} 个目录`
                    : `${articlePage.pagination.total} 篇文章`}
                </span>
              </div>
              {currentCategory.description ? (
                <p className='mt-3 max-w-2xl text-sm text-muted-foreground'>
                  {currentCategory.description}
                </p>
              ) : null}
            </div>

            <BlogPageAction
              activePath={currentPath}
              directoryOptions={directoryOptions}
            />
          </div>
        </BlurFade>

        <BlogContentList
          activeTab={activeTab}
          articlePagination={articlePage.pagination}
          articles={articlePage.items}
          currentPath={currentPath}
          delay={BLUR_FADE_DELAY}
          directories={directoryPage.items}
          directoryPagination={directoryPage.pagination}
        />
      </section>
    </main>
  )
}
