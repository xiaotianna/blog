import type { BlogTreeNode } from './blog-data'

export type BlogDirectoryPathOption = {
  id: string
  label: string
  path: string
}

type BlogFolderNode = Extract<BlogTreeNode, { type: 'folder' }>

export const ROOT_DIRECTORY_PATH = '__root__'

export function getDirectoryPathOptions(tree: BlogTreeNode[]) {
  const folders = tree.filter(
    (node): node is BlogFolderNode => node.type === 'folder'
  )
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]))

  return folders.map((folder) => {
    const segments: string[] = []
    let current: BlogFolderNode | undefined = folder

    while (current) {
      segments.unshift(current.slug ?? current.id)
      current = current.parentId ? foldersById.get(current.parentId) : undefined
    }

    return {
      id: folder.id,
      label: folder.label,
      path: segments.join('/')
    } satisfies BlogDirectoryPathOption
  })
}

export function getDefaultDirectoryPath(
  options: BlogDirectoryPathOption[],
  activeFolderId?: string
) {
  return options.find((option) => option.id === activeFolderId)?.path ?? ''
}
