import BlurFade from '@/components/magicui/blur-fade'

import type { BlogTreeNode } from './blog-data'
import { BlogFileTreeAction } from './blog-file-tree-action'
import { BlogFileTreeContent } from './blog-file-tree-content'
import { BlogFileTreeShell } from './blog-file-tree-shell'

type BlogFileTreeProps = {
  activeFolderId?: string
  delay: number
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
      <BlogFileTreeShell>
        <BlogFileTreeContent
          activeFolderId={activeFolderId}
          className='h-full max-h-full min-h-0 overflow-hidden'
          idPrefix='blog-desktop-tree'
          tree={tree}
        >
          <BlogFileTreeAction />
        </BlogFileTreeContent>
      </BlogFileTreeShell>
    </BlurFade>
  )
}
