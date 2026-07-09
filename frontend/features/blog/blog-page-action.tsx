import { PermissionGate } from '@/components/server/permission-gate'

import type { BlogDirectoryOption } from './blog-data'
import { BlogCreateDialog } from './blog-create-dialog'

type BlogPageActionProps = {
  activePath?: string
  allowed?: boolean
  directoryOptions: BlogDirectoryOption[]
}

export function BlogPageAction({
  activePath,
  allowed,
  directoryOptions
}: BlogPageActionProps) {
  return (
    <PermissionGate allowed={allowed}>
      <BlogCreateDialog
        activePath={activePath}
        directoryOptions={directoryOptions}
      />
    </PermissionGate>
  )
}
