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
import { FilePlus2, FolderPlus, Plus, X } from 'lucide-react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { useState, type ReactNode } from 'react'

import {
  BlogCreateArticleForm,
  BlogCreateCategoryForm
} from './blog-create-forms'
import {
  getDefaultDirectoryPath,
  ROOT_DIRECTORY_PATH,
  type BlogDirectoryPathOption
} from './blog-directory-paths'

type BlogCreateDialogProps = {
  activePath?: string
  directoryOptions?: BlogDirectoryPathOption[]
}

export function BlogCreateDialog({
  activePath,
  directoryOptions = []
}: BlogCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const options = directoryOptions
  const defaultDirectoryPath =
    getDefaultDirectoryPath(options, activePath) || ROOT_DIRECTORY_PATH
  const defaultArticleDirectoryPath = getDefaultDirectoryPath(
    options,
    activePath
  )
  const canCreateArticle = Boolean(defaultArticleDirectoryPath)

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          aria-label='新增'
          className='max-sm:size-9 max-sm:px-0'
          type='button'
        >
          <Plus className='size-4' />
          <span className='max-sm:sr-only'>新增</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className='flex max-h-[min(42rem,calc(100dvh-2rem))] w-[min(30rem,calc(100vw-2rem))] max-w-[min(30rem,calc(100vw-2rem))] flex-col gap-0 p-5 sm:max-w-[min(30rem,calc(100vw-2rem))]'
        showCloseButton={false}
      >
        <DialogHeader className='mb-5 flex-row items-start justify-between gap-3 space-y-0'>
          <div>
            <DialogTitle className='text-base font-semibold leading-normal'>
              新增内容
            </DialogTitle>
            <DialogDescription className='mt-1 text-sm text-muted-foreground'>
              {canCreateArticle
                ? '在当前路径下创建目录或文章草稿'
                : '在当前路径下创建目录'}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              aria-label='关闭新增内容'
            >
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        {canCreateArticle ? (
          <TabsPrimitive.Root
            className='min-h-0'
            defaultValue='category'
          >
            <TabsPrimitive.List
              aria-label='新增类型'
              className='mb-5 grid h-9 grid-cols-2 rounded-lg bg-muted p-1'
            >
              <BlogCreateTab value='category'>
                <FolderPlus className='size-4' />
                目录
              </BlogCreateTab>
              <BlogCreateTab value='article'>
                <FilePlus2 className='size-4' />
                文章
              </BlogCreateTab>
            </TabsPrimitive.List>

            <TabsPrimitive.Content
              className='outline-none'
              value='category'
            >
              <BlogCreateCategoryForm
                defaultDirectoryPath={defaultDirectoryPath}
                directoryOptions={options}
                onDone={() => setOpen(false)}
              />
            </TabsPrimitive.Content>
            <TabsPrimitive.Content
              className='outline-none'
              value='article'
            >
              <BlogCreateArticleForm
                defaultDirectoryPath={defaultArticleDirectoryPath}
                directoryOptions={options}
                onDone={() => setOpen(false)}
              />
            </TabsPrimitive.Content>
          </TabsPrimitive.Root>
        ) : (
          <BlogCreateCategoryForm
            defaultDirectoryPath={defaultDirectoryPath}
            directoryOptions={options}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function BlogCreateTab({
  children,
  value
}: {
  children: ReactNode
  value: string
}) {
  return (
    <TabsPrimitive.Trigger
      className='inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground outline-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:ring-2 focus-visible:ring-ring'
      value={value}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}
