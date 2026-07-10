'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { codeToHtml } from 'shiki'

import { cn } from '@/lib/utils'
import { getStringProperty } from '@/utils/get-string-property'

import { CodeTheme } from './code/extension/code-theme'
import { CodeBlockHeader } from './code/code-block-header'
import { codeBlockClassName, codeThemeVariables } from './code/code-block-styles'
import { type MarkdownComponentProps } from './shared'

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

export const ClientCode = ({
  className,
  children,
  node
}: MarkdownComponentProps<'code'>) => {
  const language = /language-(\w+)/.exec(className ?? '')?.[1]
  const meta = getStringProperty(node, 'data-meta')
  const value = getCodeValue(children)

  if (language || isCodeBlockNode(node)) {
    return (
      <ClientCodeBlock
        language={language ?? 'text'}
        meta={meta}
      >
        {value}
      </ClientCodeBlock>
    )
  }

  return <code className={cn('inline-block', className)}>{children}</code>
}

function ClientCodeBlock({
  children,
  language,
  meta
}: {
  children: string
  language: string
  meta?: string
}) {
  const filename = meta?.match(/filename="([^"]+)"/)?.[1]
  const highlightedHtml = useHighlightedCode(children, language)

  return (
    <div className='relative my-4 overflow-hidden rounded-md border border-(--ds-gray-400) bg-(--ds-background-100)'>
      <CodeBlockHeader
        code={children}
        filename={filename}
        language={language}
      />
      <pre
        className='m-0 overflow-x-auto bg-(--ds-background-100) py-5'
        style={codeThemeVariables}
      >
        <code
          className={codeBlockClassName}
          style={{ fontFeatureSettings: '"liga" off' }}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  )
}

function useHighlightedCode(code: string, language: string) {
  const [highlightedHtml, setHighlightedHtml] = useState(() =>
    escapeCodeHtml(code)
  )

  useEffect(() => {
    let active = true
    setHighlightedHtml(escapeCodeHtml(code))

    void codeToHtml(code.replace(/\n$/, ''), {
      lang: language || 'text',
      theme: CodeTheme
    })
      .then((highlighted) => {
        if (!active) return

        setHighlightedHtml(
          highlighted
            .replace(/^<pre[^>]*><code>/, '')
            .replace(/<\/code><\/pre>$/, '')
            .replaceAll('class="line"', 'class="line" data-line=""')
        )
      })
      .catch(() => {
        if (!active) return

        setHighlightedHtml(escapeCodeHtml(code))
      })

    return () => {
      active = false
    }
  }, [code, language])

  return highlightedHtml
}

function escapeCodeHtml(code: string) {
  return code
    .replace(/\n$/, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .map(
      (line) =>
        `<span class="line" data-line=""><span>${line || ' '}</span></span>`
    )
    .join('\n')
}
