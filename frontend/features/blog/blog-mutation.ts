import { goApiFetch, readApiResponse } from '@/lib/server/go-api'
import { isAuthenticated } from '@/lib/server/permissions/check'
import { revalidatePath } from 'next/cache'

export type BlogMutationActionResult = {
  ok: boolean
  message?: string
  path?: string
}

type BlogMutationData = {
  id?: string
  path?: string
}

type RunBlogMutationOptions = {
  body?: unknown
  failureMessage: string
  method: 'DELETE' | 'PATCH' | 'POST'
  path: string
  serviceUnavailableMessage: string
  successMessage: string
}

export async function runBlogMutation<T extends BlogMutationData>({
  body,
  failureMessage,
  method,
  path,
  serviceUnavailableMessage,
  successMessage
}: RunBlogMutationOptions): Promise<BlogMutationActionResult> {
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

  try {
    const response = await goApiFetch(
      path,
      body === undefined
        ? {
            method
          }
        : {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
    )
    const result = await readApiResponse<T>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || failureMessage
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || successMessage,
      path: result.data.path
    }
  } catch {
    return {
      ok: false,
      message: serviceUnavailableMessage
    }
  }
}

async function ensureAuthenticated(): Promise<BlogMutationActionResult | null> {
  if (await isAuthenticated()) {
    return null
  }

  return {
    ok: false,
    message: '请先登录后再操作'
  }
}
