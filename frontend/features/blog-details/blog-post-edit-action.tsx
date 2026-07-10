import { PermissionGate } from '@/components/server/permission-gate'
import { Button } from '@/components/ui/button'
import { FilePenLine } from 'lucide-react'
import Link from 'next/link'

type BlogPostEditActionProps = {
  articleId: string
}

export function BlogPostEditAction({ articleId }: BlogPostEditActionProps) {
  return (
    <PermissionGate>
      <Button
        asChild
        className='border-foreground/15 bg-background text-foreground hover:bg-muted dark:border-white/20 dark:bg-white/8 dark:text-white dark:hover:bg-white/12 max-sm:size-9 max-sm:px-0'
        variant='outline'
      >
        <Link
          aria-label='编辑正文'
          href={`/edit/${articleId}`}
        >
          <FilePenLine className='size-4' />
          <span className='max-sm:sr-only'>编辑正文</span>
        </Link>
      </Button>
    </PermissionGate>
  )
}
