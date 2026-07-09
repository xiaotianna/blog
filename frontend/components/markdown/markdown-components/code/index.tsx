import { getStringProperty } from '@/utils/get-string-property'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'
import { CodeBlock } from './code-block'

import { type MarkdownComponentProps } from '..'

function getCodeValue(children: ReactNode): string {
  if (children === undefined || children === null) return ''
  if (Array.isArray(children)) return children.map(getCodeValue).join('')

  return String(children)
}

function isCodeBlockNode(node: unknown) {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'properties' in node &&
      (node as { properties?: Record<string, unknown> }).properties?.[
        'data-code-block'
      ]
  )
}

export const Code = ({
  className,
  children,
  node
}: MarkdownComponentProps<'code'>) => {
  const language = /language-(\w+)/.exec(className ?? '')?.[1]
  const meta = getStringProperty(node, 'data-meta')
  const value = getCodeValue(children)

  if (language || isCodeBlockNode(node)) {
    return (
      <CodeBlock
        language={language ?? 'text'}
        meta={meta}
      >
        {value}
      </CodeBlock>
    )
  }

  return <code className={cn('inline-block', className)}>{children}</code>
}
