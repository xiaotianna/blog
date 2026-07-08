import type { ReactNode } from 'react'

import { isAuthenticated } from '@/lib/server/permissions/check'

type PermissionGateProps = {
  allowed?: boolean
  children: ReactNode
  fallback?: ReactNode
}

export async function PermissionGate({
  allowed,
  children,
  fallback = null
}: PermissionGateProps) {
  const canRender = allowed ?? (await isAuthenticated())

  if (!canRender) {
    return fallback
  }

  return children
}
