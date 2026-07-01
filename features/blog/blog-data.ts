import { readdir, readFile } from 'node:fs/promises'
import { extname, join, parse } from 'node:path'

import { parseFrontmatter } from '@/components/markdown/parse-frontmatter'

export const PAGE_SIZE = 10

const MARKDOWN_EXTENSIONS = ['.mdx', '.md'] as const
const DEFAULT_FOLDER_ID = 'uncategorized'

export type BlogPost = {
  slug: string
  title: string
  description?: string
  publishedAt: string
  folderId: string
}

export type Pagination = {
  page: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type BlogFolder = {
  id: string
  label: string
  parentId?: string
}

export type BlogFolderNode = BlogFolder & {
  type: 'folder'
  depth: number
  count: number
}

export type BlogPostNode = BlogPost & {
  type: 'post'
  depth: number
}

export type BlogTreeNode = BlogFolderNode | BlogPostNode

export const BLOG_FOLDERS: BlogFolder[] = [
  { id: 'frontend', label: '前端' },
  { id: 'nextjs', label: 'Next.js', parentId: 'frontend' },
  { id: 'bundler', label: '构建工具', parentId: 'frontend' },
  { id: 'components', label: '组件', parentId: 'frontend' },
  { id: DEFAULT_FOLDER_ID, label: '未分类' }
]

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

function getFolderId(metadata: Record<string, unknown>) {
  return typeof metadata.folderId === 'string' && metadata.folderId.trim()
    ? metadata.folderId
    : DEFAULT_FOLDER_ID
}

export async function getBlogPosts(): Promise<BlogPost[]> {
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
        publishedAt: getPublishedAt(metadata),
        folderId: getFolderId(metadata)
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

export function getDescendantFolderIds(folderId: string) {
  const descendantIds = new Set<string>([folderId])
  let added = true

  while (added) {
    added = false

    for (const folder of BLOG_FOLDERS) {
      if (
        folder.parentId &&
        descendantIds.has(folder.parentId) &&
        !descendantIds.has(folder.id)
      ) {
        descendantIds.add(folder.id)
        added = true
      }
    }
  }

  return descendantIds
}

function getFolderPostCount(folderId: string, posts: BlogPost[]) {
  const folderIds = getDescendantFolderIds(folderId)

  return posts.filter((post) => folderIds.has(post.folderId)).length
}

export function getFolderTree(posts: BlogPost[]) {
  const nodes: BlogTreeNode[] = []

  function appendChildren(parentId: string | undefined, depth: number) {
    for (const folder of BLOG_FOLDERS.filter(
      (item) => item.parentId === parentId
    )) {
      nodes.push({
        ...folder,
        type: 'folder',
        depth,
        count: getFolderPostCount(folder.id, posts)
      })

      appendChildren(folder.id, depth + 1)

      for (const post of posts.filter((item) => item.folderId === folder.id)) {
        nodes.push({
          ...post,
          type: 'post',
          depth: depth + 1
        })
      }
    }
  }

  appendChildren(undefined, 0)

  return nodes
}

export function getActiveFolder(folder: string | undefined) {
  if (folder && BLOG_FOLDERS.some((item) => item.id === folder)) {
    return folder
  }

  return undefined
}

export function normalizePage(page: string | undefined, totalPages: number) {
  const parsedPage = Number(page)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return Math.min(parsedPage, Math.max(totalPages, 1))
}

export function paginatePosts(posts: BlogPost[], page: number) {
  const totalPages = Math.max(Math.ceil(posts.length / PAGE_SIZE), 1)
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
