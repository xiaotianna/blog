export const normalizeUrlPrefix = (url: string) => {
  return url.replace(/^https?:\/\//i, '').replace(/^\/\//, '').replace(/\/+$/, '')
}

export const isInternalUrl = (
  href: string | undefined,
  currentHost: string | null
) => {
  if (!href || href.startsWith('/') || href.startsWith('#')) {
    return true
  }

  if (!currentHost) {
    return false
  }

  const normalizedHref = normalizeUrlPrefix(href)
  const normalizedHost = normalizeUrlPrefix(currentHost)

  return (
    normalizedHref === normalizedHost ||
    normalizedHref.startsWith(`${normalizedHost}/`) ||
    normalizedHref.startsWith(`${normalizedHost}?`) ||
    normalizedHref.startsWith(`${normalizedHost}#`)
  )
}

export const getExternalRel = (rel: string | undefined) => {
  return Array.from(
    new Set([...(rel?.split(/\s+/).filter(Boolean) ?? []), 'noopener', 'noreferrer'])
  ).join(' ')
}
