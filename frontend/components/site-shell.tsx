import { Header } from '@/components/header'
import { FlickeringGrid } from '@/components/magicui/flickering-grid'
import type { ReactNode } from 'react'

type SiteShellProps = Readonly<{
  children: ReactNode
}>

export function SiteShell({ children }: SiteShellProps) {
  return (
    <>
      <div className='absolute inset-x-0 top-0 z-0 h-[100px] overflow-hidden'>
        <FlickeringGrid
          className='h-full w-full'
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: 'linear-gradient(to bottom, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
          }}
        />
      </div>
      <div className='relative z-10'>
        <div className='mx-auto min-h-screen w-full max-w-260 px-12 max-xl:px-8 max-md:px-5'>
          <main className='min-w-0 pt-14 [&:has([data-page-state=error])_[data-header-actions]]:hidden max-md:py-9'>
            <Header />
            <div>{children}</div>
          </main>
        </div>
      </div>
    </>
  )
}
