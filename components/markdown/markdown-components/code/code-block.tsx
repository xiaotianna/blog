"use client"
import { CodeTheme } from '@/config/code-theme'
import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'
import { CodeBlockHeader } from './code-block-header'

type CodeBlockProps = {
  children: string
  language: string
  meta?: string
}

function parseCodeMeta(meta?: string) {
  return {
    filename: meta?.match(/filename="([^"]+)"/)?.[1]
  }
}

export function CodeBlock({ children, language, meta }: CodeBlockProps) {
  const [html, setHtml] = useState('')
  const { filename } = parseCodeMeta(meta)

  useEffect(() => {
    let mounted = true

    codeToHtml(children.replace(/\n$/, ''), {
      lang: language || 'text',
      theme: CodeTheme
    })
      .then((highlighted) => {
        if (!mounted) return

        const codeHtml = highlighted
          .replace(/^<pre[^>]*><code>/, '')
          .replace(/<\/code><\/pre>$/, '')
          .replaceAll('class="line"', 'class="line" data-line=""')

        setHtml(codeHtml)
      })
      .catch(() => {
        if (!mounted) return
        setHtml(
          children
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .split('\n')
            .map(
              (line) =>
                `<span class="line" data-line=""><span>${line || ' '}</span></span>`
            )
            .join('\n')
        )
      })

    return () => {
      mounted = false
    }
  }, [children, language])

  return (
    <div className='relative my-4 overflow-hidden rounded-md border border-(--ds-gray-400) bg-(--ds-background-100)'>
      {filename ? (
        <CodeBlockHeader
          code={children}
          filename={filename}
          language={language}
        />
      ) : null}
      <pre
        className='m-0 overflow-x-auto bg-(--ds-background-100) py-5'
        style={{
          '--shiki-color-text': 'var(--ds-gray-1000)',
          '--shiki-color-background': 'transparent',
          '--shiki-token-constant': 'var(--ds-blue-900)',
          '--shiki-token-string': 'var(--ds-green-900)',
          '--shiki-token-comment': 'var(--ds-gray-900)',
          '--shiki-token-keyword': 'var(--ds-pink-900)',
          '--shiki-token-parameter': 'var(--ds-amber-900)',
          '--shiki-token-function': 'var(--ds-purple-900)',
          '--shiki-token-string-expression': 'var(--ds-green-900)',
          '--shiki-token-punctuation': 'var(--ds-gray-1000)',
          '--shiki-token-link': 'var(--ds-green-900)',
        } as React.CSSProperties}
      >
        <code
          className='grid rounded-none border-0 bg-transparent p-0 text-left font-mono text-[13px]! leading-5 whitespace-pre text-(--ds-gray-1000) [font-variant-ligatures:none] break-normal hyphens-none [&_.highlighted-line]:relative [&_.highlighted-line]:min-h-5 [&_.highlighted-line]:bg-(--ds-blue-300) [&_.highlighted-line]:px-5 [&_.highlighted-line]:shadow-[inset_2px_0_0_0_var(--ds-blue-900)] [&_.highlighted-line>span]:inline-block [&_.line]:relative [&_.line]:min-h-5 [&_.line]:px-5 [&_.line>span]:inline-block [&_.line[data-active=true]]:bg-(--ds-amber-300) [&_.line[data-active=true]]:shadow-[inset_2px_0_0_0_var(--ds-amber-900)] [&_[data-added=true]]:bg-(--ds-green-300) [&_[data-added=true]]:shadow-[inset_2px_0_0_0_var(--ds-green-900)] [&_[data-highlighted=true]]:bg-(--ds-blue-300) [&_[data-highlighted=true]]:shadow-[inset_2px_0_0_0_var(--ds-blue-900)] [&_[data-removed=true]]:bg-(--ds-red-300) [&_[data-removed=true]]:shadow-[inset_2px_0_0_0_var(--ds-red-900)]'
          style={{ fontFeatureSettings: '"liga" off' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
