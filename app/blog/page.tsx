import BlurFade from '@/components/magicui/blur-fade'
import {
  BLOG_FOLDERS,
  getActiveFolder,
  getBlogPosts,
  getDescendantFolderIds,
  getFolderTree,
  normalizePage,
  paginatePosts,
  PAGE_SIZE
} from '@/features/blog/blog-data'
import { BlogFileTree } from '@/features/blog/blog-file-tree'
import { BlogPostList } from '@/features/blog/blog-post-list'
import { BlogTreeRegistry } from '@/features/blog/blog-tree-store'
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
  searchParams
}: {
  searchParams: Promise<{ folder?: string; page?: string }>
}) {
  const { folder, page: pageParam } = await searchParams
  const sortedPosts = await getBlogPosts()
  const folderTree = getFolderTree(sortedPosts)
  const activeFolderId = getActiveFolder(folder)
  const activeFolder = activeFolderId
    ? BLOG_FOLDERS.find((item) => item.id === activeFolderId)
    : undefined
  const activeFolderIds = activeFolderId
    ? getDescendantFolderIds(activeFolderId)
    : undefined
  const folderPosts = activeFolderIds
    ? sortedPosts.filter((post) => activeFolderIds.has(post.folderId))
    : sortedPosts
  const currentPage = normalizePage(
    pageParam,
    Math.ceil(folderPosts.length / PAGE_SIZE)
  )
  const { posts, pagination } = paginatePosts(folderPosts, currentPage)

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-5xl flex-col px-6 pb-0 lg:block lg:min-h-0 lg:pb-10'>
      <BlogTreeRegistry tree={folderTree} />
      <section
        className='grid min-h-0 flex-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]'
        id='blog'
      >
        <BlogFileTree
          activeFolderId={activeFolderId}
          delay={BLUR_FADE_DELAY}
          tree={folderTree}
        />

        <div className='flex min-h-0 flex-col lg:block'>
          <BlurFade delay={BLUR_FADE_DELAY}>
            <h1 className='mb-2 text-2xl font-semibold tracking-tight'>
              {activeFolder?.label ?? (metadata.title as string)}
              <span className='ml-2 inline-flex rounded-md border border-border bg-card px-2 py-1 align-middle text-sm text-muted-foreground'>
                {folderPosts.length} 篇文章
              </span>
            </h1>
            <p className='text-sm text-muted-foreground'>
              {metadata.description}
            </p>
          </BlurFade>

          <BlogPostList
            activeFolderId={activeFolderId}
            delay={BLUR_FADE_DELAY}
            pagination={pagination}
            posts={posts}
          />
        </div>
      </section>
    </main>
  )
}
