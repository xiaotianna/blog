import { MarkdownContent } from './markdown-content'
import { MarkdownMetadata } from './markdown-metadata'
import { parseFrontmatter } from './parse-frontmatter'

interface MarkdownRenderProps {
  children: string
}

export const MarkdownRender = ({ children }: MarkdownRenderProps) => {
  const { metadata, body: markdownBody } = parseFrontmatter(children)

  return (
    <>
      <MarkdownMetadata metadata={metadata} />
      <MarkdownContent>{markdownBody}</MarkdownContent>
    </>
  )
}
