'use server'

import { clearAuthToken, setAuthToken } from '@/lib/server/auth'
import { goApiFetch, readApiResponse } from '@/lib/server/go-api'
import { normalizeInternalRedirect } from '@/lib/redirect'
import { revalidatePath } from 'next/cache'

type LoginUser = {
  id: string
  phone: string
}

type LoginData = {
  token: string
  user: LoginUser
}

export type LoginActionResult = {
  ok: boolean
  message?: string
  redirectTo?: string
}

export type LogoutActionResult = {
  ok: boolean
  message?: string
}

const PHONE_PATTERN = /^1[3-9]\d{9}$/

export async function loginAction(
  formData: FormData
): Promise<LoginActionResult> {
  const phone = String(formData.get('phone') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const redirectTo = normalizeInternalRedirect(formData.get('redirectTo'))

  if (!PHONE_PATTERN.test(phone)) {
    return {
      ok: false,
      message: '请输入正确的手机号'
    }
  }

  if (!password) {
    return {
      ok: false,
      message: '请输入密码'
    }
  }

  try {
    const response = await goApiFetch('/auth/login', {
      auth: false,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, password })
    })
    const result = await readApiResponse<LoginData>(response)

    if (!response.ok || !result.data?.token) {
      return {
        ok: false,
        message: result.message || '登录失败，请稍后重试'
      }
    }

    await setAuthToken(result.data.token)
    revalidatePath('/')
    revalidatePath('/blog')

    return {
      ok: true,
      redirectTo
    }
  } catch {
    return {
      ok: false,
      message: '登录服务暂不可用，请稍后重试'
    }
  }
}

export async function logoutAction(): Promise<LogoutActionResult> {
  let message = '退出登录成功'

  try {
    const response = await goApiFetch('/auth/logout', {
      method: 'POST'
    })
    const result = await readApiResponse<null>(response)

    if (!response.ok) {
      message = result.message || '登录状态已失效'
    }
  } catch {
    message = '退出登录成功'
  }

  await clearAuthToken()
  revalidatePath('/')
  revalidatePath('/blog')

  return {
    ok: true,
    message
  }
}
