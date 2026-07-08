'use client'

import { Button } from '@/components/ui/button'
import { logoutAction } from '@/features/auth/actions'
import { LoaderCircle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { FormEvent, useState, useTransition } from 'react'

export function HeaderLogoutDialog() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isBusy = isSubmitting || isRefreshing || isPending

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isBusy) {
      return
    }

    setIsSubmitting(true)

    try {
      await logoutAction()
      setIsRefreshing(true)
      startTransition(() => {
        router.refresh()
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='退出登录'
          title='退出登录'
        >
          <LogOut className='size-4' />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:bg-black/45' />
        <DialogPrimitive.Content className='fixed left-1/2 top-1/2 z-50 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-5 shadow-xl shadow-foreground/10 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'>
          <DialogPrimitive.Title className='text-base font-semibold'>
            确认退出登录？
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className='mt-2 text-sm text-muted-foreground'>
            退出后需要重新登录才能继续使用管理操作。
          </DialogPrimitive.Description>

          <div className='mt-5 flex justify-end gap-2'>
            <DialogPrimitive.Close asChild>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
              >
                取消
              </Button>
            </DialogPrimitive.Close>
            <form onSubmit={handleSubmit}>
              <Button
                disabled={isBusy}
                type='submit'
                variant='destructive'
              >
                {isBusy ? (
                  <LoaderCircle className='size-4 animate-spin' />
                ) : null}
                退出
              </Button>
            </form>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
