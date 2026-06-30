import ReactMarkdown from "react-markdown"
import { MarkdownComponents } from "./markdown-components"
import { remarkCodeMeta } from "./markdown-components/code/extension"
import remarkGfm from "remark-gfm"

interface MarkdownContentProps {
  children: string
}

export const MarkdownContent = ({ children }: MarkdownContentProps) => {
  return (
    <ReactMarkdown
      components={MarkdownComponents}
      remarkPlugins={[remarkGfm, remarkCodeMeta]}
    >
      {children}
    </ReactMarkdown>
  )
}
