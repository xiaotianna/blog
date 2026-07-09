'use client'

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Code2,
  FileText,
  ImagePlus,
  LoaderCircle,
  Redo2,
  Save,
  TriangleAlert,
  Undo2
} from 'lucide-react'

export type EditorMode = 'rich' | 'mdx'
export type SaveState = 'dirty' | 'error' | 'idle' | 'saving' | 'saved'

type EditorHeaderProps = {
  canRedo: boolean
  canUndo: boolean
  mode: EditorMode
  onRedo: () => void
  onImage: () => void
  onSave: () => void
  onUndo: () => void
  onModeChange: (mode: EditorMode) => void
  saveState: SaveState
}

const saveStateMeta: Record<
  SaveState,
  { icon: typeof CheckCircle2; label: string; tone: string }
> = {
  idle: {
    icon: CheckCircle2,
    label: '已同步',
    tone: 'text-muted-foreground'
  },
  dirty: {
    icon: FileText,
    label: '未保存',
    tone: 'text-amber-600 dark:text-amber-300'
  },
  saving: {
    icon: LoaderCircle,
    label: '保存中',
    tone: 'text-muted-foreground'
  },
  saved: {
    icon: CheckCircle2,
    label: '已保存',
    tone: 'text-emerald-600 dark:text-emerald-300'
  },
  error: {
    icon: TriangleAlert,
    label: '保存失败',
    tone: 'text-destructive'
  }
}

export function EditorHeader({
  canRedo,
  canUndo,
  mode,
  onRedo,
  onImage,
  onSave,
  onUndo,
  onModeChange,
  saveState
}: EditorHeaderProps) {
  const status = saveStateMeta[saveState]
  const StatusIcon = status.icon

  return (
    <header className='sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl'>
      <div className='mx-auto flex h-14 w-full max-w-7xl items-center justify-end gap-3 px-4 max-md:h-auto max-md:items-stretch max-md:py-3'>
        <div className='relative z-70 flex flex-wrap items-center justify-end gap-2'>
          <span
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs',
              status.tone
            )}
          >
            <StatusIcon
              className={cn('size-3.5', saveState === 'saving' && 'animate-spin')}
            />
            {status.label}
          </span>

          <div className='flex items-center rounded-lg border border-border bg-background p-0.5'>
            <Button
              aria-label='切换到富文本编辑'
              className='h-7 px-2'
              onClick={() => onModeChange('rich')}
              type='button'
              variant={mode === 'rich' ? 'secondary' : 'ghost'}
            >
              <FileText className='size-4' />
              富文本
            </Button>
            <Button
              aria-label='切换到 MDX 源码编辑'
              className='h-7 px-2'
              onClick={() => onModeChange('mdx')}
              type='button'
              variant={mode === 'mdx' ? 'secondary' : 'ghost'}
            >
              <Code2 className='size-4' />
              MDX
            </Button>
          </div>

          <Button
            aria-label='撤销'
            disabled={!canUndo}
            onClick={onUndo}
            size='icon'
            type='button'
            variant='outline'
          >
            <Undo2 className='size-4' />
          </Button>
          <Button
            aria-label='重做'
            disabled={!canRedo}
            onClick={onRedo}
            size='icon'
            type='button'
            variant='outline'
          >
            <Redo2 className='size-4' />
          </Button>
          <Button
            aria-label='插入图片'
            onClick={onImage}
            size='icon'
            type='button'
            variant='outline'
          >
            <ImagePlus className='size-4' />
          </Button>
          <AnimatedThemeToggler duration={600} />
          <Button
            disabled={saveState === 'saving'}
            onClick={onSave}
            type='button'
          >
            {saveState === 'saving' ? (
              <LoaderCircle className='size-4 animate-spin' />
            ) : (
              <Save className='size-4' />
            )}
            保存
          </Button>
        </div>
      </div>
    </header>
  )
}
