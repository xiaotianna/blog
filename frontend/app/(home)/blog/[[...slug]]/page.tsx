import BlurFade from '@/components/magicui/blur-fade'
import { PermissionGate } from '@/components/server/permission-gate'
import { BlogArticleManageDetail } from '@/features/blog/blog-article-manage-detail'
import {
  getArticles,
  getBlogNode,
  getChildDirectories,
  getDirectoryOptions,
  normalizeBlogPath,
  normalizePage,
  normalizeTab
} from '@/features/blog/blog-data'
import {
  BlogCategoryEditDialog,
  BlogCategoryMoveDialog
} from '@/features/blog/blog-node-edit-dialog'
import { BlogPageAction } from '@/features/blog/blog-page-action'
import { BlogContentList } from '@/features/blog/blog-post-list'
import Link from 'next/link'
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
  const [currentNode, directoryOptions] = await Promise.all([
    getBlogNode(currentPath),
    getDirectoryOptions()
  ])

  if (!currentNode) {
    notFound()
  }

  if (currentNode.type === 'article') {
    return (
      <BlogArticleManageDetail
        article={currentNode.item}
        directoryOptions={directoryOptions}
      />
    )
  }

  const currentCategory = currentNode.item
  const activeTab = normalizeTab(tabParam)
  const currentPage = normalizePage(pageParam)
  const [directoryPage, articlePage] = await Promise.all([
    getChildDirectories(
      currentPath,
      activeTab === 'directories' ? currentPage : 1
    ),
    getArticles(currentPath, activeTab === 'articles' ? currentPage : 1)
  ])

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-5xl flex-col px-6 pb-0 lg:min-h-0 lg:px-0'>
      <section
        className='min-h-0 flex-1'
        id='blog'
      >
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-semibold tracking-tight'>
                  {currentCategory.name}
                </h1>
              </div>
              {currentCategory.description ? (
                <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
                  {currentCategory.description}
                </p>
              ) : null}
              {currentPath ? (
                <BlogPathBreadcrumb
                  currentCategoryName={currentCategory.name}
                  currentPath={currentPath}
                  directoryOptions={directoryOptions}
                />
              ) : null}
            </div>

            <div className='flex shrink-0 flex-wrap justify-end gap-2'>
              {currentPath ? (
                <PermissionGate>
                  <BlogCategoryEditDialog
                    category={currentCategory}
                    directoryOptions={directoryOptions}
                  />
                  <BlogCategoryMoveDialog
                    category={currentCategory}
                    directoryOptions={directoryOptions}
                  />
                </PermissionGate>
              ) : null}
              <BlogPageAction
                activePath={currentPath}
                directoryOptions={directoryOptions}
              />
            </div>
          </div>
        </BlurFade>

        <BlogContentList
          activeTab={activeTab}
          articlePagination={articlePage.pagination}
          articleTotal={articlePage.pagination.total}
          articles={articlePage.items}
          currentPath={currentPath}
          delay={BLUR_FADE_DELAY}
          directories={directoryPage.items}
          directoryPagination={directoryPage.pagination}
          directoryTotal={directoryPage.pagination.total}
        />
      </section>
    </main>
  )
}

function BlogPathBreadcrumb({
  currentCategoryName,
  currentPath,
  directoryOptions
}: {
  currentCategoryName: string
  currentPath: string
  directoryOptions: Array<{ label: string; path: string }>
}) {
  const pathSegments = currentPath.split('/').filter(Boolean)
  const directoryLabelByPath = new Map(
    directoryOptions.map((option) => [option.path, option.label])
  )
  const breadcrumbs = [
    { href: '/blog', label: 'Blog', path: '' },
    ...pathSegments.map((segment, index) => {
      const path = pathSegments.slice(0, index + 1).join('/')
      const isCurrent = index === pathSegments.length - 1

      return {
        href: `/blog/${path}`,
        label:
          directoryLabelByPath.get(path) ??
          (isCurrent ? currentCategoryName : segment),
        path
      }
    })
  ]
  const firstBreadcrumb = breadcrumbs[0]
  const currentBreadcrumb = breadcrumbs.at(-1)
  const middleBreadcrumbs = breadcrumbs.slice(1, -1)

  if (!currentBreadcrumb) {
    return null
  }

  return (
    <nav
      aria-label='目录路径'
      className='mt-2 flex max-w-full items-center overflow-hidden text-xs text-muted-foreground'
    >
      <Link
        className='shrink-0 transition-colors hover:text-foreground'
        href={firstBreadcrumb.href}
      >
        {firstBreadcrumb.label}
      </Link>
      {middleBreadcrumbs.length > 0 ? (
        <span className='flex min-w-0 items-center overflow-hidden'>
          {middleBreadcrumbs.map((breadcrumb) => (
            <span
              className='flex min-w-0 items-center'
              key={breadcrumb.path}
            >
              <span className='mx-1.5 shrink-0 text-muted-foreground/60'>
                /
              </span>
              <Link
                className='truncate transition-colors hover:text-foreground'
                href={breadcrumb.href}
              >
                {breadcrumb.label}
              </Link>
            </span>
          ))}
        </span>
      ) : null}
      {currentBreadcrumb.path ? (
        <>
          <span className='mx-1.5 shrink-0 text-muted-foreground/60'>/</span>
          <span
            aria-current='page'
            className='shrink-0 text-foreground'
          >
            {currentBreadcrumb.label}
          </span>
        </>
      ) : null}
    </nav>
  )
}
