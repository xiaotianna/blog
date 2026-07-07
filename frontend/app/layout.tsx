import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import '@/styles/article.css'

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

export const metadata: Metadata = {
  title: "小T1an's Blog",
  description: '一个关于我个人经历和对技术、编程以及生活的思考的博客。'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='relative min-h-screen selection:bg-foreground selection:text-background'>
        <ThemeProvider>
          {children}
          <Toaster position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  )
}
