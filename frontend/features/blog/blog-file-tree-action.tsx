import { PermissionGate } from '@/components/server/permission-gate'

import type { BlogTreeNode } from './blog-data'
import { BlogCreateDialog } from './blog-create-dialog'
import { getDirectoryPathOptions } from './blog-directory-paths'

type BlogFileTreeActionProps = {
  activeFolderId?: string
  tree: BlogTreeNode[]
}

export function BlogFileTreeAction({
  activeFolderId,
  tree
}: BlogFileTreeActionProps) {
  const directoryOptions = getDirectoryPathOptions(tree)

  return (
    <PermissionGate>
      <BlogCreateDialog
        activeFolderId={activeFolderId}
        directoryOptions={directoryOptions}
        tree={tree}
      />
    </PermissionGate>
  )
}
