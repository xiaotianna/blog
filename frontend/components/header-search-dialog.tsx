'use client'

import { Button } from '@/components/ui/button'
import type {
  SearchHighlightField,
  SearchResponse,
  SearchResult,
  SearchResultTag
} from '@/features/search/search-types'
import { queueSearchHighlight } from '@/features/search/search-arrival-highlighter'
import { cn } from '@/lib/utils'
import {
  FileText,
  Folder,
  LoaderCircle,
  Search,
  SearchX,
  TriangleAlert,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dialog as DialogPrimitive } from 'radix-ui'
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode
} from 'react'

const SEARCH_DEBOUNCE = 250
const SEARCH_QUERY_LIMIT = 100
type SearchStatus = 'idle' | 'loading' | 'success' | 'error'
type SearchTargetKind = 'main' | 'description' | 'tag' | 'content'

type SearchNavigationTarget = {
  field: SearchHighlightField
  highlightQuery: string
  hint?: string
  index: number
  item: SearchResult
  key: string
  kind: SearchTargetKind
  tag?: SearchResultTag
}

type SearchResultGroup = {
  item: SearchResult
  targets: SearchNavigationTarget[]
}

export function HeaderSearchDialog() {
  const router = useRouter()
  const resultListId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const normalizedQuery = query.trim()
  const resultGroups = useMemo(
    () => buildSearchResultGroups(items, normalizedQuery),
    [items, normalizedQuery]
  )
  const navigationTargets = resultGroups.flatMap((group) => group.targets)

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    const delay = normalizedQuery ? SEARCH_DEBOUNCE : 0
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalizedQuery)}`,
          {
            cache: 'no-store',
            signal: controller.signal
          }
        )
        const result = (await response.json()) as
          | SearchResponse
          | { message?: string }

        if (!response.ok) {
          throw new Error(
            'message' in result && result.message
              ? result.message
              : '搜索服务暂时不可用，请稍后重试'
          )
        }

        const nextItems = (result as SearchResponse).items ?? []
        setItems(nextItems)
        setActiveIndex(
          buildSearchResultGroups(nextItems, normalizedQuery).length > 0
            ? 0
            : -1
        )
        setStatus('success')
      } catch (error) {
        if (controller.signal.aborted) return

        setItems([])
        setActiveIndex(-1)
        setErrorMessage(
          error instanceof Error
            ? error.message
            : '搜索服务暂时不可用，请稍后重试'
        )
        setStatus('error')
      }
    }, delay)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [normalizedQuery, open])

  useEffect(() => {
    if (activeIndex < 0) return

    document
      .getElementById(`${resultListId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, resultListId])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setStatus('loading')
      return
    }

    setQuery('')
    setItems([])
    setStatus('idle')
    setErrorMessage('')
    setActiveIndex(-1)
  }

  const handleQueryChange = (value: string) => {
    const nextQuery = Array.from(value).slice(0, SEARCH_QUERY_LIMIT).join('')
    const nextNormalizedQuery = nextQuery.trim()

    setQuery(nextQuery)
    if (nextNormalizedQuery === normalizedQuery) return

    setItems([])
    setActiveIndex(-1)
    setStatus('loading')
    setErrorMessage('')
  }

  const openResult = (target: SearchNavigationTarget) => {
    const { item } = target
    const path = item.path
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    const prefix = item.type === 'directory' ? '/blog' : '/post'
    const href = path ? `${prefix}/${path}` : prefix

    if (target.highlightQuery) {
      queueSearchHighlight({
        field: target.field,
        hint: target.hint,
        path: href,
        query: target.highlightQuery
      })
    }

    handleOpenChange(false)
    router.push(href)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (navigationTargets.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) =>
        current < 0 ? 0 : (current + 1) % navigationTargets.length
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        current <= 0 ? navigationTargets.length - 1 : current - 1
      )
      return
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const target = navigationTargets[activeIndex]
      if (target) openResult(target)
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogPrimitive.Trigger asChild>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='打开搜索'
          title='打开搜索'
        >
          <Search className='size-4' />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:bg-black/45' />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-4 right-4 top-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl shadow-foreground/10 outline-none',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[1.04] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'md:left-1/2 md:right-auto md:top-[9vh] md:h-[25rem] md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2'
          )}
        >
          <DialogPrimitive.Title className='sr-only'>
            搜索文档
          </DialogPrimitive.Title>

          <div className='shrink-0 border-b border-border'>
            <div className='flex h-14 items-center gap-3 px-4'>
              <Search
                aria-hidden
                className='size-4 shrink-0 text-muted-foreground'
              />
              <input
                type='text'
                role='combobox'
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${resultListId}-option-${activeIndex}`
                    : undefined
                }
                aria-autocomplete='list'
                aria-controls={resultListId}
                aria-expanded={open}
                aria-label='搜索内容'
                autoFocus
                placeholder='What are you searching for?'
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={handleInputKeyDown}
                className='h-full min-w-0 flex-1 bg-transparent text-lg font-normal outline-none placeholder:text-muted-foreground'
              />
              <DialogPrimitive.Close asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  aria-label='关闭搜索'
                  className='shrink-0 text-muted-foreground hover:text-foreground'
                >
                  <X className='size-4' />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          <div
            id={resultListId}
            role='listbox'
            aria-busy={status === 'loading'}
            aria-label={normalizedQuery ? '搜索结果' : '最近发布文章'}
            className='min-h-0 flex-1 overflow-y-auto p-2'
          >
            {status === 'loading' && items.length === 0 ? (
              <SearchState
                icon={
                  <LoaderCircle className='size-5 animate-spin' />
                }
                message='正在搜索…'
              />
            ) : status === 'error' ? (
              <SearchState
                icon={<TriangleAlert className='size-5' />}
                message={errorMessage}
              />
            ) : status === 'success' && items.length === 0 ? (
              <SearchState
                icon={<SearchX className='size-5' />}
                message={normalizedQuery ? '没有找到匹配内容' : '暂无已发布文章'}
              />
            ) : (
              <div className='flex flex-col gap-1'>
                {!normalizedQuery && items.length > 0 && (
                  <div className='px-3 pb-1 pt-1 text-xs font-medium text-muted-foreground'>
                    最近发布
                  </div>
                )}
                {resultGroups.map((group) => (
                  <SearchResultGroup
                    activeIndex={activeIndex}
                    group={group}
                    key={`${group.item.type}-${group.item.id}`}
                    query={normalizedQuery}
                    resultListId={resultListId}
                    onOpen={openResult}
                    onSelect={setActiveIndex}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function buildSearchResultGroups(
  items: SearchResult[],
  query: string
): SearchResultGroup[] {
  let targetIndex = 0

  return items.map((item) => {
    const targets: SearchNavigationTarget[] = []
    const addTarget = (
      target: Omit<SearchNavigationTarget, 'index' | 'item'>
    ) => {
      targets.push({ ...target, index: targetIndex++, item })
    }

    if (item.type === 'directory') {
      const field: SearchHighlightField = item.titleMatched
        ? 'title'
        : item.description && query
          ? 'description'
          : 'title'

      addTarget({
        field,
        highlightQuery: query || item.title,
        hint: field === 'description' ? item.description : item.title,
        key: `${item.type}-${item.id}-main`,
        kind: 'main'
      })

      return { item, targets }
    }

    addTarget({
      field: 'title',
      highlightQuery: item.titleMatched && query ? query : item.title,
      hint: item.title,
      key: `${item.type}-${item.id}-main`,
      kind: 'main'
    })

    if (query && item.description) {
      addTarget({
        field: 'description',
        highlightQuery: query,
        hint: item.description,
        key: `${item.type}-${item.id}-description`,
        kind: 'description'
      })
    }

    if (query) {
      for (const tag of item.tags ?? []) {
        addTarget({
          field: 'tag',
          highlightQuery: query,
          hint: tag.name,
          key: `${item.type}-${item.id}-tag-${tag.id}`,
          kind: 'tag',
          tag
        })
      }
    }

    if (query && item.content) {
      addTarget({
        field: 'content',
        highlightQuery: query,
        hint: item.content,
        key: `${item.type}-${item.id}-content`,
        kind: 'content'
      })
    }

    return { item, targets }
  })
}

function SearchResultGroup({
  activeIndex,
  group,
  query,
  resultListId,
  onOpen,
  onSelect
}: {
  activeIndex: number
  group: SearchResultGroup
  query: string
  resultListId: string
  onOpen: (target: SearchNavigationTarget) => void
  onSelect: (index: number) => void
}) {
  const { item, targets } = group
  const Icon = item.type === 'directory' ? Folder : FileText
  const [mainTarget, ...childTargets] = targets

  return (
    <div
      role='group'
      aria-label={item.title}
      className='rounded-md'
    >
      <SearchTargetButton
        active={mainTarget.index === activeIndex}
        id={`${resultListId}-option-${mainTarget.index}`}
        target={mainTarget}
        onOpen={onOpen}
        onSelect={onSelect}
        className='items-start gap-3 px-3 py-2.5'
      >
        <Icon
          aria-hidden
          className='mt-0.5 size-4 shrink-0 text-muted-foreground'
          strokeWidth={1.9}
        />
        <span className='min-w-0 flex-1'>
          <span className='block truncate font-medium'>
            <HighlightText
              query={item.titleMatched ? query : ''}
              text={item.title}
            />
          </span>
          {item.type === 'directory' && item.description && (
            <ResultDetail label='描述'>
              <HighlightText
                query={query}
                text={item.description}
              />
            </ResultDetail>
          )}
        </span>
      </SearchTargetButton>

      {childTargets.length > 0 && (
        <div className='ml-8 border-l border-border/70 pb-1 pl-2'>
          {childTargets.map((target) => (
            <SearchTargetButton
              active={target.index === activeIndex}
              id={`${resultListId}-option-${target.index}`}
              key={target.key}
              target={target}
              onOpen={onOpen}
              onSelect={onSelect}
              className='items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground'
            >
              <span className='w-8 shrink-0 text-muted-foreground'>
                {getTargetLabel(target.kind)}
              </span>
              {target.kind === 'tag' && target.tag ? (
                <SearchTag
                  query={query}
                  tag={target.tag}
                />
              ) : (
                <span className='min-w-0 flex-1 truncate'>
                  <HighlightText
                    query={query}
                    text={getTargetText(target)}
                  />
                </span>
              )}
            </SearchTargetButton>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchTargetButton({
  active,
  children,
  className,
  id,
  target,
  onOpen,
  onSelect
}: {
  active: boolean
  children: ReactNode
  className?: string
  id: string
  target: SearchNavigationTarget
  onOpen: (target: SearchNavigationTarget) => void
  onSelect: (index: number) => void
}) {
  return (
    <button
      type='button'
      id={id}
      role='option'
      aria-selected={active}
      onClick={() => onOpen(target)}
      onMouseEnter={() => onSelect(target.index)}
      className={cn(
        'flex w-full cursor-pointer rounded-md text-left text-sm text-foreground transition-colors hover:bg-muted',
        active && 'bg-muted',
        className
      )}
    >
      {children}
    </button>
  )
}

function getTargetLabel(kind: SearchTargetKind) {
  if (kind === 'description') return '描述'
  if (kind === 'tag') return 'Tag'
  if (kind === 'content') return '正文'
  return ''
}

function getTargetText(target: SearchNavigationTarget) {
  if (target.kind === 'description') return target.item.description ?? ''
  if (target.kind === 'content') return target.item.content ?? ''
  return target.item.title
}

function ResultDetail({
  children,
  label
}: {
  children: ReactNode
  label: string
}) {
  return (
    <span className='mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground'>
      <span className='shrink-0'>{label}</span>
      <span className='truncate'>{children}</span>
    </span>
  )
}

function SearchTag({
  query,
  tag
}: {
  query: string
  tag: SearchResultTag
}) {
  return (
    <span
      className='min-w-0 max-w-36 shrink truncate rounded border px-1.5 py-0.5 text-[11px] leading-none'
      style={{
        borderColor: tag.color,
        color: tag.color,
        backgroundColor: `${tag.color}1a`
      }}
    >
      <HighlightText
        query={query}
        text={tag.name}
      />
    </span>
  )
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return text

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return parts.map((part, index) =>
    part.localeCompare(query, undefined, { sensitivity: 'accent' }) === 0 ? (
      <mark
        className='rounded-sm bg-amber-300/65 px-0.5 text-inherit dark:bg-amber-500/45'
        key={`${part}-${index}`}
      >
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function SearchState({
  icon,
  message
}: {
  icon: ReactNode
  message: string
}) {
  return (
    <div
      role='status'
      className='flex h-full min-h-40 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground'
    >
      {icon}
      <span>{message}</span>
    </div>
  )
}
