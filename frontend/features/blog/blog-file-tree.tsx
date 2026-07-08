import BlurFade from '@/components/magicui/blur-fade'

import type { BlogTreeNode } from './blog-data'
import { BlogFileTreeAction } from './blog-file-tree-action'
import { BlogFileTreeContent } from './blog-file-tree-content'

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
      <aside className='h-fit lg:sticky lg:top-24'>
        <BlogFileTreeContent
          activeFolderId={activeFolderId}
          idPrefix='blog-desktop-tree'
          tree={tree}
        >
          <BlogFileTreeAction />
        </BlogFileTreeContent>
      </aside>
    </BlurFade>
  )
}
