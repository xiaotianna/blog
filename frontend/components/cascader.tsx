'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useMemo, useState } from 'react'

export type CascaderNode = {
  value: string
  label: string
  badgeLabel?: string
  selectable?: boolean
  children?: CascaderNode[]
}

type CascaderProps = {
  id?: string
  options: CascaderNode[]
  value: string | null
  onValueChange: (next: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyRootText?: string
  emptyChildText?: string
  disabled?: boolean
  className?: string
  contentHeightClassName?: string
  triggerClassName?: string
}

type CascaderColumn = {
  key: string
  nodes: CascaderNode[]
}

const filterNodes = (nodes: CascaderNode[], query: string): CascaderNode[] => {
  if (!query) {
    return nodes
  }

  return nodes.reduce<CascaderNode[]>((result, node) => {
    const filteredChildren = filterNodes(node.children ?? [], query)
    const selfMatched =
      node.label.toLowerCase().includes(query) ||
      node.value.toLowerCase().includes(query)

    if (!selfMatched && filteredChildren.length === 0) {
      return result
    }

    result.push({
      ...node,
      children: filteredChildren
    })

    return result
  }, [])
}

const findNodePathByValue = (
  nodes: CascaderNode[],
  value: string
): CascaderNode[] | null => {
  for (const node of nodes) {
    if (node.value === value) {
      return [node]
    }

    const childPath = findNodePathByValue(node.children ?? [], value)
    if (childPath) {
      return [node, ...childPath]
    }
  }

  return null
}

const getInitialActivePath = (
  nodes: CascaderNode[],
  value: string | null
): string[] => {
  const selectedPath = value ? findNodePathByValue(nodes, value) : null
  const selectedNode = selectedPath?.[selectedPath.length - 1]

  if (selectedPath?.length) {
    return selectedNode?.children?.length
      ? selectedPath.map((node) => node.value)
      : selectedPath.slice(0, -1).map((node) => node.value)
  }

  return nodes[0] ? [nodes[0].value] : []
}

export function Cascader({
  id,
  options,
  value,
  onValueChange,
  placeholder = '请选择',
  searchPlaceholder = '搜索',
  emptyRootText = '暂无选项',
  emptyChildText = '当前暂无可选项',
  disabled = false,
  className,
  contentHeightClassName = 'h-80 min-h-56',
  triggerClassName
}: CascaderProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activePath, setActivePath] = useState<string[]>([])

  const normalizedQuery = search.trim().toLowerCase()
  const filteredOptions = useMemo(
    () => filterNodes(options, normalizedQuery),
    [options, normalizedQuery]
  )

  const visibleColumns = useMemo<CascaderColumn[]>(() => {
    if (filteredOptions.length === 0) {
      return [{ key: 'root', nodes: [] }]
    }

    const columns: CascaderColumn[] = [{ key: 'root', nodes: filteredOptions }]
    let currentNodes = filteredOptions
    let appendedChildColumn = false

    for (let depth = 0; depth < activePath.length; depth += 1) {
      const currentNode = currentNodes.find(
        (node) => node.value === activePath[depth]
      )
      if (!currentNode) {
        break
      }

      appendedChildColumn = true
      columns.push({
        key: `${currentNode.value}-${depth}`,
        nodes: currentNode.children ?? []
      })

      if (!currentNode.children?.length) {
        break
      }

      currentNodes = currentNode.children
    }

    if (!appendedChildColumn) {
      columns.push({
        key: 'empty-child',
        nodes: []
      })
    }

    return columns
  }, [activePath, filteredOptions])
  const columnWindowStart = Math.max(visibleColumns.length - 2, 0)
  const displayColumns = visibleColumns.slice(columnWindowStart)
  const canGoBack = columnWindowStart > 0

  const selectedNode = useMemo(() => {
    if (!value) {
      return null
    }

    const path = findNodePathByValue(options, value)
    if (!path?.length) {
      return null
    }

    return path[path.length - 1] ?? null
  }, [options, value])

  const selectedPathValues = useMemo(() => {
    if (!value) {
      return new Set<string>()
    }

    const path = findNodePathByValue(options, value)

    return new Set(path?.map((node) => node.value) ?? [])
  }, [options, value])

  return (
    <div className={cn('min-w-0', className)}>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (disabled) {
            return
          }

          if (nextOpen) {
            setSearch('')
            setActivePath(getInitialActivePath(options, value))
          }

          setOpen(nextOpen)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              'h-8 w-full min-w-0 justify-between gap-1 rounded-sm border-input px-2.5 font-normal focus-visible:ring-ring/50',
              !value && 'text-muted-foreground',
              triggerClassName
            )}
            disabled={disabled}
            id={id}
            onClick={(event) => {
              if (!open) {
                return
              }

              event.preventDefault()
              setOpen(false)
            }}
            type='button'
            variant='outline'
          >
            <span className='flex min-w-0 flex-1 items-center gap-2 overflow-hidden'>
              <span className='min-w-0 flex-1 truncate text-left text-sm'>
                {selectedNode?.label ?? value ?? placeholder}
              </span>
              {selectedNode?.badgeLabel ? (
                <Badge
                  className='hidden max-w-32 shrink truncate sm:inline-flex'
                  variant='outline'
                  title={selectedNode.badgeLabel}
                >
                  {selectedNode.badgeLabel}
                </Badge>
              ) : null}
            </span>
            <span className='flex shrink-0 items-center gap-0.5'>
              {value ? (
                <span
                  aria-label='清除'
                  className='inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground'
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onValueChange(null)
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <X className='size-3.5' />
                </span>
              ) : null}
              <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          avoidCollisions={false}
          className='w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] gap-0 p-0'
          side='bottom'
        >
          <div className='border-b border-border p-2'>
            <Input
              disabled={disabled}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              value={search}
            />
          </div>
          <div className='relative'>
            {canGoBack ? (
              <button
                aria-label='查看上一级目录'
                className='absolute left-2 top-1/2 z-10 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground'
                onClick={() =>
                  setActivePath((current) => current.slice(0, -1))
                }
                type='button'
              >
                <ChevronLeft className='size-4' />
              </button>
            ) : null}
            <div className={cn('overflow-hidden', contentHeightClassName)}>
              <div className='flex h-full min-h-0 w-full items-stretch'>
                {displayColumns.map((column, columnIndex) => {
                  const originalColumnIndex = columnWindowStart + columnIndex
                  const columnHasIcon = column.nodes.some(
                    (node) =>
                      Boolean(node.children?.length) ||
                      selectedPathValues.has(node.value)
                  )

                  return (
                    <div
                      className={cn(
                        'flex min-h-0 min-w-0 flex-1 basis-1/2 flex-col self-stretch border-border',
                        columnIndex < displayColumns.length - 1 && 'border-r'
                      )}
                      key={column.key}
                    >
                      <div className='min-h-0 flex-1 overflow-y-auto p-1'>
                        {column.nodes.length === 0 ? (
                          <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                            {originalColumnIndex === 0
                              ? emptyRootText
                              : emptyChildText}
                          </div>
                        ) : (
                          column.nodes.map((node) => {
                            const nextPath = [
                              ...activePath.slice(0, originalColumnIndex),
                              node.value
                            ]
                            const isPicked = value === node.value
                            const isSelectedAncestor =
                              !isPicked && selectedPathValues.has(node.value)
                            const hasChildren = Boolean(node.children?.length)
                            const selectable = node.selectable !== false

                            return (
                              <div
                                className={cn(
                                  'flex w-full items-center rounded-sm text-sm transition-colors hover:bg-muted',
                                  isPicked &&
                                    'bg-accent font-normal text-accent-foreground hover:bg-accent',
                                  isSelectedAncestor &&
                                    'bg-muted text-foreground hover:bg-muted'
                                )}
                                key={node.value}
                              >
                                <button
                                  className='flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-2 py-1.5 text-left outline-none'
                                  disabled={disabled}
                                  onClick={() => {
                                    setActivePath(nextPath)

                                    if (selectable) {
                                      onValueChange(node.value)
                                      setOpen(false)
                                    }
                                  }}
                                  type='button'
                                >
                                  <span
                                    className='min-w-0 flex-1 truncate'
                                    title={node.label}
                                  >
                                    {node.label}
                                  </span>
                                  {node.badgeLabel ? (
                                    <Badge
                                      className='hidden min-w-0 max-w-24 shrink overflow-hidden text-ellipsis whitespace-nowrap px-1.5 sm:inline-flex'
                                      title={node.badgeLabel}
                                      variant='outline'
                                    >
                                      {node.badgeLabel}
                                    </Badge>
                                  ) : null}
                                </button>
                                {columnHasIcon ? (
                                  hasChildren ? (
                                    <button
                                      aria-label={`进入${node.label}`}
                                      className='inline-flex size-7 shrink-0 items-center justify-center outline-none'
                                      disabled={disabled}
                                      onClick={() => setActivePath(nextPath)}
                                      type='button'
                                    >
                                      <ChevronRight className='size-3.5' />
                                    </button>
                                  ) : (
                                    <span className='inline-flex size-7 shrink-0 items-center justify-center'>
                                      {isPicked ? (
                                        <Check className='size-3.5 text-primary' />
                                      ) : null}
                                    </span>
                                  )
                                ) : null}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
