'use client'

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { Button } from '@/components/ui/button'
import { Dialog as DialogPrimitive } from 'radix-ui'
import {
  Code2,
  Ellipsis,
  FileText,
  ImagePlus,
  Redo2,
  Undo2,
  X
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import type { EditorMode } from './editor-header'
import { useVisualViewportBottomInset } from './use-visual-viewport-bottom-inset'

export type MobileEditorDockProps = {
  canRedo: boolean
  canUndo: boolean
  mode: EditorMode
  onImage: () => void
  onModeChange: (mode: EditorMode) => void
  onRedo: () => void
  onUndo: () => void
}

export function MobileEditorDock({
  canRedo,
  canUndo,
  mode,
  onImage,
  onModeChange,
  onRedo,
  onUndo
}: MobileEditorDockProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const openImageAfterCloseRef = useRef(false)
  const viewportBottomInset = useVisualViewportBottomInset()
  const dockStyle = {
    bottom: `calc(${viewportBottomInset}px + env(safe-area-inset-bottom) + 0.5rem)`
  } satisfies CSSProperties

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setMoreOpen(false)
    }

    closeOnDesktop()
    desktopQuery.addEventListener('change', closeOnDesktop)

    return () => desktopQuery.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <>
      <div
        className='fixed right-3 left-3 z-40 flex items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-lg shadow-foreground/10 backdrop-blur-xl md:hidden'
        style={dockStyle}
      >
        <div
          aria-label='编辑模式'
          className='grid min-w-0 flex-1 grid-cols-2 rounded-lg border border-border bg-muted p-0.5'
          role='group'
        >
          <Button
            aria-pressed={mode === 'rich'}
            className='h-9 min-w-0 px-1.5 text-sm'
            onClick={() => onModeChange('rich')}
            type='button'
            variant={mode === 'rich' ? 'default' : 'ghost'}
          >
            <FileText className='size-3.5' />
            <span className='truncate max-[360px]:sr-only'>富文本</span>
          </Button>
          <Button
            aria-pressed={mode === 'mdx'}
            className='h-9 min-w-0 px-1.5 text-sm'
            onClick={() => onModeChange('mdx')}
            type='button'
            variant={mode === 'mdx' ? 'default' : 'ghost'}
          >
            <Code2 className='size-3.5' />
            <span className='truncate max-[360px]:sr-only'>MDX</span>
          </Button>
        </div>

        <Button
          aria-label='撤销'
          className='size-9'
          disabled={!canUndo}
          onClick={onUndo}
          size='icon'
          type='button'
          variant='outline'
        >
          <Undo2 className='size-3.5' />
        </Button>
        <Button
          aria-label='重做'
          className='size-9'
          disabled={!canRedo}
          onClick={onRedo}
          size='icon'
          type='button'
          variant='outline'
        >
          <Redo2 className='size-3.5' />
        </Button>
        <Button
          aria-label='更多编辑工具'
          aria-expanded={moreOpen}
          className='size-9'
          onClick={() => setMoreOpen(true)}
          ref={moreButtonRef}
          size='icon'
          type='button'
          variant='outline'
        >
          <Ellipsis className='size-3.5' />
        </Button>
      </div>

      <DialogPrimitive.Root
        open={moreOpen}
        onOpenChange={setMoreOpen}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:bg-black/45 md:hidden' />
          <DialogPrimitive.Content
            className='fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl border-t border-border bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:hidden'
            onCloseAutoFocus={(event) => {
              event.preventDefault()

              if (openImageAfterCloseRef.current) {
                openImageAfterCloseRef.current = false
                window.requestAnimationFrame(() => onImage())
                return
              }

              moreButtonRef.current?.focus()
            }}
          >
            <div className='mb-3 flex items-center justify-between gap-3'>
              <DialogPrimitive.Title className='text-sm font-medium'>
                更多编辑工具
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button
                  aria-label='关闭更多编辑工具'
                  className='size-9'
                  size='icon'
                  type='button'
                  variant='ghost'
                >
                  <X className='size-3.5' />
                </Button>
              </DialogPrimitive.Close>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <Button
                className='h-11 justify-start gap-2 px-3 text-sm'
                onClick={() => {
                  openImageAfterCloseRef.current = true
                  setMoreOpen(false)
                }}
                type='button'
                variant='outline'
              >
                <ImagePlus className='size-4' />
                插入图片
              </Button>
              <div className='relative h-11'>
                <AnimatedThemeToggler
                  className='size-full justify-start px-3'
                  duration={600}
                />
                <span className='pointer-events-none absolute inset-y-0 left-10 flex items-center text-sm font-medium'>
                  切换主题
                </span>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
