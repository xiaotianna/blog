'use client'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { AlertTriangle, Home, NotebookText, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type ErrorStateProps = {
  description?: string
  message?: string
  onRetry?: () => void
  variant?: 'error' | 'not-found'
}

export function ErrorState({
  description,
  message,
  onRetry,
  variant = 'error'
}: ErrorStateProps) {
  const isNotFound = variant === 'not-found'
  const title = isNotFound ? '这里什么都没有～' : '页面暂时不可用'
  const fallbackDescription = isNotFound
    ? '这个地址可能已经移动，或者暂时还没有内容。'
    : '服务响应异常，请稍后重试'

  return (
    <section
      className='flex min-h-[calc(100dvh-12rem)] items-center justify-center px-1 pb-10'
      data-page-state='error'
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <AlertTriangle />
          </EmptyMedia>
          {isNotFound ? (
            <p className='font-mono text-xs uppercase tracking-normal text-muted-foreground'>
              404
            </p>
          ) : null}
          <EmptyTitle className='text-base'>{title}</EmptyTitle>
          <EmptyDescription>
            {message || description || fallbackDescription}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className='mt-2 flex-row justify-center'>
          {onRetry ? (
            <Button
              type='button'
              onClick={onRetry}
            >
              <RotateCcw className='size-4' />
              重试
            </Button>
          ) : null}
          <Button
            asChild
            variant={isNotFound ? 'default' : 'outline'}
          >
            <Link href='/'>
              <Home className='size-4' />
              回到首页
            </Link>
          </Button>
          {isNotFound ? (
            <Button
              asChild
              variant='outline'
            >
              <Link href='/blog'>
                <NotebookText className='size-4' />
                看文章
              </Link>
            </Button>
          ) : null}
        </EmptyContent>
      </Empty>
    </section>
  )
}
