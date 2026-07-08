import { cn } from '@/lib/utils'
import { ChevronRight, FileText, Folder } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { BlogTreeNode } from './blog-data'

type BlogFileTreeContentProps = {
  activeFolderId?: string
  children?: ReactNode
  className?: string
  idPrefix?: string
  navClassName?: string
  onNavigate?: () => void
  tree: BlogTreeNode[]
}

type BlogFolderNode = Extract<BlogTreeNode, { type: 'folder' }>
type BlogPostNode = Extract<BlogTreeNode, { type: 'post' }>

type BlogTreeChildren = {
  folders: BlogFolderNode[]
  posts: BlogPostNode[]
}

export function BlogFileTreeContent({
  activeFolderId,
  children,
  className,
  idPrefix = 'blog-tree',
  navClassName,
  onNavigate,
  tree
}: BlogFileTreeContentProps) {
  const childrenByFolderId = getChildrenByFolderId(tree)
  const rootChildren = childrenByFolderId.get(ROOT_FOLDER_KEY)

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
          {rootChildren?.folders.map((folder) => (
            <BlogTreeFolderItem
              activeFolderId={activeFolderId}
              childrenByFolderId={childrenByFolderId}
              idPrefix={idPrefix}
              key={`folder-${folder.id}`}
              node={folder}
              onNavigate={onNavigate}
            />
          ))}
          {rootChildren?.posts.map((post) => (
            <BlogTreePostItem
              key={`post-${post.slug}`}
              node={post}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}

function BlogTreePostItem({
  node,
  onNavigate
}: {
  node: BlogPostNode
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
      <FileText
        aria-hidden
        className='size-4 shrink-0'
      />
      <span className='min-w-0 flex-1 truncate'>{node.title}</span>
    </Link>
  )
}

function BlogTreeFolderItem({
  activeFolderId,
  childrenByFolderId,
  idPrefix,
  node,
  onNavigate
}: {
  activeFolderId?: string
  childrenByFolderId: Map<string, BlogTreeChildren>
  idPrefix: string
  node: BlogFolderNode
  onNavigate?: () => void
}) {
  const children = childrenByFolderId.get(node.id)
  const childFolders = children?.folders ?? []
  const childPosts = children?.posts ?? []
  const hasChildren = childFolders.length > 0 || childPosts.length > 0
  const controlId = `${idPrefix}-folder-${node.id}`
  const isActive = node.id === activeFolderId

  return (
    <div>
      <input
        aria-label={`折叠${node.label}`}
        className='peer sr-only'
        disabled={!hasChildren}
        id={controlId}
        type='checkbox'
      />
      <div
        className={[
          'flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-checked:[&_svg[data-chevron]]:rotate-0',
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
        {hasChildren ? (
          <label
            aria-label={`展开或折叠${node.label}`}
            className='flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            htmlFor={controlId}
          >
            <ChevronRight
              aria-hidden
              className='size-3 rotate-90 transition-transform duration-200'
              data-chevron
            />
          </label>
        ) : (
          <span className='size-4 shrink-0' />
        )}
        <Folder
          aria-hidden
          className='size-4 shrink-0'
        />
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
      {hasChildren ? (
        <div className='peer-checked:hidden'>
          {childFolders.map((folder) => (
            <BlogTreeFolderItem
              activeFolderId={activeFolderId}
              childrenByFolderId={childrenByFolderId}
              idPrefix={idPrefix}
              key={`folder-${folder.id}`}
              node={folder}
              onNavigate={onNavigate}
            />
          ))}
          {childPosts.map((post) => (
            <BlogTreePostItem
              key={`post-${post.slug}`}
              node={post}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const ROOT_FOLDER_KEY = '__root__'

function getChildrenByFolderId(tree: BlogTreeNode[]) {
  const childrenByFolderId = new Map<string, BlogTreeChildren>()

  function getChildren(folderId: string) {
    const children = childrenByFolderId.get(folderId)

    if (children) {
      return children
    }

    const nextChildren: BlogTreeChildren = {
      folders: [],
      posts: []
    }

    childrenByFolderId.set(folderId, nextChildren)

    return nextChildren
  }

  for (const node of tree) {
    if (node.type === 'folder') {
      getChildren(node.parentId ?? ROOT_FOLDER_KEY).folders.push(node)
    } else {
      getChildren(node.folderId).posts.push(node)
    }
  }

  return childrenByFolderId
}
