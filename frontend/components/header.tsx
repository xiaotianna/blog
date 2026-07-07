import { HeaderLogoutAction } from '@/features/auth/header-logout-action'
import { HeaderClient } from '@/components/header-client'

export async function Header() {
  return <HeaderClient authAction={<HeaderLogoutAction />} />
}
