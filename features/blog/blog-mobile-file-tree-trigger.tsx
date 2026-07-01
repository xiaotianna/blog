'use client'

import { BlogFileTreeContent } from '@/features/blog/blog-file-tree'
import { useBlogTreeSnapshot } from '@/features/blog/blog-tree-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { TextAlignJustify, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function BlogMobileFileTreeTrigger() {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const { tree } = useBlogTreeSnapshot()

  const activeFolderId = searchParams.get('folder') ?? undefined

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={setOpen}
    >
      <DialogPrimitive.Trigger asChild>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='打开博客文件树'
          title='打开博客文件树'
          className='lg:hidden'
        >
          <TextAlignJustify className='size-4' />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0' />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[min(86vw,22rem)] flex-col border-r border-border bg-background p-5 shadow-xl outline-none',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left'
          )}
        >
          <div className='mb-5 flex items-center justify-between gap-3'>
            <DialogPrimitive.Title className='text-base font-semibold'>
              博客文件树
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                aria-label='关闭博客文件树'
              >
                <X className='size-4' />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className='min-h-0 flex-1 overflow-hidden'>
            {tree.length > 0 ? (
              <BlogFileTreeContent
                activeFolderId={activeFolderId}
                className='h-full min-h-0'
                navClassName='max-h-none flex-1'
                onNavigate={() => setOpen(false)}
                tree={tree}
              />
            ) : (
              <p className='text-sm text-muted-foreground'>
                文件树暂时不可用。
              </p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
