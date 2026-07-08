import { clearAuthToken, getAuthToken } from '@/lib/server/auth'

const DEFAULT_GO_API_BASE_URL = 'http://localhost:8000'

type GoApiFetchOptions = RequestInit & {
  auth?: boolean
}

export type ApiResponse<T> = {
  code: number
  message: string
  data?: T
}

const AUTH_INVALID_STATUS = 401

const AUTH_INVALID_MESSAGES = new Set([
  '请先登录',
  'token格式错误',
  'token无效或已过期',
  '登录状态已失效，请重新登录'
])

export async function isAuthInvalidResponse(response: Response) {
  if (response.status !== AUTH_INVALID_STATUS) {
    return false
  }

  const message = await readResponseMessage(response)

  return !message || AUTH_INVALID_MESSAGES.has(message)
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

  const response = await fetch(`${getGoApiBaseUrl()}${normalizePath(path)}`, {
    cache: 'no-store',
    ...init,
    headers: requestHeaders
  })

  if (auth && (await isAuthInvalidResponse(response))) {
    await clearExpiredAuthToken()
  }

  return response
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

async function readResponseMessage(response: Response) {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return undefined
  }

  try {
    const result = (await response.clone().json()) as Partial<ApiResponse<never>>

    return typeof result.message === 'string' ? result.message : undefined
  } catch {
    return undefined
  }
}

async function clearExpiredAuthToken() {
  try {
    await clearAuthToken()
  } catch {
    // Cookie mutation is only available in Server Actions and Route Handlers.
  }
}
