export type CollapsibleBlogTreeNode =
  | {
      id: string
      label: string
      parentId?: string
      type: 'folder'
      depth: number
      count: number
    }
  | {
      slug: string
      title: string
      description?: string
      publishedAt: string
      folderId: string
      type: 'post'
      depth: number
    }

export function getVisibleBlogTreeNodes<T extends CollapsibleBlogTreeNode>(
  tree: T[],
  collapsedFolderIds: Set<string>
) {
  const parentByFolderId = new Map<string, string | undefined>()

  for (const node of tree) {
    if (node.type === 'folder') {
      parentByFolderId.set(node.id, node.parentId)
    }
  }

  return tree.filter((node) => {
    let folderId = node.type === 'folder' ? node.parentId : node.folderId

    while (folderId) {
      if (collapsedFolderIds.has(folderId)) {
        return false
      }

      folderId = parentByFolderId.get(folderId)
    }

    return true
  })
}
