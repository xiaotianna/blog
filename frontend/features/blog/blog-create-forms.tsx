'use client'

import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import {
  FilePlus2,
  FolderPlus,
  LoaderCircle,
  TextCursorInput
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { createArticleAction, createCategoryAction } from './actions'
import {
  ROOT_DIRECTORY_PATH,
  type BlogDirectoryPathOption
} from './blog-directory-paths'

type BlogCreateFormProps = {
  defaultDirectoryPath: string
  directoryOptions: BlogDirectoryPathOption[]
  onDone: () => void
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function BlogCreateCategoryForm({
  defaultDirectoryPath,
  directoryOptions,
  onDone
}: BlogCreateFormProps) {
  const router = useRouter()
  const parentPath = defaultDirectoryPath || ROOT_DIRECTORY_PATH
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlugTouched, setIsSlugTouched] = useState(false)
  const currentSlug = isSlugTouched ? slug : toSlug(name)
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

    const parentOption =
      parentPath === ROOT_DIRECTORY_PATH
        ? undefined
        : directoryOptions.find((option) => option.path === parentPath)

    if (parentPath !== ROOT_DIRECTORY_PATH && !parentOption) {
      toast.error('请选择有效的父级目录路径')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await createCategoryAction({
        name,
        slug: currentSlug,
        description,
        parentId: parentOption?.id
      })

      if (!result.ok) {
        toast.error(result.message ?? '新增目录失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '新增目录成功')
      onDone()
      router.push(getBlogDirectoryHref(result.path || previewPath))
    } catch {
      toast.error('新增目录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className='space-y-4'
      onSubmit={handleSubmit}
    >
      <BlogTextField
        id='blog-create-category-name'
        label='目录名称'
        name='name'
        onChange={setName}
        placeholder='例如：前端'
        value={name}
      />

      <BlogTextField
        description={previewPath ? `完整路径：${previewPath}` : undefined}
        id='blog-create-category-slug'
        label='目录 slug'
        name='slug'
        onChange={(value) => {
          setIsSlugTouched(true)
          setSlug(toSlug(value))
        }}
        placeholder='frontend'
        value={currentSlug}
      />

      <BlogTextareaField
        id='blog-create-category-description'
        label='目录描述'
        name='description'
        onChange={setDescription}
        placeholder='这个目录主要收录前端相关内容'
        value={description}
      />

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
          disabled={!canSubmit}
          type='submit'
        >
          {isSubmitting ? (
            <LoaderCircle className='size-4 animate-spin' />
          ) : (
            <FolderPlus className='size-4' />
          )}
          {isSubmitting ? '正在新增' : '新增'}
        </Button>
      </div>
    </form>
  )
}

export function BlogCreateArticleForm({
  defaultDirectoryPath,
  directoryOptions,
  onDone
}: BlogCreateFormProps) {
  const router = useRouter()
  const categoryPath = defaultDirectoryPath
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlugTouched, setIsSlugTouched] = useState(false)
  const currentSlug = isSlugTouched ? slug : toSlug(title)

  const canSubmit =
    Boolean(categoryPath) &&
    Boolean(title.trim()) &&
    SLUG_PATTERN.test(currentSlug) &&
    !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!categoryPath) {
      toast.error('请选择文章所属目录路径')
      return
    }

    if (!title.trim()) {
      toast.error('请输入文章标题')
      return
    }

    if (!SLUG_PATTERN.test(currentSlug)) {
      toast.error('文章 slug 只能包含小写字母、数字和短横线')
      return
    }

    const categoryOption = directoryOptions.find(
      (option) => option.path === categoryPath
    )

    if (!categoryOption) {
      toast.error('请选择有效的文章所属目录路径')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await createArticleAction({
        categoryId: categoryOption.id,
        title,
        slug: currentSlug,
        description
      })

      if (!result.ok) {
        toast.error(result.message ?? '新增文章失败，请稍后重试')
        return
      }

      toast.success(result.message ?? '新增文章成功')
      onDone()
      const targetPath = result.path || getPreviewPath(categoryPath, currentSlug)

      router.push(getBlogDirectoryHref(targetPath))
    } catch {
      toast.error('新增文章失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className='space-y-4'
      onSubmit={handleSubmit}
    >
      <BlogTextField
        id='blog-create-article-title'
        label='文章标题'
        name='title'
        onChange={setTitle}
        placeholder='例如：Server Actions 实战'
        value={title}
      />

      <BlogTextField
        description='创建后作为文章访问短标识。'
        id='blog-create-article-slug'
        label='文章 slug'
        name='slug'
        onChange={(value) => {
          setIsSlugTouched(true)
          setSlug(toSlug(value))
        }}
        placeholder='server-actions'
        value={currentSlug}
      />

      <BlogTextareaField
        id='blog-create-article-description'
        label='文章摘要'
        name='description'
        onChange={setDescription}
        placeholder='一句话描述这篇草稿'
        value={description}
      />

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
          disabled={!canSubmit}
          type='submit'
        >
          {isSubmitting ? (
            <LoaderCircle className='size-4 animate-spin' />
          ) : (
            <FilePlus2 className='size-4' />
          )}
          {isSubmitting ? '正在新增' : '新增'}
        </Button>
      </div>
    </form>
  )
}

export function BlogTextField({
  description,
  id,
  label,
  name,
  onChange,
  placeholder,
  value
}: {
  description?: string
  id: string
  label: string
  name: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <div>
      <label
        className='mb-2 block text-sm font-medium'
        htmlFor={id}
      >
        {label}
      </label>
      <div className='group flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 transition-colors focus-within:border-foreground/50'>
        <TextCursorInput
          aria-hidden
          className='size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-foreground'
        />
        <input
          className='h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          id={id}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type='text'
          value={value}
        />
      </div>
      {description ? (
        <p className='mt-1.5 text-xs text-muted-foreground'>{description}</p>
      ) : null}
    </div>
  )
}

export function BlogTextareaField({
  id,
  label,
  name,
  onChange,
  placeholder,
  value
}: {
  id: string
  label: string
  name: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <div>
      <label
        className='mb-2 block text-sm font-medium'
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        className='min-h-20 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/50'
        id={id}
        maxLength={300}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  )
}

export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getPreviewPath(parentPath: string, slug: string) {
  if (!slug) {
    return ''
  }

  return parentPath && parentPath !== ROOT_DIRECTORY_PATH
    ? `${parentPath}/${slug}`
    : slug
}

function getBlogDirectoryHref(path: string) {
  const normalizedPath = path
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/')

  return normalizedPath ? `/blog/${normalizedPath}` : '/blog'
}
