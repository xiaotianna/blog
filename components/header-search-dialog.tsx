'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Search, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

const SEARCH_ITEMS = [
  'Introduction',
  'Getting Started',
  'App Router',
  'Architecture',
  'Pages Router',
  'API Reference',
  'Accessibility'
]

export function HeaderSearchDialog() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='打开搜索'
          title='打开搜索'
        >
          <Search className='size-4' />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:bg-black/45' />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-4 right-4 top-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl shadow-foreground/10 outline-none',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[1.04] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'md:left-1/2 md:right-auto md:top-[9vh] md:h-[25rem] md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2'
          )}
        >
          <DialogPrimitive.Title className='sr-only'>
            搜索文档
          </DialogPrimitive.Title>

          <div className='shrink-0 border-b border-border'>
            <div className='flex h-14 items-center gap-3 px-4'>
              <input
                type='text'
                aria-label='搜索内容'
                placeholder='What are you searching for?'
                className='h-full min-w-0 flex-1 bg-transparent text-lg font-normal outline-none placeholder:text-muted-foreground'
              />
              <DialogPrimitive.Close asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  aria-label='关闭搜索'
                  className='shrink-0 text-muted-foreground hover:text-foreground'
                >
                  <X className='size-4' />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto p-2'>
            <div className='flex flex-col gap-1'>
              {SEARCH_ITEMS.map((item, index) => (
                <button
                  type='button'
                  key={item}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted',
                    index === 0 && 'bg-muted'
                  )}
                >
                  <FileText
                    aria-hidden
                    className='size-4 shrink-0 text-muted-foreground'
                    strokeWidth={1.9}
                  />
                  <span className='truncate'>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
