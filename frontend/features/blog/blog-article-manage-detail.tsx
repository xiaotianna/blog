import { PermissionGate } from '@/components/server/permission-gate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, FileText, Folder, Lock, Newspaper } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import {
  BlogArticleEditDialog,
  BlogArticleMoveDialog
} from './blog-node-edit-dialog'
import type {
  ArticleStatus,
  BlogArticleDetail,
  BlogDirectoryOption
} from './blog-data'

type BlogArticleManageDetailProps = {
  article: BlogArticleDetail
  directoryOptions: BlogDirectoryOption[]
}

const ARTICLE_STATUS_LABEL: Record<ArticleStatus, string> = {
  publish: '已发布',
  private: '私密',
  draft: '草稿'
}

export function BlogArticleManageDetail({
  article,
  directoryOptions
}: BlogArticleManageDetailProps) {
  const category = directoryOptions.find(
    (option) => option.id === article.categoryId
  )

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-5xl flex-col px-6 pb-0 lg:min-h-0 lg:px-0'>
      <section className='min-h-0 flex-1'>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
            <div className='min-w-0 flex-1'>
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <Badge
                  className='gap-1.5'
                  variant='outline'
                >
                  <FileText className='size-3.5' />
                  文章
                </Badge>
                <ArticleStatusBadge status={article.status} />
              </div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {article.title}
              </h1>
              {article.description ? (
                <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
                  {article.description}
                </p>
              ) : null}
            </div>

            <div className='flex shrink-0 flex-wrap gap-2'>
              <Button
                asChild
                variant='outline'
              >
                <Link href={`/post/${article.path}`}>
                  <ArrowUpRight className='size-4' />
                  阅读正文
                </Link>
              </Button>
              <PermissionGate>
                <BlogArticleEditDialog
                  article={article}
                  directoryOptions={directoryOptions}
                />
                <BlogArticleMoveDialog
                  article={article}
                  directoryOptions={directoryOptions}
                />
              </PermissionGate>
            </div>
          </div>

          <div className='grid gap-3 border-y border-border py-5 sm:grid-cols-3'>
            <ArticleMetaItem
              icon={<Newspaper className='size-4' />}
              label='访问路径'
              value={`/blog/${article.path}`}
            />
            <ArticleMetaItem
              icon={<Folder className='size-4' />}
              label='所属目录'
              value={category?.label ?? '未匹配目录'}
            />
            <ArticleMetaItem
              icon={<Lock className='size-4' />}
              label='阅读入口'
              value={`/post/${article.path}`}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const variant = status === 'publish' ? 'secondary' : 'outline'

  return (
    <Badge variant={variant}>
      {ARTICLE_STATUS_LABEL[status] ?? status}
    </Badge>
  )
}

function ArticleMetaItem({
  icon,
  label,
  value
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className='min-w-0'>
      <div className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
        {icon}
        {label}
      </div>
      <p className='truncate text-sm text-foreground'>{value}</p>
    </div>
  )
}
