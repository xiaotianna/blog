'use client'

import { uploadArticleImageAction } from '@/features/blog/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ImagePlus, Link2, LoaderCircle, UploadCloud } from 'lucide-react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode
} from 'react'
import { toast } from 'sonner'

type EditorImageDialogProps = {
  articleId: string
  onInsert: (image: { alt: string; src: string }) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

const IMAGE_MAX_SIZE = 10 * 1024 * 1024
const IMAGE_FILE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
])

export function EditorImageDialog({
  articleId,
  onInsert,
  onOpenChange,
  open
}: EditorImageDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState('link')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkAlt, setLinkAlt] = useState('')
  const [uploadAlt, setUploadAlt] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (open) return

    setActiveTab('link')
    setLinkUrl('')
    setLinkAlt('')
    setUploadAlt('')
    setSelectedFile(null)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [open])

  const insertAndClose = (image: { alt: string; src: string }) => {
    onInsert(image)
    onOpenChange(false)
  }

  const handleLinkSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const src = normalizeImageUrl(linkUrl)
    if (!src) return

    insertAndClose({
      alt: linkAlt.trim(),
      src
    })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null

    if (!file) {
      setSelectedFile(null)
      return
    }

    const message = validateImageFile(file)
    if (message) {
      toast.error(message)
      event.currentTarget.value = ''
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setUploadAlt((current) => current || getFileAlt(file.name))
  }

  const handleUploadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile || isUploading) return

    const message = validateImageFile(selectedFile)
    if (message) {
      toast.error(message)
      return
    }

    setIsUploading(true)
    void (async () => {
      const formData = new FormData()
      formData.set('id', articleId)
      formData.set('image', selectedFile)
      let result: Awaited<ReturnType<typeof uploadArticleImageAction>>

      try {
        result = await uploadArticleImageAction(formData)
      } catch {
        toast.error('上传文章图片失败，请稍后重试')
        setIsUploading(false)
        return
      }

      if (!result.ok || !result.url) {
        toast.error(result.message ?? '上传文章图片失败，请稍后重试')
        setIsUploading(false)
        return
      }

      try {
        insertAndClose({
          alt: uploadAlt.trim(),
          src: result.url
        })
        toast.success(result.message ?? '上传文章图片成功')
      } catch {
        toast.error('图片已上传，但插入编辑器失败')
      } finally {
        setIsUploading(false)
      }
    })()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isUploading && !nextOpen) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className='flex w-[min(28rem,calc(100vw-2rem))] max-w-[min(28rem,calc(100vw-2rem))] flex-col gap-0 p-5 sm:max-w-[min(28rem,calc(100vw-2rem))]'
        showCloseButton={!isUploading}
      >
        <DialogHeader className='mb-5'>
          <DialogTitle className='flex items-center gap-2 text-base font-semibold leading-normal'>
            <ImagePlus className='size-4' />
            插入图片
          </DialogTitle>
          <DialogDescription className='mt-1 text-sm text-muted-foreground'>
            通过图片链接或上传本地图片插入到文章内容。
          </DialogDescription>
        </DialogHeader>

        <TabsPrimitive.Root
          className='min-h-0'
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsPrimitive.List
            aria-label='插入图片方式'
            className='mb-5 grid h-9 grid-cols-2 rounded-lg bg-muted p-1'
          >
            <EditorImageTab value='link'>
              <Link2 className='size-4' />
              链接
            </EditorImageTab>
            <EditorImageTab value='upload'>
              <UploadCloud className='size-4' />
              上传
            </EditorImageTab>
          </TabsPrimitive.List>

          <TabsPrimitive.Content
            className='outline-none'
            value='link'
          >
            <form
              className='grid gap-4'
              onSubmit={handleLinkSubmit}
            >
              <div className='grid gap-3'>
                <label className='grid gap-1.5 text-sm font-medium'>
                  图片链接
                  <Input
                    autoFocus
                    onChange={(event) => setLinkUrl(event.currentTarget.value)}
                    placeholder='https://example.com/image.png'
                    value={linkUrl}
                  />
                </label>
                <label className='grid gap-1.5 text-sm font-medium'>
                  替代文本
                  <Input
                    onChange={(event) => setLinkAlt(event.currentTarget.value)}
                    placeholder='用于无障碍和图片加载失败展示'
                    value={linkAlt}
                  />
                </label>
              </div>
              <EditorImageDialogFooter
                disabled={!normalizeImageUrl(linkUrl)}
                isLoading={false}
                onCancel={() => onOpenChange(false)}
              />
            </form>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            className='outline-none'
            value='upload'
          >
            <form
              className='grid gap-4'
              onSubmit={handleUploadSubmit}
            >
              <div className='grid gap-3'>
                <label className='grid gap-1.5 text-sm font-medium'>
                  本地图片
                  <input
                    accept='image/png,image/jpeg,image/webp,image/gif'
                    className='sr-only'
                    disabled={isUploading}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    type='file'
                  />
                  <button
                    className='flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center text-sm transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50'
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    type='button'
                  >
                    <UploadCloud className='size-5 text-muted-foreground' />
                    <span className='font-medium text-foreground'>
                      {selectedFile ? selectedFile.name : '选择图片文件'}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      PNG、JPEG、WebP 或 GIF，不超过 10MB
                    </span>
                  </button>
                </label>
                <label className='grid gap-1.5 text-sm font-medium'>
                  替代文本
                  <Input
                    disabled={isUploading}
                    onChange={(event) => setUploadAlt(event.currentTarget.value)}
                    placeholder='默认使用文件名'
                    value={uploadAlt}
                  />
                </label>
              </div>
              <EditorImageDialogFooter
                disabled={!selectedFile}
                isLoading={isUploading}
                onCancel={() => onOpenChange(false)}
              />
            </form>
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
      </DialogContent>
    </Dialog>
  )
}

function EditorImageDialogFooter({
  disabled,
  isLoading,
  onCancel
}: {
  disabled: boolean
  isLoading: boolean
  onCancel: () => void
}) {
  return (
    <DialogFooter className='mx-0 mb-0 border-t-0 bg-transparent p-0 pt-1'>
      <Button
        disabled={isLoading}
        onClick={onCancel}
        type='button'
        variant='outline'
      >
        取消
      </Button>
      <Button
        disabled={disabled || isLoading}
        type='submit'
      >
        {isLoading ? <LoaderCircle className='size-4 animate-spin' /> : null}
        插入
      </Button>
    </DialogFooter>
  )
}

function EditorImageTab({
  children,
  value
}: {
  children: ReactNode
  value: string
}) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground outline-none transition-colors',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:ring-2 focus-visible:ring-ring'
      )}
      value={value}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

function normalizeImageUrl(url: string) {
  const value = url.trim()

  if (!value) return ''
  if (/^(?:https?:\/\/|\/)/i.test(value)) return value

  return `https://${value}`
}

function validateImageFile(file: File) {
  if (file.size > IMAGE_MAX_SIZE) {
    return '图片不能超过 10MB'
  }

  if (!IMAGE_FILE_TYPES.has(file.type)) {
    return '图片仅支持 PNG、JPEG、WebP 或 GIF'
  }

  return ''
}

function getFileAlt(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
}
