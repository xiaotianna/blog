import { PermissionGate } from '@/components/server/permission-gate'

import type { BlogDirectoryOption } from './blog-data'
import { BlogCreateDialog } from './blog-create-dialog'

type BlogPageActionProps = {
  activePath?: string
  directoryOptions: BlogDirectoryOption[]
}

export function BlogPageAction({
  activePath,
  directoryOptions
}: BlogPageActionProps) {
  return (
    <PermissionGate>
      <BlogCreateDialog
        activePath={activePath}
        directoryOptions={directoryOptions}
      />
    </PermissionGate>
  )
}
