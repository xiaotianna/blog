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
import { FilePenLine, FolderInput, LoaderCircle, Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { toast } from 'sonner'

import {
  moveArticleAction,
  moveCategoryAction,
  updateArticleAction,
  updateCategoryAction
} from './actions'
import {
  BlogTextField,
  BlogTextareaField,
  toSlug
} from './blog-create-forms'
import { BlogDirectoryPathSelect } from './blog-directory-path-select'
import {
  ROOT_DIRECTORY_PATH,
  type BlogDirectoryPathOption
} from './blog-directory-paths'
import type { BlogArticleDetail, BlogCategory } from './blog-data'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type BlogCategoryDialogProps = {
  category: BlogCategory
  directoryOptions: BlogDirectoryPathOption[]
}

type BlogArticleDialogProps = {
  article: BlogArticleDetail
  directoryOptions: BlogDirectoryPathOption[]
}

export function BlogCategoryEditDialog({
  category,
  directoryOptions
}: BlogCategoryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [description, setDescription] = useState(category.description)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const parentPath = getParentPathById(
    directoryOptions,
    category.parentId,
    category.path
  )
  const currentSlug = toSlug(slug)
  const previewPath = getPreviewPath(parentPath, currentSlug)
  const canSubmit =
    Boolean(name.trim()) && SLUG_PATTERN.test(currentSlug) && !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error('请输入目录名称')
      return
    }

    if (!SLUG_PATTERN.test(currentSlug)) {
      toast.error('目录 slug 只能包含小写字母、数字和短横线')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await updateCategoryAction({
        id: category.id,
        name,
        slug: currentSlug,
        description
      })

      if (!result.ok) {
        toast.error(result.message ?? '更新目录失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '更新目录成功')
      setOpen(false)

      if (result.path && result.path !== category.path) {
        router.push(`/blog/${result.path}`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error('更新目录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BlogNodeDialog
      description='修改目录名称和描述。'
      icon={<Pencil className='size-4' />}
      onOpenChange={setOpen}
      open={open}
      title='编辑目录'
      triggerLabel='修改'
      variant='default'
    >
      <form
        className='space-y-4'
        onSubmit={handleSubmit}
      >
        <BlogTextField
          id='blog-category-edit-name'
          label='目录名称'
          name='name'
          onChange={setName}
          placeholder='例如：前端'
          value={name}
        />

        <BlogTextField
          description={previewPath ? `完整路径：${previewPath}` : undefined}
          id='blog-category-edit-slug'
          label='目录 slug'
          name='slug'
          onChange={(value) => setSlug(toSlug(value))}
          placeholder='frontend'
          value={currentSlug}
        />

        <BlogTextareaField
          id='blog-category-edit-description'
          label='目录描述'
          name='description'
          onChange={setDescription}
          placeholder='这个目录主要收录前端相关内容'
          value={description}
        />

        <BlogDialogFooter
          buttonLabel='修改'
          icon={<Pencil className='size-4' />}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!canSubmit}
          submittingLabel='正在修改'
        />
      </form>
    </BlogNodeDialog>
  )
}

export function BlogCategoryMoveDialog({
  category,
  directoryOptions
}: BlogCategoryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [parentPath, setParentPath] = useState(() =>
    getParentPathById(directoryOptions, category.parentId, category.path)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const filteredOptions = useMemo(
    () =>
      directoryOptions.filter(
        (option) =>
          option.id !== category.id && !isChildPath(option.path, category.path)
      ),
    [category.id, category.path, directoryOptions]
  )
  const parentOption =
    parentPath === ROOT_DIRECTORY_PATH
      ? undefined
      : filteredOptions.find((option) => option.path === parentPath)
  const canSubmit = !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (parentPath !== ROOT_DIRECTORY_PATH && !parentOption) {
      toast.error('请选择有效的父级目录路径')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await moveCategoryAction({
        id: category.id,
        parentId: parentOption?.id ?? null
      })

      if (!result.ok) {
        toast.error(result.message ?? '移动目录失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '移动目录成功')
      setOpen(false)

      if (result.path && result.path !== category.path) {
        router.push(`/blog/${result.path}`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error('移动目录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BlogNodeDialog
      description='选择新的父级目录路径。'
      icon={<FolderInput className='size-4' />}
      onOpenChange={setOpen}
      open={open}
      title='移动目录'
      triggerLabel='移动'
      variant='outline'
    >
      <form
        className='space-y-4'
        onSubmit={handleSubmit}
      >
        <BlogDirectoryPathSelect
          allowRoot
          contentHeightClassName='h-56'
          description='目录会移动到该父级路径下。'
          id='blog-category-move-parent-path'
          label='父级目录路径'
          name='parentPath'
          onChange={setParentPath}
          options={filteredOptions}
          value={parentPath}
        />

        <BlogDialogFooter
          buttonLabel='移动'
          icon={<FolderInput className='size-4' />}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!canSubmit}
          submittingLabel='正在移动'
        />
      </form>
    </BlogNodeDialog>
  )
}

export function BlogArticleEditDialog({
  article,
  directoryOptions
}: BlogArticleDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [slug, setSlug] = useState(article.slug)
  const [description, setDescription] = useState(article.description)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const categoryPath =
    directoryOptions.find((option) => option.id === article.categoryId)?.path ??
    getParentPath(article.path)
  const currentSlug = toSlug(slug)
  const previewPath = getPreviewPath(categoryPath, currentSlug)
  const canSubmit =
    Boolean(title.trim()) && SLUG_PATTERN.test(currentSlug) && !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error('请输入文章标题')
      return
    }

    if (!SLUG_PATTERN.test(currentSlug)) {
      toast.error('文章 slug 只能包含小写字母、数字和短横线')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await updateArticleAction({
        id: article.id,
        title,
        slug: currentSlug,
        description
      })

      if (!result.ok) {
        toast.error(result.message ?? '更新文章失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '更新文章成功')
      setOpen(false)

      if (result.path && result.path !== article.path) {
        router.push(`/blog/${result.path}`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error('更新文章失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BlogNodeDialog
      description='修改文章标题和摘要。'
      icon={<FilePenLine className='size-4' />}
      onOpenChange={setOpen}
      open={open}
      title='编辑文章信息'
      triggerLabel='修改'
      variant='default'
    >
      <form
        className='space-y-4'
        onSubmit={handleSubmit}
      >
        <BlogTextField
          id='blog-article-edit-title'
          label='文章标题'
          name='title'
          onChange={setTitle}
          placeholder='例如：Server Actions 实战'
          value={title}
        />

        <BlogTextField
          description={previewPath ? `完整路径：${previewPath}` : undefined}
          id='blog-article-edit-slug'
          label='文章 slug'
          name='slug'
          onChange={(value) => setSlug(toSlug(value))}
          placeholder='server-actions'
          value={currentSlug}
        />

        <BlogTextareaField
          id='blog-article-edit-description'
          label='文章摘要'
          name='description'
          onChange={setDescription}
          placeholder='一句话描述这篇文章'
          value={description}
        />

        <BlogDialogFooter
          buttonLabel='修改'
          icon={<FilePenLine className='size-4' />}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!canSubmit}
          submittingLabel='正在修改'
        />
      </form>
    </BlogNodeDialog>
  )
}

export function BlogArticleMoveDialog({
  article,
  directoryOptions
}: BlogArticleDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [categoryPath, setCategoryPath] = useState(
    directoryOptions.find((option) => option.id === article.categoryId)?.path ??
      ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const categoryOption = directoryOptions.find(
    (option) => option.path === categoryPath
  )
  const canSubmit = Boolean(categoryPath) && !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!categoryOption) {
      toast.error('请选择有效的文章所属目录路径')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await moveArticleAction({
        id: article.id,
        categoryId: categoryOption.id
      })

      if (!result.ok) {
        toast.error(result.message ?? '移动文章失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '移动文章成功')
      setOpen(false)

      if (result.path && result.path !== article.path) {
        router.push(`/blog/${result.path}`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error('移动文章失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BlogNodeDialog
      description='选择新的文章所属目录。'
      icon={<FolderInput className='size-4' />}
      onOpenChange={setOpen}
      open={open}
      title='移动文章'
      triggerLabel='移动'
      variant='outline'
    >
      <form
        className='space-y-4'
        onSubmit={handleSubmit}
      >
        <BlogDirectoryPathSelect
          contentHeightClassName='h-56'
          description='文章会归属到该目录。'
          id='blog-article-move-category-path'
          label='所属目录路径'
          name='categoryPath'
          onChange={setCategoryPath}
          options={directoryOptions}
          required
          value={categoryPath}
        />

        <BlogDialogFooter
          buttonLabel='移动'
          icon={<FolderInput className='size-4' />}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!canSubmit}
          submittingLabel='正在移动'
        />
      </form>
    </BlogNodeDialog>
  )
}

function BlogDialogFooter({
  buttonLabel,
  icon,
  isSubmitting,
  isSubmitDisabled,
  submittingLabel
}: {
  buttonLabel: string
  icon: ReactNode
  isSubmitting: boolean
  isSubmitDisabled: boolean
  submittingLabel: string
}) {
  return (
    <div className='flex justify-end gap-2'>
      <DialogClose asChild>
        <Button
          disabled={isSubmitting}
          type='button'
          variant='ghost'
        >
          取消
        </Button>
      </DialogClose>
      <Button
        disabled={isSubmitDisabled}
        type='submit'
      >
        {isSubmitting ? (
          <LoaderCircle className='size-4 animate-spin' />
        ) : (
          icon
        )}
        {isSubmitting ? submittingLabel : buttonLabel}
      </Button>
    </div>
  )
}

function BlogNodeDialog({
  children,
  description,
  icon,
  onOpenChange,
  open,
  title,
  triggerLabel,
  variant
}: {
  children: ReactNode
  description: string
  icon: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
  triggerLabel: string
  variant: 'default' | 'outline'
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button
          type='button'
          variant={variant}
        >
          {icon}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className='flex max-h-[min(42rem,calc(100dvh-2rem))] w-[min(30rem,calc(100vw-2rem))] max-w-[min(30rem,calc(100vw-2rem))] flex-col gap-0 p-5 sm:max-w-[min(30rem,calc(100vw-2rem))]'
        showCloseButton={false}
      >
        <DialogHeader className='mb-5 flex-row items-start justify-between gap-3 space-y-0'>
          <div>
            <DialogTitle className='text-base font-semibold leading-normal'>
              {title}
            </DialogTitle>
            <DialogDescription className='mt-1 text-sm text-muted-foreground'>
              {description}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              aria-label={`关闭${title}`}
              size='icon-sm'
              type='button'
              variant='ghost'
            >
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  )
}

function getParentPathById(
  directoryOptions: BlogDirectoryPathOption[],
  parentId: string | null | undefined,
  currentPath: string
) {
  if (!parentId) {
    return ROOT_DIRECTORY_PATH
  }

  return (
    directoryOptions.find((option) => option.id === parentId)?.path ??
    getParentPath(currentPath) ??
    ROOT_DIRECTORY_PATH
  )
}

function getParentPath(path: string) {
  const segments = path.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return ROOT_DIRECTORY_PATH
  }

  return segments.slice(0, -1).join('/')
}

function isChildPath(path: string, parentPath: string) {
  return path.startsWith(`${parentPath}/`)
}

function getPreviewPath(parentPath: string, slug: string) {
  if (!slug) {
    return ''
  }

  return parentPath && parentPath !== ROOT_DIRECTORY_PATH
    ? `${parentPath}/${slug}`
    : slug
}
