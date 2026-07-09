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
const NOT_FOUND_STATUS = 404

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

export class GoApiError extends Error {
  code: number
  status: number

  constructor({
    code,
    message,
    status
  }: {
    code: number
    message: string
    status: number
  }) {
    super(message)
    this.name = 'GoApiError'
    this.code = code
    this.status = status
  }
}

export class AuthInvalidError extends GoApiError {
  constructor({
    code,
    message,
    status
  }: {
    code: number
    message: string
    status: number
  }) {
    super({ code, message, status })
    this.name = 'AuthInvalidError'
  }
}

export function isGoApiError(error: unknown): error is GoApiError {
  return error instanceof GoApiError
}

export function isNotFoundApiError(error: unknown) {
  return isGoApiError(error) && error.status === NOT_FOUND_STATUS
}

export function isAuthInvalidError(error: unknown) {
  return error instanceof AuthInvalidError
}

export async function requestGoApiData<T>(
  path: string,
  init?: GoApiFetchOptions
) {
  const response = await goApiFetch(path, init)
  const result = await readApiResponse<T>(response)

  if (!response.ok) {
    throw createGoApiError(response.status, result)
  }

  if (typeof result.data === 'undefined') {
    throw new GoApiError({
      code: result.code,
      message: result.message || '服务响应异常，请稍后重试',
      status: response.status
    })
  }

  return result.data
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

function createGoApiError<T>(status: number, result: ApiResponse<T>) {
  const errorProps = {
    code: result.code,
    message: result.message || '服务响应异常，请稍后重试',
    status
  }

  if (status === AUTH_INVALID_STATUS) {
    return new AuthInvalidError(errorProps)
  }

  return new GoApiError(errorProps)
}

async function clearExpiredAuthToken() {
  try {
    await clearAuthToken()
  } catch {
    // Cookie mutation is only available in Server Actions and Route Handlers.
  }
}
