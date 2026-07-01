import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Home, NotebookText } from 'lucide-react'
import Link from 'next/link'
import { Highlighter } from '@/components/ui/highlighter'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main className='flex min-h-screen items-center justify-center px-6'>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Image
              src='/image/emoji.webp'
              width={128}
              height={128}
              alt='404'
              loading='eager'
              className='w-32 h-auto'
            />
          </EmptyMedia>
          <p className='font-mono'>404</p>
          <EmptyTitle className='text-base'>
            {' '}
            <Highlighter
              action='highlight'
              color='#87CEFA'
            >
              这里什么都没有～
            </Highlighter>{' '}
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent className='flex-row justify-center mt-2'>
          <Button asChild>
            <Link href='/'>
              <Home className='size-4' />
              回到首页
            </Link>
          </Button>
          <Button
            asChild
            variant='outline'
          >
            <Link href='/blog'>
              <NotebookText className='size-4' />
              看文章
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
