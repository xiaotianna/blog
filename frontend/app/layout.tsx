import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import '@/styles/article.css'
import { cn } from '@/lib/utils'
import { siteConfig, siteUrl } from '@/config/site'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLd } from '@/components/metadata/json-ld'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  fallback: [
    'Geist Sans',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif'
  ]
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const personId = new URL('#person', siteUrl).toString()
const websiteId = new URL('#website', siteUrl).toString()
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@id': websiteId,
      '@type': 'WebSite',
      description: siteConfig.description,
      inLanguage: 'zh-CN',
      name: siteConfig.name,
      publisher: { '@id': personId },
      url: siteUrl.toString()
    },
    {
      '@id': personId,
      '@type': 'Person',
      image: new URL('image/me.png', siteUrl).toString(),
      name: siteConfig.author,
      url: siteUrl.toString()
    }
  ]
}

export const metadata: Metadata = {
  ...buildPageMetadata(),
  applicationName: siteConfig.name,
  authors: [
    {
      name: siteConfig.author,
      url: siteUrl
    }
  ],
  category: 'technology',
  creator: siteConfig.author,
  metadataBase: siteUrl,
  publisher: siteConfig.author,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='zh-CN'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={cn(
          'relative min-h-screen selection:bg-foreground selection:text-background',
          // 在最外层统一定义滚动条样式，覆盖内部所有可滚动容器；data-scrollbar="hidden" 除外
          '**:scrollbar-thin **:[scrollbar-color:var(--muted)_transparent] [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar]:w-2.5 [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:rounded-full [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:border-2 [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:border-solid [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:border-transparent [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:bg-muted-foreground/25 [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:bg-clip-content [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-track]:bg-transparent [&_*:not([data-scrollbar="hidden"]):hover::-webkit-scrollbar-thumb]:bg-muted-foreground/45'
        )}
      >
        <JsonLd data={websiteJsonLd} />
        <ThemeProvider>
          {children}
          <Toaster position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  )
}
