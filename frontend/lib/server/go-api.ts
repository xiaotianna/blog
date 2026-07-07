import { getAuthToken } from '@/lib/server/auth'

const DEFAULT_GO_API_BASE_URL = 'http://localhost:8000'

type GoApiFetchOptions = RequestInit & {
  auth?: boolean
}

export type ApiResponse<T> = {
  code: number
  message: string
  data?: T
}

export function getGoApiBaseUrl() {
  return (
    process.env.GO_API_BASE_URL ??
    process.env.API_BASE_URL ??
    DEFAULT_GO_API_BASE_URL
  ).replace(/\/$/, '')
}

export async function goApiFetch(
  path: string,
  { auth = true, headers, ...init }: GoApiFetchOptions = {}
) {
  const requestHeaders = new Headers(headers)

  if (auth) {
    const token = await getAuthToken()

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  return fetch(`${getGoApiBaseUrl()}${normalizePath(path)}`, {
    cache: 'no-store',
    ...init,
    headers: requestHeaders
  })
}

export async function readApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return {
      code: response.status,
      message: '服务响应异常，请稍后重试'
    }
  }

  try {
    return (await response.json()) as ApiResponse<T>
  } catch {
    return {
      code: response.status,
      message: '服务响应异常，请稍后重试'
    }
  }
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}
