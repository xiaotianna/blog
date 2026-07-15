import { siteUrl } from '@/config/site'
import type { MetadataRoute } from 'next'

// robots.txt 必须使用容器运行时的 SITE_URL，避免在构建镜像时
// 因默认的 localhost 地址被静态生成并缓存为 Disallow: /。
export const dynamic = 'force-dynamic'

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
