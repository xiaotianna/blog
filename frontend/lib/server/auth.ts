import { cookies } from 'next/headers'

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ??
  (process.env.NODE_ENV === 'production'
    ? '__Host-access_token'
    : 'access_token')

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24

export async function getAuthToken() {
  return (await cookies()).get(AUTH_COOKIE_NAME)?.value
}

export async function hasAuthToken() {
  return Boolean(await getAuthToken())
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE
  })
}

export async function clearAuthToken() {
  const cookieStore = await cookies()

  cookieStore.delete(AUTH_COOKIE_NAME)
}
