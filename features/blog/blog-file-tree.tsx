'use client'

import BlurFade from '@/components/magicui/blur-fade'
import { cn } from '@/lib/utils'
import { ChevronRight, FileText, Folder } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { BlogTreeNode } from './blog-data'
import { getVisibleBlogTreeNodes } from './blog-tree-visibility'

type BlogFileTreeProps = {
  activeFolderId?: string
  delay: number
  tree: BlogTreeNode[]
}

type BlogFileTreeContentProps = {
  activeFolderId?: string
  className?: string
  navClassName?: string
  onNavigate?: () => void
  tree: BlogTreeNode[]
}

export function BlogFileTree({
  activeFolderId,
  delay,
  tree
}: BlogFileTreeProps) {
  return (
    <BlurFade
      className='hidden lg:block'
      delay={delay}
    >
      <aside className='h-fit lg:sticky lg:top-24'>
        <BlogFileTreeContent
          activeFolderId={activeFolderId}
          tree={tree}
        />
      </aside>
    </BlurFade>
  )
}

export function BlogFileTreeContent({
  activeFolderId,
  className,
  navClassName,
  onNavigate,
  tree
}: BlogFileTreeContentProps) {
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<string>>(
    () => new Set()
  )
  const visibleTree = useMemo(
    () => getVisibleBlogTreeNodes(tree, collapsedFolderIds),
    [collapsedFolderIds, tree]
  )

  function toggleFolder(folderId: string) {
    setCollapsedFolderIds((currentFolderIds) => {
      const nextFolderIds = new Set(currentFolderIds)

      if (nextFolderIds.has(folderId)) {
        nextFolderIds.delete(folderId)
      } else {
        nextFolderIds.add(folderId)
      }

      return nextFolderIds
    })
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='mb-3 pl-8 text-base font-medium tracking-normal text-muted-foreground'>
        目录
      </div>
      <nav
        aria-label='博客文件夹'
        className={cn('max-h-[420px] overflow-y-auto pr-1', navClassName)}
      >
        <div className='flex flex-col gap-1'>
          {visibleTree.map((treeNode) =>
            treeNode.type === 'post' ? (
              <BlogTreePostItem
                key={`post-${treeNode.slug}`}
                node={treeNode}
                onNavigate={onNavigate}
              />
            ) : (
              <BlogTreeFolderItem
                canCollapse={hasFolderChildren(treeNode.id, tree)}
                isCollapsed={collapsedFolderIds.has(treeNode.id)}
                isActive={treeNode.id === activeFolderId}
                key={`folder-${treeNode.id}`}
                node={treeNode}
                onNavigate={onNavigate}
                onToggle={() => toggleFolder(treeNode.id)}
              />
            )
          )}
        </div>
      </nav>
    </div>
  )
}

function BlogTreePostItem({
  node,
  onNavigate
}: {
  node: Extract<BlogTreeNode, { type: 'post' }>
  onNavigate?: () => void
}) {
  return (
    <Link
      className='flex h-7 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      href={`/blog/${node.slug}`}
      style={{
        paddingLeft: `${0.75 + node.depth * 1.25}rem`
      }}
      onClick={onNavigate}
    >
      <FileText aria-hidden className='size-4 shrink-0' />
      <span className='min-w-0 flex-1 truncate'>{node.title}</span>
    </Link>
  )
}

function BlogTreeFolderItem({
  canCollapse,
  isCollapsed,
  isActive,
  node,
  onNavigate,
  onToggle
}: {
  canCollapse: boolean
  isCollapsed: boolean
  isActive: boolean
  node: Extract<BlogTreeNode, { type: 'folder' }>
  onNavigate?: () => void
  onToggle: () => void
}) {
  return (
    <div
      className={[
        'flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors',
        node.depth === 0
          ? ['sticky top-0 z-10', isActive ? '' : 'bg-background'].join(' ')
          : '',
        isActive
          ? 'bg-accent font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      ].join(' ')}
      style={{
        paddingLeft: `${0.5 + node.depth * 1.25}rem`
      }}
    >
      <button
        type='button'
        aria-label={isCollapsed ? `展开${node.label}` : `折叠${node.label}`}
        aria-expanded={!isCollapsed}
        className='flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        disabled={!canCollapse}
        onClick={onToggle}
      >
        {canCollapse ? (
          <ChevronRight
            aria-hidden
            className={[
              'size-3 transition-transform duration-200',
              isCollapsed ? '' : 'rotate-90'
            ].join(' ')}
          />
        ) : null}
      </button>
      <Folder aria-hidden className='size-4 shrink-0' />
      <Link
        aria-current={isActive ? 'page' : undefined}
        className='min-w-0 flex-1 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        href={`/blog?folder=${node.id}&page=1`}
        onClick={onNavigate}
      >
        {node.label}
      </Link>
      <span className='font-mono text-xs tabular-nums text-muted-foreground'>
        {node.count}
      </span>
    </div>
  )
}

function hasFolderChildren(folderId: string, tree: BlogTreeNode[]) {
  return tree.some((node) =>
    node.type === 'folder'
      ? node.parentId === folderId
      : node.folderId === folderId
  )
}
