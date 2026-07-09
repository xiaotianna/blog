'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { Eye, LoaderCircle, RefreshCw, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { toast } from 'sonner'

import {
  deleteArticleCoverAction,
  getArticleCoverJobStatusAction,
  uploadArticleCoverAction,
  updateArticleCoverAction
} from './actions'

const MAX_COVER_FILE_SIZE = 5 * 1024 * 1024
const COVER_FILE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const COVER_JOB_POLL_INTERVAL = 1500

type BlogArticleCoverProps = {
  articleId: string
  canManageArticle: boolean
  coverUrl: string
  description: string
  path: string
  title: string
}

export function BlogArticleCover({
  articleId,
  canManageArticle,
  coverUrl,
  description,
  path,
  title
}: BlogArticleCoverProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [coverJobId, setCoverJobId] = useState('')
  const [isCoverJobRunning, setIsCoverJobRunning] = useState(false)
  const isBusy = isUpdating || isUploading || isDeleting || isCoverJobRunning
  const shouldSkipImageOptimization = isExternalImageUrl(coverUrl)

  useEffect(() => {
    if (!coverJobId || !isCoverJobRunning) {
      return
    }

    const intervalId = window.setInterval(async () => {
      const result = await getArticleCoverJobStatusAction(coverJobId)

      if (!result.ok || !result.job) {
        window.clearInterval(intervalId)
        setCoverJobId('')
        setIsCoverJobRunning(false)
        toast.error(result.message ?? '封面任务状态获取失败')
        return
      }

      if (result.job.status === 'queued' || result.job.status === 'running') {
        return
      }

      window.clearInterval(intervalId)
      setCoverJobId('')
      setIsCoverJobRunning(false)

      if (result.job.status === 'succeeded') {
        toast.success(result.job.message ?? '文章封面已更新')
        router.refresh()
        return
      }

      toast.error(result.job.message ?? '更新文章封面失败，请稍后重试')
    }, COVER_JOB_POLL_INTERVAL)

    return () => window.clearInterval(intervalId)
  }, [coverJobId, isCoverJobRunning, router])

  const handleUpdate = async () => {
    if (isCoverJobRunning) {
      toast.info('封面正在生成中，请稍后查看结果')
      return
    }

    try {
      setIsUpdating(true)
      const result = await updateArticleCoverAction({
        id: articleId,
        path
      })

      if (!result.ok) {
        toast.error(result.message ?? '更新文章封面失败，请稍后重试')
        return
      }

      if (result.job) {
        setCoverJobId(result.job.id)
        setIsCoverJobRunning(
          result.job.status === 'queued' || result.job.status === 'running'
        )
      }

      toast.info(result.message ?? '封面更新任务已加入队列')
    } catch {
      toast.error('更新文章封面失败，请稍后重试')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!COVER_FILE_TYPES.has(file.type)) {
      toast.error('封面图仅支持 PNG、JPEG 或 WebP')
      return
    }

    if (file.size > MAX_COVER_FILE_SIZE) {
      toast.error('封面图不能超过5MB')
      return
    }

    const formData = new FormData()
    formData.set('id', articleId)
    formData.set('path', path)
    formData.set('cover', file)

    try {
      setIsUploading(true)
      const result = await uploadArticleCoverAction(formData)

      if (!result.ok) {
        toast.error(result.message ?? '上传文章封面失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '上传文章封面成功')
      router.refresh()
    } catch {
      toast.error('上传文章封面失败，请稍后重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!coverUrl) {
      return
    }

    try {
      setIsDeleting(true)
      const result = await deleteArticleCoverAction({
        id: articleId,
        path
      })

      if (!result.ok) {
        toast.error(result.message ?? '删除文章封面失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '删除文章封面成功')
      setDeleteDialogOpen(false)
      router.refresh()
    } catch {
      toast.error('删除文章封面失败，请稍后重试')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className='group relative overflow-hidden rounded-lg border border-border bg-muted/30 max-sm:rounded-md'>
        <div className='relative aspect-16/9 w-full max-sm:max-h-44'>
          <div className='size-full transition duration-200 group-hover:scale-[1.015] group-hover:blur-[2px] group-focus-within:scale-[1.015] group-focus-within:blur-[2px]'>
            {coverUrl ? (
              <Image
                alt={`${title} 封面`}
                className='size-full object-cover'
                fill
                sizes='(min-width: 1024px) 54vw, calc(100vw - 3rem)'
                src={coverUrl}
                unoptimized={shouldSkipImageOptimization}
              />
            ) : (
              <ArticleCoverPlaceholder
                description={description}
                title={title}
              />
            )}
          </div>

          {canManageArticle ? (
            <div className='absolute inset-0 flex items-center justify-center bg-background/35 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100'>
              <div className='flex items-center gap-2'>
                <input
                  ref={fileInputRef}
                  accept='image/png,image/jpeg,image/webp'
                  className='sr-only'
                  onChange={handleUploadChange}
                  type='file'
                />
                <CoverIconButton
                  disabled={!coverUrl || isBusy}
                  label='预览封面'
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className='size-4' />
                </CoverIconButton>
                <CoverIconButton
                  disabled={isBusy}
                  label='更新封面'
                  onClick={handleUpdate}
                >
                  {isUpdating || isCoverJobRunning ? (
                    <LoaderCircle className='size-4 animate-spin' />
                  ) : (
                    <RefreshCw className='size-4' />
                  )}
                </CoverIconButton>
                <CoverIconButton
                  disabled={isBusy}
                  label='上传封面'
                  onClick={handleUploadClick}
                >
                  {isUploading ? (
                    <LoaderCircle className='size-4 animate-spin' />
                  ) : (
                    <Upload className='size-4' />
                  )}
                </CoverIconButton>
                <CoverIconButton
                  disabled={!coverUrl || isBusy}
                  label='删除封面'
                  onClick={() => setDeleteDialogOpen(true)}
                  destructive
                >
                  {isDeleting ? (
                    <LoaderCircle className='size-4 animate-spin' />
                  ) : (
                    <Trash2 className='size-4' />
                  )}
                </CoverIconButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        <DialogContent className='p-3 sm:max-w-4xl'>
          <DialogTitle className='sr-only'>预览文章封面</DialogTitle>
          <DialogDescription className='sr-only'>
            查看当前文章封面大图
          </DialogDescription>
          {coverUrl ? (
            <div className='relative aspect-16/9 w-full overflow-hidden rounded-lg'>
              <Image
                alt={`${title} 封面预览`}
                className='object-cover'
                fill
                sizes='(min-width: 768px) 56rem, calc(100vw - 2rem)'
                src={coverUrl}
                unoptimized={shouldSkipImageOptimization}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteDialogOpen(open)
          }
        }}
      >
        <DialogContent
          className='w-[min(20rem,calc(100vw-2rem))] gap-0 p-5 sm:max-w-[min(20rem,calc(100vw-2rem))]'
          showCloseButton={false}
        >
          <DialogTitle className='text-base font-semibold leading-normal'>
            删除文章封面？
          </DialogTitle>
          <DialogDescription className='mt-2 text-sm leading-6 text-muted-foreground'>
            删除后可以重新上传或生成新的封面。
          </DialogDescription>

          <div className='mt-5 flex justify-end gap-2'>
            <Button
              disabled={isDeleting}
              onClick={() => setDeleteDialogOpen(false)}
              type='button'
              variant='ghost'
            >
              取消
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              type='button'
              variant='destructive'
            >
              {isDeleting ? '删除中...' : '删除封面'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function isExternalImageUrl(src: string) {
  return /^https?:\/\//.test(src)
}

function ArticleCoverPlaceholder({
  description,
  title
}: {
  description: string
  title: string
}) {
  return (
    <div className='flex size-full items-center justify-center bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-size-[14px_14px] p-6 max-sm:p-5'>
      <div className='max-w-xs text-center'>
        <p className='text-[0.7rem] font-medium uppercase text-muted-foreground'>
          Preview
        </p>
        <p className='mt-2 text-lg font-semibold tracking-tight text-foreground max-sm:text-base'>
          {title}
        </p>
        {description ? (
          <p className='mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground'>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function CoverIconButton({
  children,
  destructive = false,
  disabled,
  label,
  onClick
}: {
  children: ReactNode
  destructive?: boolean
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      aria-label={label}
      className={`size-9 rounded-full border-border/70 bg-background/90 shadow-sm backdrop-blur transition duration-200 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-md focus-visible:border-border focus-visible:bg-muted focus-visible:text-foreground focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-ring/25 disabled:border-border disabled:bg-background/70 disabled:text-muted-foreground disabled:shadow-sm ${destructive ? 'text-red-600 hover:text-red-600 focus-visible:text-red-600' : 'text-foreground'}`}
      disabled={disabled}
      onClick={onClick}
      size='icon'
      title={label}
      type='button'
      variant='outline'
    >
      {children}
      <span className='sr-only'>{label}</span>
    </Button>
  )
}
