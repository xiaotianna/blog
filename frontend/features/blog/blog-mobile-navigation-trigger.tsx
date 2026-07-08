'use client'

import { BlogDetailTableOfContentsContent } from '@/features/blog-details/blog-detail-table-of-contents'
import { useBlogDetailTableOfContentsSnapshot } from '@/features/blog-details/blog-detail-table-of-contents-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { TextAlignJustify, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

type BlogMobileNavigationContent = {
  content: ReactNode
  emptyMessage: string
  title: string
  triggerClassName: string
}

function BlogMobileNavigationDrawer({
  children,
  open,
  setOpen,
  title,
  triggerClassName
}: {
  children: ReactNode
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  triggerClassName: string
}) {
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
          aria-label={`打开${title}`}
          title={`打开${title}`}
          className={triggerClassName}
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
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                aria-label={`关闭${title}`}
              >
                <X className='size-4' />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className='min-h-0 flex-1 overflow-hidden'>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function BlogMobileNavigationTrigger() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { items } = useBlogDetailTableOfContentsSnapshot()

  const navigationContent = getBlogMobileNavigationContent({
    items,
    onNavigate: () => setOpen(false),
    pathname
  })

  if (!navigationContent) {
    return null
  }

  return (
    <BlogMobileNavigationDrawer
      open={open}
      setOpen={setOpen}
      title={navigationContent.title}
      triggerClassName={navigationContent.triggerClassName}
    >
      {navigationContent.content ?? (
        <p className='text-sm text-muted-foreground'>
          {navigationContent.emptyMessage}
        </p>
      )}
    </BlogMobileNavigationDrawer>
  )
}

function getBlogMobileNavigationContent({
  items,
  onNavigate,
  pathname
}: {
  items: Parameters<typeof BlogDetailTableOfContentsContent>[0]['items']
  onNavigate: () => void
  pathname: string
}): BlogMobileNavigationContent | null {
  if (pathname.startsWith('/post/')) {
    return {
      title: '文章目录',
      emptyMessage: '文章目录为空。',
      triggerClassName: 'lg:hidden',
      content:
        items.length > 0 ? (
          <BlogDetailTableOfContentsContent
            className='h-full max-h-full'
            items={items}
            onNavigate={onNavigate}
            title=''
          />
        ) : null
    }
  }

  return null
}
