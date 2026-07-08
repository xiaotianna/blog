import { AuthSessionRefresh } from '@/features/auth/auth-session-refresh'
import { HeaderLogoutDialog } from '@/features/auth/header-logout-dialog'
import { getAuthToken } from '@/lib/server/auth'
import { getCurrentUser } from '@/lib/server/current-user'

export async function HeaderLogoutAction() {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    return <HeaderLogoutDialog />
  }

  const token = await getAuthToken()

  if (token) {
    return <AuthSessionRefresh />
  }

  return null
}
