'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Check, LoaderCircle, Pencil, Plus, Save, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { createTagAction, updateArticleAction, updateTagAction } from './actions'
import {
  ARTICLE_TAG_COLOR_OPTIONS,
  BlogArticleTagBadge,
  DEFAULT_ARTICLE_TAG_COLOR,
  getArticleTagBackgroundColor,
  getArticleTagColor,
  isArticleTagColor
} from './blog-article-tag-badge'
import type { BlogArticleDetail, BlogArticleTag } from './blog-data'

type BlogArticleTagsEditorProps = {
  article: BlogArticleDetail
  canManageArticle: boolean
  tagOptions: BlogArticleTag[]
}

export function BlogArticleTagsEditor({
  article,
  canManageArticle,
  tagOptions
}: BlogArticleTagsEditorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState(() =>
    mergeTagOptions(tagOptions, article.tags)
  )
  const [selectedIds, setSelectedIds] = useState(() =>
    article.tags.map((tag) => tag.id)
  )
  const [selectedColor, setSelectedColor] = useState<string>(
    DEFAULT_ARTICLE_TAG_COLOR
  )
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [removingTagId, setRemovingTagId] = useState<string | null>(null)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingColor, setEditingColor] = useState<string>(
    DEFAULT_ARTICLE_TAG_COLOR
  )
  const [updatingTagId, setUpdatingTagId] = useState<string | null>(null)
  const normalizedQuery = query.trim()
  const normalizedEditingName = editingName.trim()
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedTags = useMemo(
    () => options.filter((tag) => selectedIdSet.has(tag.id)),
    [options, selectedIdSet]
  )
  const filteredOptions = useMemo(() => {
    const keyword = normalizedQuery.toLowerCase()

    if (!keyword) {
      return options
    }

    return options.filter((tag) => tag.name.toLowerCase().includes(keyword))
  }, [normalizedQuery, options])
  const canCreate =
    normalizedQuery.length > 0 &&
    normalizedQuery.length <= 40 &&
    !options.some((tag) => tag.name === normalizedQuery)
  const hasChanged = !isSameTagSelection(
    article.tags.map((tag) => tag.id),
    selectedIds
  )
  const editingTag = editingTagId
    ? options.find((tag) => tag.id === editingTagId)
    : null
  const hasDuplicateEditingName = options.some(
    (tag) => tag.id !== editingTagId && tag.name === normalizedEditingName
  )
  const canUpdateTag = editingTag
    ? normalizedEditingName.length > 0 &&
      normalizedEditingName.length <= 40 &&
      isArticleTagColor(editingColor) &&
      (normalizedEditingName !== editingTag.name ||
        editingColor.toLowerCase() !==
          getArticleTagColor(editingTag).toLowerCase()) &&
      !hasDuplicateEditingName
    : false

  const toggleTag = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    )
  }

  const handleCreateTag = async () => {
    if (!canCreate || isCreating) {
      return
    }

    try {
      setIsCreating(true)
      const result = await createTagAction({
        color: selectedColor,
        name: normalizedQuery
      })

      if (!result.ok || !result.id) {
        toast.error(result.message ?? '新增标签失败，请稍后重试')
        return
      }

      const tag = {
        color: selectedColor,
        id: result.id,
        name: normalizedQuery
      }

      setOptions((current) => mergeTagOptions(current, [tag]))
      setSelectedIds((current) =>
        current.includes(tag.id) ? current : [...current, tag.id]
      )
      setQuery('')
      toast.success(result.message ?? '新增标签成功')
    } catch {
      toast.error('标签服务暂不可用，请稍后重试')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSave = async () => {
    if (isSaving || !hasChanged) {
      setOpen(false)
      return
    }

    try {
      setIsSaving(true)
      const result = await updateArticleAction({
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: article.description,
        status: article.status,
        content: article.content,
        tagIds: selectedIds
      })

      if (!result.ok) {
        toast.error(result.message ?? '更新标签失败，请稍后重试')
        return
      }

      toast.success('标签已更新')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('更新标签失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveTag = async (tag: BlogArticleTag) => {
    if (!canManageArticle || removingTagId) {
      return
    }

    const nextSelectedIds = selectedIds.filter((id) => id !== tag.id)

    try {
      setRemovingTagId(tag.id)
      const result = await updateArticleAction({
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: article.description,
        status: article.status,
        content: article.content,
        tagIds: nextSelectedIds
      })

      if (!result.ok) {
        toast.error(result.message ?? '移除标签失败，请稍后重试')
        return
      }

      setSelectedIds(nextSelectedIds)
      toast.success('标签已移除')
      router.refresh()
    } catch {
      toast.error('移除标签失败，请稍后重试')
    } finally {
      setRemovingTagId(null)
    }
  }

  const startEditTag = (tag: BlogArticleTag) => {
    setEditingTagId(tag.id)
    setEditingName(tag.name)
    setEditingColor(getArticleTagColor(tag))
  }

  const cancelEditTag = () => {
    setEditingTagId(null)
    setEditingName('')
    setEditingColor(DEFAULT_ARTICLE_TAG_COLOR)
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !canUpdateTag || updatingTagId) {
      return
    }

    try {
      setUpdatingTagId(editingTag.id)
      const result = await updateTagAction({
        id: editingTag.id,
        name: normalizedEditingName,
        color: editingColor
      })

      if (!result.ok) {
        toast.error(result.message ?? '更新标签失败，请稍后重试')
        return
      }

      const nextTag = {
        ...editingTag,
        color: editingColor,
        name: normalizedEditingName
      }
      setOptions((current) => mergeTagOptions(current, [nextTag]))
      cancelEditTag()
      toast.success(result.message ?? '更新标签成功')
      router.refresh()
    } catch {
      toast.error('更新标签失败，请稍后重试')
    } finally {
      setUpdatingTagId(null)
    }
  }

  const resetDraft = () => {
    setSelectedIds(article.tags.map((tag) => tag.id))
    setQuery('')
    setSelectedColor(DEFAULT_ARTICLE_TAG_COLOR)
    cancelEditTag()
  }

  return (
    <div className='space-y-2'>
      <div>
        <p className='text-xs text-muted-foreground'>标签</p>
      </div>

      <div className='flex min-h-6 flex-wrap gap-1.5 text-sm text-foreground'>
        <AnimatePresence initial={false}>
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <TagChip
                canDelete={canManageArticle}
                isDeleting={removingTagId === tag.id}
                key={tag.id}
                onDelete={() => void handleRemoveTag(tag)}
                tag={tag}
              />
            ))
          ) : (
            <motion.span
              animate={{ opacity: 1 }}
              className='text-xs text-muted-foreground'
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key='empty-tags'
            >
              暂无标签
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div>
        {canManageArticle ? (
          <Popover
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                resetDraft()
              }

              setOpen(nextOpen)
            }}
            open={open}
          >
            <PopoverTrigger asChild>
              <Button
                aria-label='编辑标签'
                className='px-0 text-foreground hover:bg-transparent hover:text-primary focus-visible:bg-transparent focus-visible:text-primary aria-expanded:bg-transparent aria-expanded:text-primary'
                size='sm'
                type='button'
                variant='ghost'
              >
                <Plus className='size-4' />
                添加标签
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align='start'
              className='w-80 gap-3'
            >
              <div className='space-y-1'>
                <p className='text-sm font-medium'>编辑标签</p>
              </div>

              <Input
                autoComplete='off'
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleCreateTag()
                  }
                }}
                placeholder='搜索或创建标签'
                value={query}
              />

              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>颜色</span>
                <div className='flex flex-wrap gap-1.5'>
                  {ARTICLE_TAG_COLOR_OPTIONS.map((color) => {
                    const isSelected = selectedColor === color

                    return (
                      <button
                        aria-label={`选择标签颜色 ${color}`}
                        className='grid size-6 place-items-center rounded-md border transition-transform hover:scale-105'
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          backgroundColor: getArticleTagBackgroundColor(color),
                          borderColor: color
                        }}
                        type='button'
                      >
                        {isSelected ? (
                          <Check
                            className='size-3.5'
                            style={{ color }}
                          />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className='max-h-32 space-y-1 overflow-y-auto pr-1'>
                {filteredOptions.map((tag) => {
                  const isSelected = selectedIdSet.has(tag.id)
                  const color = getArticleTagColor(tag)
                  const isEditing = editingTagId === tag.id
                  const isUpdating = updatingTagId === tag.id

                  return (
                    <div key={tag.id}>
                      <div className='group flex h-8 w-full items-center gap-1 rounded-md px-2 text-sm transition-colors hover:bg-muted'>
                        <button
                          className='flex min-w-0 flex-1 items-center text-left'
                          disabled={isEditing}
                          onClick={() => toggleTag(tag.id)}
                          type='button'
                        >
                          <span className='flex min-w-0 items-center gap-2'>
                            <span
                              aria-hidden='true'
                              className='size-2.5 rounded-full border'
                              style={{
                                backgroundColor:
                                  getArticleTagBackgroundColor(color),
                                borderColor: color
                              }}
                            />
                            <span className='min-w-0 truncate'>{tag.name}</span>
                          </span>
                        </button>
                        <button
                          aria-label={`编辑标签 ${tag.name}`}
                          className='grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100'
                          onClick={() => startEditTag(tag)}
                          type='button'
                        >
                          <Pencil className='size-3.5' />
                        </button>
                        <span className='grid size-4 shrink-0 place-items-center'>
                          {isSelected ? (
                            <Check
                              className='size-4'
                              style={{ color }}
                            />
                          ) : null}
                        </span>
                      </div>

                      <AnimatePresence initial={false}>
                        {isEditing ? (
                          <motion.div
                            animate={{ height: 'auto', opacity: 1 }}
                            className='overflow-hidden'
                            exit={{ height: 0, opacity: 0 }}
                            initial={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.16 }}
                          >
                            <div className='space-y-2 rounded-md bg-muted/50 p-2'>
                              <Input
                                autoComplete='off'
                                className='h-8'
                                disabled={isUpdating}
                                onChange={(event) =>
                                  setEditingName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault()
                                    void handleUpdateTag()
                                  }
                                }}
                                placeholder='标签名称'
                                value={editingName}
                              />

                              <div className='flex flex-wrap gap-1.5'>
                                {ARTICLE_TAG_COLOR_OPTIONS.map(
                                  (optionColor) => {
                                    const optionSelected =
                                      editingColor === optionColor

                                    return (
                                      <button
                                        aria-label={`选择标签颜色 ${optionColor}`}
                                        className='grid size-6 place-items-center rounded-md border transition-transform hover:scale-105 disabled:opacity-60'
                                        disabled={isUpdating}
                                        key={optionColor}
                                        onClick={() =>
                                          setEditingColor(optionColor)
                                        }
                                        style={{
                                          backgroundColor:
                                            getArticleTagBackgroundColor(
                                              optionColor
                                            ),
                                          borderColor: optionColor
                                        }}
                                        type='button'
                                      >
                                        {optionSelected ? (
                                          <Check
                                            className='size-3.5'
                                            style={{ color: optionColor }}
                                          />
                                        ) : null}
                                      </button>
                                    )
                                  }
                                )}
                              </div>

                              {normalizedEditingName.length > 40 ? (
                                <p className='text-xs text-destructive'>
                                  标签名称不能超过 40 个字符
                                </p>
                              ) : null}

                              {hasDuplicateEditingName ? (
                                <p className='text-xs text-destructive'>
                                  标签已存在
                                </p>
                              ) : null}

                              <div className='flex justify-end gap-1.5'>
                                <Button
                                  disabled={isUpdating}
                                  onClick={cancelEditTag}
                                  size='sm'
                                  type='button'
                                  variant='outline'
                                >
                                  <X className='size-3.5' />
                                  取消
                                </Button>
                                <Button
                                  disabled={!canUpdateTag || isUpdating}
                                  onClick={() => void handleUpdateTag()}
                                  size='sm'
                                  type='button'
                                >
                                  {isUpdating ? (
                                    <LoaderCircle className='size-3.5 animate-spin' />
                                  ) : (
                                    <Save className='size-3.5' />
                                  )}
                                  保存
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  )
                })}

                {filteredOptions.length === 0 && !canCreate ? (
                  <p className='px-2 py-4 text-center text-xs text-muted-foreground'>
                    暂无匹配标签
                  </p>
                ) : null}

                {normalizedQuery.length > 40 ? (
                  <p className='px-2 py-2 text-xs text-destructive'>
                    标签名称不能超过 40 个字符
                  </p>
                ) : null}

                {canCreate ? (
                  <button
                    className='flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-60'
                    disabled={isCreating}
                    onClick={() => void handleCreateTag()}
                    type='button'
                  >
                    {isCreating ? (
                      <LoaderCircle className='size-4 animate-spin' />
                    ) : (
                      <Plus className='size-4' />
                    )}
                    <span className='min-w-0 truncate'>
                      创建“{normalizedQuery}”
                    </span>
                  </button>
                ) : null}
              </div>

              <div className='flex justify-end gap-2 border-t pt-2'>
                <Button
                  onClick={() => {
                    resetDraft()
                    setOpen(false)
                  }}
                  size='sm'
                  type='button'
                  variant='outline'
                >
                  <X className='size-3.5' />
                  取消
                </Button>
                <Button
                  disabled={isSaving || !hasChanged}
                  onClick={() => void handleSave()}
                  size='sm'
                  type='button'
                >
                  {isSaving ? (
                    <LoaderCircle className='size-3.5 animate-spin' />
                  ) : (
                    <Save className='size-3.5' />
                  )}
                  保存
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  )
}

function TagChip({
  canDelete,
  isDeleting,
  onDelete,
  tag
}: {
  canDelete: boolean
  isDeleting: boolean
  onDelete: () => void
  tag: BlogArticleTag
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className='inline-flex'
      exit={{ opacity: 0, scale: 0.96 }}
      initial={{ opacity: 0, scale: 0.96 }}
      layout
      transition={{ duration: 0.14 }}
    >
      <BlogArticleTagBadge
        tag={tag}
        trailing={
          canDelete ? (
            <button
              aria-label={`移除标签 ${tag.name}`}
              className='grid size-4 shrink-0 place-items-center rounded-sm opacity-0 transition-opacity hover:bg-background/60 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-100 group-hover:opacity-100'
              disabled={isDeleting}
              onClick={(event) => {
                event.stopPropagation()
                onDelete()
              }}
              type='button'
            >
              {isDeleting ? (
                <LoaderCircle className='size-3 animate-spin' />
              ) : (
                <X className='size-3' />
              )}
            </button>
          ) : null
        }
      />
    </motion.div>
  )
}

function mergeTagOptions(
  options: BlogArticleTag[],
  selectedTags: BlogArticleTag[]
) {
  const tagById = new Map<string, BlogArticleTag>()

  for (const tag of [...options, ...selectedTags]) {
    tagById.set(tag.id, tag)
  }

  return Array.from(tagById.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-Hans-CN')
  )
}

function isSameTagSelection(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false
  }

  const bSet = new Set(b)
  return a.every((id) => bSet.has(id))
}
