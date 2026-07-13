import { MarkdownContent } from '@/components/markdown/markdown-content'
import { parseFrontmatter } from '@/components/markdown/parse-frontmatter'
import { extractMarkdownHeadings } from '@/lib/markdown-headings'
import { SearchArrivalHighlighter } from '@/features/search/search-arrival-highlighter'
import type { ReactNode } from 'react'

import { BlogDetailTableOfContents } from './blog-detail-table-of-contents'
import { BlogDetailTableOfContentsRegistry } from './blog-detail-table-of-contents-store'

type BlogDetailContentProps = {
  beforeScrollToTop?: ReactNode
  children: string
  header: ReactNode
}

export function BlogDetailContent({
  beforeScrollToTop,
  children,
  header
}: BlogDetailContentProps) {
  const { body: markdownBody } = parseFrontmatter(children)
  const tableOfContentsItems = extractMarkdownHeadings(markdownBody)

  return (
    <article
      id='blog-detail-content'
      className='article-content min-w-0 max-w-full lg:pr-64 xl:pr-37 2xl:pr-0 lg:pb-10'
    >
      <SearchArrivalHighlighter
        rootId='blog-detail-content'
      />
      <BlogDetailTableOfContentsRegistry items={tableOfContentsItems} />
      <BlogDetailTableOfContents
        beforeScrollToTop={beforeScrollToTop}
        items={tableOfContentsItems}
      />
      {header}
      <div data-search-field='content'>
        <MarkdownContent>{markdownBody}</MarkdownContent>
      </div>
    </article>
  )
}
