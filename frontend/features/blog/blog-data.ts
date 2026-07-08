import { goApiFetch, readApiResponse } from '@/lib/server/go-api'

export const PAGE_SIZE = 10

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
  slug?: string
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

type CategoryCatalogNode = {
  id: string
  type: 'category' | 'article'
  title: string
  slug: string
  description?: string
  parentId?: string | null
  categoryId?: string | null
  publishedAt?: string | null
  children?: CategoryCatalogNode[]
}

export async function getFolderTree(): Promise<BlogTreeNode[]> {
  try {
    const response = await goApiFetch('/category/catalog', {
      auth: false
    })
    const result = await readApiResponse<CategoryCatalogNode[]>(response)

    if (!response.ok || !result.data) {
      return []
    }

    return toBlogTreeNodes(result.data)
  } catch {
    return []
  }
}

export function getBlogPosts(tree: BlogTreeNode[]): BlogPost[] {
  return tree
    .filter((node): node is BlogPostNode => node.type === 'post')
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime()
      const timeB = new Date(b.publishedAt).getTime()

      if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
        return timeB - timeA
      }

      return a.title.localeCompare(b.title)
    })
}

export function getFolderById(tree: BlogTreeNode[], folderId?: string) {
  if (!folderId) {
    return undefined
  }

  return tree.find(
    (node): node is BlogFolderNode =>
      node.type === 'folder' && node.id === folderId
  )
}

export function getDescendantFolderIds(folderId: string, tree: BlogTreeNode[]) {
  const folders = tree.filter(
    (node): node is BlogFolderNode => node.type === 'folder'
  )
  const descendantIds = new Set<string>([folderId])
  let added = true

  while (added) {
    added = false

    for (const folder of folders) {
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

export function getActiveFolder(
  tree: BlogTreeNode[],
  folder: string | undefined
) {
  return getFolderById(tree, folder)?.id
}

function getFolderPostCount(folderId: string, tree: BlogTreeNode[]) {
  const folderIds = getDescendantFolderIds(folderId, tree)

  return tree.filter(
    (node): node is BlogPostNode =>
      node.type === 'post' && folderIds.has(node.folderId)
  ).length
}

function toBlogTreeNodes(nodes: CategoryCatalogNode[]) {
  const tree: BlogTreeNode[] = []

  appendCatalogNodes(tree, nodes, undefined, 0)

  return tree.map((node) =>
    node.type === 'folder'
      ? {
          ...node,
          count: getFolderPostCount(node.id, tree)
        }
      : node
  )
}

function appendCatalogNodes(
  tree: BlogTreeNode[],
  nodes: CategoryCatalogNode[],
  parentId: string | undefined,
  depth: number
) {
  for (const node of nodes) {
    if (node.type === 'category') {
      const folderId = node.id

      tree.push({
        id: folderId,
        label: node.title,
        parentId,
        slug: node.slug,
        type: 'folder',
        depth,
        count: 0
      })

      appendCatalogNodes(tree, node.children ?? [], folderId, depth + 1)
      continue
    }

    if (node.categoryId) {
      tree.push({
        slug: node.slug,
        title: node.title,
        description: node.description,
        publishedAt: formatPublishedAt(node.publishedAt),
        folderId: node.categoryId,
        type: 'post',
        depth
      })
    }
  }
}

function formatPublishedAt(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().slice(0, 10)
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
