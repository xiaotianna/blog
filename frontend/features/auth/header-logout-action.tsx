import { HeaderLogoutDialog } from '@/features/auth/header-logout-dialog'
import { hasAuthToken } from '@/lib/server/auth'

export async function HeaderLogoutAction() {
  const isLoggedIn = await hasAuthToken()

  if (!isLoggedIn) {
    return null
  }

  return <HeaderLogoutDialog />
}
