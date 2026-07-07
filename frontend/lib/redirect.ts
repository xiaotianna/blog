const DEFAULT_AUTH_REDIRECT = '/blog'

export function normalizeInternalRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return DEFAULT_AUTH_REDIRECT
  }

  const redirectTo = value.trim()

  if (
    !redirectTo.startsWith('/') ||
    redirectTo.startsWith('//') ||
    redirectTo.startsWith('/login')
  ) {
    return DEFAULT_AUTH_REDIRECT
  }

  return redirectTo
}
