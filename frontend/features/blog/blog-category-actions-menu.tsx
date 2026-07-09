'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FolderInput, MoreHorizontal, Pencil } from 'lucide-react'
import { useState } from 'react'

import {
  BlogCategoryEditDialog,
  BlogCategoryMoveDialog
} from './blog-node-edit-dialog'
import type { BlogCategory, BlogDirectoryOption } from './blog-data'

type BlogCategoryActionsMenuProps = {
  category: BlogCategory
  directoryOptions: BlogDirectoryOption[]
}

export function BlogCategoryActionsMenu({
  category,
  directoryOptions
}: BlogCategoryActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label='目录操作'
            size='icon'
            type='button'
            variant='outline'
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-36'
        >
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className='size-4' />
            修改目录
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMoveOpen(true)}>
            <FolderInput className='size-4' />
            移动目录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BlogCategoryEditDialog
        category={category}
        directoryOptions={directoryOptions}
        onOpenChange={setEditOpen}
        open={editOpen}
        trigger={null}
      />
      <BlogCategoryMoveDialog
        category={category}
        directoryOptions={directoryOptions}
        onOpenChange={setMoveOpen}
        open={moveOpen}
        trigger={null}
      />
    </>
  )
}
