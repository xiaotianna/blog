type ArticleCoverUrlOptions = {
  absolute?: boolean
}

const DEFAULT_GO_PUBLIC_BASE_URL = 'http://localhost:8000'

export function getPublicArticleCoverUrl(
  cover: string | null | undefined,
  options: ArticleCoverUrlOptions = {}
) {
  if (!cover) {
    return ''
  }

  const coverPath = normalizeArticleCoverPath(cover)

  if (!coverPath) {
    return cover
  }

  if (!options.absolute) {
    return coverPath
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL

  if (!baseUrl) {
    return coverPath
  }

  return new URL(coverPath, ensureTrailingSlash(baseUrl)).toString()
}

function normalizeArticleCoverPath(cover: string) {
  if (cover.startsWith('/uploads/')) {
    return cover
  }

  if (cover.startsWith('uploads/')) {
    return `/${cover}`
  }

  if (!/^https?:\/\//.test(cover)) {
    return ''
  }

  const goBaseUrls = [
    process.env.GO_PUBLIC_BASE_URL,
    process.env.GO_API_BASE_URL,
    process.env.API_BASE_URL,
    DEFAULT_GO_PUBLIC_BASE_URL
  ].filter(Boolean)

  for (const baseUrl of goBaseUrls) {
    const base = new URL(ensureTrailingSlash(baseUrl as string))
    const url = new URL(cover)

    if (url.origin === base.origin && url.pathname.startsWith('/uploads/')) {
      return `${url.pathname}${url.search}`
    }
  }

  return ''
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}
