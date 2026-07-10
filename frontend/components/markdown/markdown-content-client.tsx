'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { ClientMarkdownComponents } from './markdown-components/client'
import { remarkCodeMeta } from './markdown-components/code/extension'

interface MarkdownContentClientProps {
  children: string
}

export const MarkdownContentClient = ({
  children
}: MarkdownContentClientProps) => {
  return (
    <ReactMarkdown
      components={ClientMarkdownComponents}
      remarkPlugins={[remarkGfm, remarkCodeMeta]}
    >
      {children}
    </ReactMarkdown>
  )
}
