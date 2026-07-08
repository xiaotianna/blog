import { getAuthToken } from '@/lib/server/auth'
import { goApiFetch, readApiResponse } from '@/lib/server/go-api'

export type CurrentUser = {
  id: string
  phone: string
  role?: string
}

export async function getCurrentUser() {
  const token = await getAuthToken()

  if (!token) {
    return null
  }

  try {
    const response = await goApiFetch('/auth/me')

    if (!response.ok) {
      return null
    }

    const result = await readApiResponse<CurrentUser>(response)

    return result.data ?? null
  } catch {
    return null
  }
}
