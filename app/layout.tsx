import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { FlickeringGrid } from '@/components/magicui/flickering-grid'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import '@/styles/article.css'
import { Header } from '@/components/header'

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
          <div className='absolute inset-x-0 top-0 z-0 h-[100px] overflow-hidden'>
            <FlickeringGrid
              className='h-full w-full'
              squareSize={2}
              gridGap={2}
              style={{
                maskImage: 'linear-gradient(to bottom, black, transparent)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, black, transparent)'
              }}
            />
          </div>
          <div className='relative z-10'>
            <div className='mx-auto min-h-screen w-full max-w-260 px-12 max-xl:px-8 max-md:px-5'>
              <main className='min-w-0 pt-14 max-md:py-9'>
                <Header />
                <div>{children}</div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
