import { siteUrl } from '@/config/site'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  if (isLocalSite()) {
    return {
      rules: {
        disallow: '/',
        userAgent: '*'
      }
    }
  }

  return {
    host: siteUrl.origin,
    rules: {
      allow: '/',
      disallow: ['/api/', '/edit/', '/login'],
      userAgent: '*'
    },
    sitemap: new URL('sitemap.xml', siteUrl).toString()
  }
}

function isLocalSite() {
  return siteUrl.hostname === 'localhost' || siteUrl.hostname === '127.0.0.1'
}
