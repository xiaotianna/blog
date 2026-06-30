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
    <div data-geist-code-block=''>
      {filename ? (
        <CodeBlockHeader
          code={children}
          filename={filename}
          language={language}
        />
      ) : null}
      <pre className='next-docs-code-pre'>
        <code
          className='grid text-left whitespace-pre break-normal text-[13px]! leading-5 font-mono hyphens-none text-(--ds-gray-1000)'
          style={{ fontFeatureSettings: '"liga" off' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
