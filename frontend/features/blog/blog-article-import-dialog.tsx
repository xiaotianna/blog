'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  applyExternalArticleImportAction,
  previewExternalArticleImportAction
} from '@/features/blog/actions'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileDown,
  LoaderCircle,
  Search
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { FormEvent, ReactNode, useState } from 'react'
import { toast } from 'sonner'

type BlogArticleImportDialogProps = {
  articleId: string
  onOpenChange?: (open: boolean) => void
  open?: boolean
  trigger?: ReactNode
}

type ArticleImportSource = 'feishu' | 'juejin' | 'csdn'
type ImportRawFormat = 'html' | 'markdown'

type ImportPreview = {
  imageCount: number
  imageUrls: string[]
  markdown: string
  title?: string
  warnings: string[]
}

const SOURCE_OPTIONS: { label: string; value: ArticleImportSource }[] = [
  { label: '飞书', value: 'feishu' },
  { label: 'CSDN', value: 'csdn' },
  { label: '掘金', value: 'juejin' }
]

const FORMAT_OPTIONS: { label: string; value: ImportRawFormat }[] = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'HTML', value: 'html' }
]

const SOURCE_LABELS = Object.fromEntries(
  SOURCE_OPTIONS.map((option) => [option.value, option.label])
) as Record<ArticleImportSource, string>

const FORMAT_LABELS = Object.fromEntries(
  FORMAT_OPTIONS.map((option) => [option.value, option.label])
) as Record<ImportRawFormat, string>

