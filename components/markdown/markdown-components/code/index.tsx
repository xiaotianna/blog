import { getStringProperty } from '@/utils/get-string-property'
import { cn } from '@/lib/utils'
import { CodeBlock } from './code-block'

interface CodeProps {
  className?: string
  children?: React.ReactNode
  node?: unknown
}

export const Code = ({ className, children, node }: CodeProps) => {
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
