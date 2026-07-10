import { CodeTheme } from '@/components/markdown/markdown-components/code/extension/code-theme'
import { cache, use } from 'react'
import { codeToHtml } from 'shiki'
import { CodeBlockHeader } from './code-block-header'
import { codeBlockClassName, codeThemeVariables } from './code-block-styles'

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

const getCodeHtml = cache(async (children: string, language: string) => {
  return codeToHtml(children.replace(/\n$/, ''), {
    lang: language || 'text',
    theme: CodeTheme
  })
    .then((highlighted) => {
      const codeHtml = highlighted
        .replace(/^<pre[^>]*><code>/, '')
        .replace(/<\/code><\/pre>$/, '')
        .replaceAll('class="line"', 'class="line" data-line=""')

      return codeHtml
    })
    .catch(() => {
      return children
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split('\n')
        .map(
          (line) =>
            `<span class="line" data-line=""><span>${line || ' '}</span></span>`
        )
        .join('\n')
    })
})

export function CodeBlock({ children, language, meta }: CodeBlockProps) {
  const html = use(getCodeHtml(children, language))
  const { filename } = parseCodeMeta(meta)

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
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
