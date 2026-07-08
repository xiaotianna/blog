import { getCurrentUser } from '@/lib/server/current-user'

export async function isAuthenticated() {
  const user = await getCurrentUser()

  return Boolean(user)
}