export function BlogArticleImportDialog({
  articleId,
  onOpenChange,
  open: controlledOpen,
  trigger
}: BlogArticleImportDialogProps) {
  const router = useRouter()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [source, setSource] = useState<ArticleImportSource>('feishu')
  const [url, setUrl] = useState('')
  const [rawFormat, setRawFormat] = useState<ImportRawFormat>('markdown')
  const [rawContent, setRawContent] = useState('')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen

  const resetImportState = () => {
    setSource('feishu')
    setUrl('')
    setRawFormat('markdown')
    setRawContent('')
    setPreview(null)
    setMarkdown('')
    setIsPreviewing(false)
    setIsApplying(false)
  }

  const setDialogOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetImportState()
    }

    onOpenChange?.(nextOpen)
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen)
    }
  }

  const canPreview =
    !isPreviewing &&
    !isApplying &&
    Boolean(url.trim() || rawContent.trim())
  const canApply = !isApplying && Boolean(preview && markdown.trim())

  const handlePreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!url.trim() && !rawContent.trim()) {
      toast.error('请输入文章链接，或粘贴 HTML/Markdown 内容')
      return
    }

    setIsPreviewing(true)
    void (async () => {
      try {
        const result = await previewExternalArticleImportAction({
          articleId,
          source,
          url,
          rawContent,
          rawFormat
        })

        if (!result.ok || !result.markdown) {
          toast.error(result.message ?? '外部文章解析失败，请稍后重试')
          return
        }

        const nextPreview = {
          imageCount: result.imageCount ?? 0,
          imageUrls: result.imageUrls ?? [],
          markdown: result.markdown,
          title: result.title,
          warnings: result.warnings ?? []
        }

        setPreview(nextPreview)
        setMarkdown(nextPreview.markdown)
        toast.success(result.message ?? '文章预览生成成功')
      } catch {
        toast.error('外部文章解析失败，请稍后重试')
      } finally {
        setIsPreviewing(false)
      }
    })()
  }

  const handleApply = () => {
    if (!preview || !markdown.trim()) return

    setIsApplying(true)
    void (async () => {
      try {
        const result = await applyExternalArticleImportAction({
          articleId,
          source,
          markdown,
          imageUrls: preview.imageUrls
        })

        if (!result.ok) {
          toast.error(result.message ?? '导入文章失败，请稍后重试')
          return
        }

        toast.success(result.message ?? '外部文章导入成功')
        if (result.warnings?.length) {
          toast.warning(
            `${result.warnings.length} 张图片下载失败，已保留原链接`
          )
        }
        setDialogOpen(false)
        router.refresh()
      } catch {
        toast.error('导入文章失败，请稍后重试')
      } finally {
        setIsApplying(false)
      }
    })()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if ((isPreviewing || isApplying) && !nextOpen) return
        setDialogOpen(nextOpen)
      }}
    >
      {trigger === null ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              className='max-sm:size-9 max-sm:px-0'
              type='button'
              variant='outline'
            >
              <FileDown className='size-4' />
              <span className='max-sm:sr-only'>导入文章</span>
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        className='flex max-h-[min(48rem,calc(100dvh-2rem))] w-[min(48rem,calc(100vw-2rem))] max-w-[min(48rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(48rem,calc(100vw-2rem))]'
        showCloseButton={!isPreviewing && !isApplying}
      >
        <form
          className='flex min-h-0 flex-1 flex-col'
          onSubmit={handlePreview}
        >
          <DialogHeader className='shrink-0 px-5 pb-4 pt-5'>
            <DialogTitle className='flex items-center gap-2'>
              <FileDown className='size-4' />
              导入外部文章
            </DialogTitle>
            <DialogDescription>
              支持公开链接解析，遇到权限或反爬限制时可粘贴正文内容。
            </DialogDescription>
          </DialogHeader>

          <div className='grid min-h-0 flex-1 gap-5 overflow-y-auto px-5 py-4'>
            <div className='grid gap-4 sm:grid-cols-[10rem_1fr]'>
              <label className='grid gap-1.5 text-sm font-medium'>
                来源
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className='h-9 justify-between px-3 font-normal'
                      disabled={isPreviewing || isApplying}
                      type='button'
                      variant='outline'
                    >
                      {SOURCE_LABELS[source]}
                      <ChevronDown className='size-4 text-muted-foreground' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='start'
                    className='w-(--radix-dropdown-menu-trigger-width)'
                  >
                    <DropdownMenuRadioGroup
                      onValueChange={(value) =>
                        setSource(value as ArticleImportSource)
                      }
                      value={source}
                    >
                      {SOURCE_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </label>

              <label className='grid gap-1.5 text-sm font-medium'>
                文章链接
                <Input
                  disabled={isPreviewing || isApplying}
                  onChange={(event) => setUrl(event.currentTarget.value)}
                  placeholder='粘贴公开文章链接'
                  value={url}
                />
              </label>
            </div>

            <div className='grid gap-2'>
              <div className='flex flex-wrap items-end justify-between gap-3'>
                <label
                  className='text-sm font-medium'
                  htmlFor='external-article-raw-content'
                >
                  粘贴内容
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className='h-8 min-w-28 justify-between px-2 text-xs font-normal'
                      disabled={isPreviewing || isApplying}
                      type='button'
                      variant='outline'
                    >
                      {FORMAT_LABELS[rawFormat]}
                      <ChevronDown className='size-3.5 text-muted-foreground' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    className='w-32'
                  >
                    <DropdownMenuRadioGroup
                      onValueChange={(value) =>
                        setRawFormat(value as ImportRawFormat)
                      }
                      value={rawFormat}
                    >
                      {FORMAT_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <textarea
                className='min-h-28 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/50'
                disabled={isPreviewing || isApplying}
                id='external-article-raw-content'
                onChange={(event) => setRawContent(event.currentTarget.value)}
                placeholder='可粘贴飞书、掘金、CSDN 的 HTML 或 Markdown 正文'
                value={rawContent}
              />
            </div>

            <AnimatePresence mode='wait'>
              {preview ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className='grid gap-3'
                  exit={{ opacity: 0, y: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key='preview'
                  transition={{ duration: 0.18 }}
                >
                  <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                    {preview.title ? (
                      <span className='max-w-[min(100%,28rem)] truncate rounded-md border px-2 py-1'>
                        {preview.title}
                      </span>
                    ) : null}
                    <span className='rounded-md border px-2 py-1'>
                      图片 {preview.imageCount} 张
                    </span>
                  </div>

                  {preview.warnings.length > 0 ? (
                    <div className='grid gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300'>
                      {preview.warnings.map((warning) => (
                        <span
                          className='flex items-start gap-1.5'
                          key={warning}
                        >
                          <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
                          {warning}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <label className='grid gap-1.5 text-sm font-medium'>
                    Markdown 预览
                    <textarea
                      className='max-h-80 min-h-44 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm leading-6 outline-none transition-colors focus:border-foreground/50'
                      disabled={isApplying}
                      onChange={(event) => setMarkdown(event.currentTarget.value)}
                      value={markdown}
                    />
                  </label>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className='rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground'
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: -8 }}
                  key='empty'
                  transition={{ duration: 0.18 }}
                >
                  需要先生成预览，确认 Markdown 内容后才能替换当前文章正文。
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='flex shrink-0 justify-end gap-2 px-5 pb-5 pt-4'>
            <DialogClose asChild>
              <Button
                disabled={isPreviewing || isApplying}
                type='button'
                variant='ghost'
              >
                取消
              </Button>
            </DialogClose>
            <Button
              disabled={!canPreview}
              type='submit'
              variant='outline'
            >
              {isPreviewing ? (
                <LoaderCircle className='size-4 animate-spin' />
              ) : (
                <Search className='size-4' />
              )}
              生成预览
            </Button>
            <Button
              disabled={!canApply}
              onClick={handleApply}
              type='button'
            >
              {!preview ? (
                <Check className='size-4' />
              ) : isApplying ? (
                <LoaderCircle className='size-4 animate-spin' />
              ) : (
                <Check className='size-4' />
              )}
              {preview ? '确认导入' : '请先生成预览'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
