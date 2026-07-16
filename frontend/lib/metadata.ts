import { siteConfig, siteUrl } from '@/config/site'
import type { Metadata } from 'next'

type PageMetadataOptions = {
  description?: string
  image?: string
  keywords?: string[]
  modifiedTime?: string
  noIndex?: boolean
  path?: string
  publishedTime?: string
  tags?: string[]
  title?: string
  type?: 'article' | 'website'
}

const DEFAULT_OG_IMAGE_PATH = 'image/me.png'

export function buildPageMetadata({
  description = siteConfig.description,
  image,
  keywords = [],
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
  const imageUrl = image || getDefaultOgImageUrl()
  const isDefaultImage = !image
  const images = [
    {
      alt: `${pageTitle} 缩略图`,
      height: isDefaultImage ? 1080 : 630,
      url: imageUrl,
      width: isDefaultImage ? 1080 : 1200
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

export function getDefaultOgImageUrl() {
  return new URL(DEFAULT_OG_IMAGE_PATH, siteUrl).toString()
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

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}
