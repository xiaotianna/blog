import { getStringProperty } from '@/utils/get-string-property'
import { cn } from '@/lib/utils'
import { CodeBlock } from './code-block'

import { type MarkdownComponentProps } from '..'

export const Code = ({
  className,
  children,
  node
}: MarkdownComponentProps<'code'>) => {
  const language = /language-(\w+)/.exec(className ?? '')?.[1]
  const meta = getStringProperty(node, 'data-meta')
  const value = String(children)

  if (language) {
    return (
      <CodeBlock
        language={language}
        meta={meta}
      >
        {value}
      </CodeBlock>
    )
  }

  return <code className={cn('inline-block', className)}>{children}</code>
}
