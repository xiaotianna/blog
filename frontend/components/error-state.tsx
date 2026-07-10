'use client'

import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
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
  const title = isNotFound ? '404' : '页面暂时不可用'
  const fallbackDescription = isNotFound
    ? '这里什么都没有～'
    : '服务响应异常，请稍后重试'

  return (
    <main
      className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full flex-col px-6 pb-20 lg:px-0'
      data-page-state='error'
    >
      <div className='flex flex-1 flex-col items-center justify-center text-center'>
        <AlertTriangle className='mb-5 size-10 text-muted-foreground' />
        <h1 className='text-4xl font-semibold tracking-tight'>{title}</h1>
        <p className='mt-4 text-muted-foreground'>
          {message || description || fallbackDescription}
        </p>
        <div className='mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3'>
          {onRetry ? (
            <button
              className='inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary'
              type='button'
              onClick={onRetry}
            >
              <RotateCcw className='size-4' />
              重试
            </button>
          ) : null}
          <Link
            className='inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary'
            href='/blog'
          >
            <ArrowLeft className='size-4' />
            返回博客
          </Link>
        </div>
      </div>
    </main>
  )
}
