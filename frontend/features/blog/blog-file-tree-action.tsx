import { PermissionGate } from '@/components/server/permission-gate'
import { Button } from '@/components/ui/button'

export function BlogFileTreeAction() {
  return (
    <PermissionGate>
      <Button className='mt-2'>新增</Button>
    </PermissionGate>
  )
}
