'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  FileDown,
  FilePenLine,
  FolderInput,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import { useState } from 'react'

import { BlogArticleImportDialog } from './blog-article-import-dialog'
import {
  BlogArticleDeleteDialog,
  BlogArticleEditDialog,
  BlogArticleMoveDialog
} from './blog-node-edit-dialog'
import type { BlogArticleDetail, BlogDirectoryOption } from './blog-data'

type BlogArticleActionsMenuProps = {
  article: BlogArticleDetail
  directoryOptions: BlogDirectoryOption[]
}

export function BlogArticleActionsMenu({
  article,
  directoryOptions
}: BlogArticleActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label='文章操作'
            size='icon'
            type='button'
            variant='outline'
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-40'
        >
          <DropdownMenuItem onSelect={() => setImportOpen(true)}>
            <FileDown className='size-4' />
            导入文章
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <FilePenLine className='size-4' />
            修改信息
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMoveOpen(true)}>
            <FolderInput className='size-4' />
            移动文章
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            variant='destructive'
          >
            <Trash2 className='size-4' />
            删除文章
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BlogArticleImportDialog
        articleId={article.id}
        onOpenChange={setImportOpen}
        open={importOpen}
        trigger={null}
      />
      <BlogArticleEditDialog
        article={article}
        directoryOptions={directoryOptions}
        onOpenChange={setEditOpen}
        open={editOpen}
        trigger={null}
      />
      <BlogArticleMoveDialog
        article={article}
        directoryOptions={directoryOptions}
        onOpenChange={setMoveOpen}
        open={moveOpen}
        trigger={null}
      />
      <BlogArticleDeleteDialog
        article={article}
        directoryOptions={directoryOptions}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        trigger={null}
      />
    </>
  )
}
