import { siteConfig, siteUrl } from '@/config/site'
import type { Metadata } from 'next'

type PageMetadataOptions = {
  description?: string
  image?: string
  keywords?: string[]
  label?: string
  modifiedTime?: string
  noIndex?: boolean
  path?: string
  publishedTime?: string
  tags?: string[]
  title?: string
  type?: 'article' | 'website'
}

const MAX_OG_TITLE_LENGTH = 88
const MAX_OG_DESCRIPTION_LENGTH = 160
const MAX_OG_TAGS = 4

export function buildPageMetadata({
  description = siteConfig.description,
  image,
  keywords = [],
  label = 'PREVIEW',
  modifiedTime,
  noIndex = false,
  path = '/',
  publishedTime,
  tags = [],
  title,
  type = 'website'
}: PageMetadataOptions = {}): Metadata {
  const pageTitle = title?.trim() || siteConfig.name
  const pageDescription = description.trim() || siteConfig.description
  const pageKeywords = uniqueStrings([
    ...siteConfig.keywords,
    ...keywords,
    ...tags
  ])
  const canonical = new URL(stripLeadingSlash(path), siteUrl)
  const imageUrl = image || buildOgImageUrl({
    description: pageDescription,
    label,
    tags,
    title: pageTitle
  })
  const images = [
    {
      alt: `${pageTitle} 缩略图`,
      height: 630,
      url: imageUrl,
      width: 1200
    }
  ]
  const sharedOpenGraph = {
    description: pageDescription,
    images,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: pageTitle,
    url: canonical
  }

  return {
    alternates: {
      canonical
    },
    description: pageDescription,
    keywords: pageKeywords,
    openGraph:
      type === 'article'
        ? {
            ...sharedOpenGraph,
            modifiedTime: normalizeMetadataDate(modifiedTime),
            publishedTime: normalizeMetadataDate(publishedTime),
            tags: uniqueStrings(tags),
            type: 'article'
          }
        : {
            ...sharedOpenGraph,
            type: 'website'
          },
    robots: noIndex
      ? {
          follow: false,
          googleBot: {
            follow: false,
            index: false,
            noimageindex: true
          },
          index: false,
          noarchive: true
        }
      : {
          follow: true,
          googleBot: {
            follow: true,
            index: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1
          },
          index: true
        },
    title: title ? title : { absolute: siteConfig.name },
    twitter: {
      card: 'summary_large_image',
      description: pageDescription,
      images: [imageUrl],
      title: pageTitle
    }
  }
}

export function buildOgImageUrl({
  description,
  label,
  tags = [],
  title
}: {
  description?: string
  label?: string
  tags?: string[]
  title: string
}) {
  const url = new URL('og', siteUrl)

  url.searchParams.set('title', truncate(title, MAX_OG_TITLE_LENGTH))

  if (description?.trim()) {
    url.searchParams.set(
      'description',
      truncate(description.trim(), MAX_OG_DESCRIPTION_LENGTH)
    )
  }

  if (label?.trim()) {
    url.searchParams.set('label', truncate(label.trim(), 24))
  }

  for (const tag of uniqueStrings(tags).slice(0, MAX_OG_TAGS)) {
    url.searchParams.append('tag', truncate(tag, 24))
  }

  return url.toString()
}

function normalizeMetadataDate(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function stripLeadingSlash(value: string) {
  return value.replace(/^\/+/, '')
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}
