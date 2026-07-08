import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import '@/styles/article.css'
import { cn } from '@/lib/utils'

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
      <body
        className={cn(
          'relative min-h-screen selection:bg-foreground selection:text-background',
          // 在最外层统一定义滚动条样式，覆盖内部所有可滚动容器；data-scrollbar="hidden" 除外
          '**:scrollbar-thin **:[scrollbar-color:var(--muted)_transparent] [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar]:w-2.5 [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:rounded-full [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:border-2 [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:border-solid [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:border-transparent [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:bg-muted-foreground/25 [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-thumb]:bg-clip-content [&_*:not([data-scrollbar="hidden"])::-webkit-scrollbar-track]:bg-transparent [&_*:not([data-scrollbar="hidden"]):hover::-webkit-scrollbar-thumb]:bg-muted-foreground/45'
        )}
      >
        <ThemeProvider>
          {children}
          <Toaster position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  )
}
