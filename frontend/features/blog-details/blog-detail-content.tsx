import { MarkdownContent } from '@/components/markdown/markdown-content'
import { MarkdownMetadata } from '@/components/markdown/markdown-metadata'
import { parseFrontmatter } from '@/components/markdown/parse-frontmatter'
import { extractMarkdownHeadings } from '@/lib/markdown-headings'

import { BlogDetailTableOfContents } from './blog-detail-table-of-contents'
import { BlogDetailTableOfContentsRegistry } from './blog-detail-table-of-contents-store'

type BlogDetailContentProps = {
  title: string
  description: string
  children: string
}

export function BlogDetailContent({
  title,
  description,
  children
}: BlogDetailContentProps) {
  const { metadata, body: markdownBody } = parseFrontmatter(children)
  const displayMetadata = {
    ...metadata,
    title,
    description
  }
  const tableOfContentsItems = extractMarkdownHeadings(markdownBody)

  return (
    <article
      id='blog-detail-content'
      className='article-content min-w-0 max-w-full lg:pr-64 xl:pr-37 2xl:pr-0'
    >
      <BlogDetailTableOfContentsRegistry items={tableOfContentsItems} />
      <BlogDetailTableOfContents items={tableOfContentsItems} />
      <MarkdownMetadata metadata={displayMetadata} />
      <MarkdownContent>{markdownBody}</MarkdownContent>
    </article>
  )
}
