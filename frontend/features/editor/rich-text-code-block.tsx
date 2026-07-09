'use client'

import { CopyCodeButton } from '@/components/markdown/markdown-components/code/copy-code-button'
import { CodeTheme } from '@/components/markdown/markdown-components/code/extension/code-theme'
import { LanguageIcon } from '@/components/markdown/markdown-components/code/language/language-icon'
import type {
  JSONContent,
  MarkdownParseHelpers,
  MarkdownRendererHelpers,
  MarkdownToken
} from '@tiptap/core'
import CodeBlock from '@tiptap/extension-code-block'
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps
} from '@tiptap/react'
import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { codeToHtml } from 'shiki'

function parseFenceInfo(info?: string | null) {
  const value = info?.trim() ?? ''

  if (!value) {
    return { language: null, meta: null }
  }

  const match = value.match(/^(\S+)(?:\s+([\s\S]+))?$/)

  return {
    language: match?.[1] ?? null,
    meta: match?.[2]?.trim() || null
  }
}

function getFenceInfo(language?: string | null, meta?: string | null) {
  const fallbackLanguage = meta ? 'text' : ''

  return [language || fallbackLanguage, meta].filter(Boolean).join(' ')
}

function parseCodeMeta(meta?: string | null) {
  return {
    filename: meta?.match(/filename="([^"]+)"/)?.[1]
  }
}

function escapeMetaValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function setMetaFilename(meta: string | null, filename: string) {
  const nextFilename = filename.trim()
  const nextMeta = (meta ?? '')
    .replace(/\s*filename="(?:\\"|[^"])*"/, '')
    .trim()

  if (!nextFilename) {
    return nextMeta || ''
  }

  return [nextMeta, `filename="${escapeMetaValue(nextFilename)}"`]
    .filter(Boolean)
    .join(' ')
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

function useHighlightedCode(code: string, language?: string | null) {
  const highlightKey = `${language || 'text'}\0${code}`
  const [highlighted, setHighlighted] = useState(() => ({
    html: escapeCodeHtml(code),
    key: highlightKey
  }))

  useEffect(() => {
    let active = true

    void codeToHtml(code.replace(/\n$/, ''), {
      lang: language || 'text',
      theme: CodeTheme
    })
      .then((highlighted) => {
        if (!active) return

        setHighlighted({
          html: highlighted
            .replace(/^<pre[^>]*><code>/, '')
            .replace(/<\/code><\/pre>$/, '')
            .replaceAll('class="line"', 'class="line" data-line=""'),
          key: highlightKey
        })
      })
      .catch(() => {
        if (!active) return

        setHighlighted({
          html: escapeCodeHtml(code),
          key: highlightKey
        })
      })

    return () => {
      active = false
    }
  }, [code, highlightKey, language])

  return highlighted.key === highlightKey ? highlighted.html : escapeCodeHtml(code)
}

const codeThemeVariables = {
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
  '--shiki-token-link': 'var(--ds-green-900)'
} as CSSProperties

function RichTextCodeBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const language = (node.attrs.language as string | null) || ''
  const meta = (node.attrs.meta as string | null) || ''
  const code = node.textContent
  const highlightedHtml = useHighlightedCode(code, language)
  const { filename } = parseCodeMeta(meta)
  const commitAttributes = (attributes: Record<string, string>) => {
    updateAttributes(attributes)
  }
  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }

  return (
    <NodeViewWrapper
      as='div'
      className='rich-code-block relative my-4 overflow-hidden rounded-md border border-(--ds-gray-400) bg-(--ds-background-100)'
    >
      <div
        className='flex h-12 items-center rounded-t-md border-b border-(--ds-gray-400) bg-(--ds-background-200) pr-3 pl-4'
        contentEditable={false}
      >
        <div className='mr-auto flex min-w-0 items-center gap-2 text-[13px] text-(--ds-gray-900)'>
          <span
            aria-hidden='true'
            className='inline-flex size-4 shrink-0 items-center justify-center text-(--ds-gray-900)'
          >
            <LanguageIcon
              filename={filename}
              language={language || 'text'}
            />
          </span>
          <input
            aria-label='Code language'
            className='h-8 w-24 min-w-0 rounded-[5px] border-0 bg-transparent px-1 font-mono text-[13px] text-(--ds-gray-900) outline-none transition-colors placeholder:text-(--ds-gray-600) hover:bg-(--ds-gray-alpha-200) focus:bg-(--ds-gray-alpha-200)'
            onChange={(event) =>
              commitAttributes({ language: event.currentTarget.value.trim() })
            }
            onClick={(event) => event.stopPropagation()}
            onKeyDown={handleHeaderKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
            placeholder='text'
            spellCheck={false}
            value={language}
          />
        </div>
        <div className='flex min-w-0 items-center gap-2 self-stretch'>
          <input
            aria-label='Code filename'
            className='h-8 w-48 min-w-0 rounded-[5px] border-0 bg-transparent px-1 text-right font-mono text-[13px] text-(--ds-gray-900) outline-none transition-colors placeholder:text-(--ds-gray-600) hover:bg-(--ds-gray-alpha-200) focus:bg-(--ds-gray-alpha-200)'
            onChange={(event) =>
              commitAttributes({
                meta: setMetaFilename(meta, event.currentTarget.value)
              })
            }
            onClick={(event) => event.stopPropagation()}
            onKeyDown={handleHeaderKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
            placeholder='filename'
            spellCheck={false}
            value={filename ?? ''}
          />
          <CopyCodeButton code={code} />
        </div>
      </div>
      <pre
        className='rich-code-block-pre relative m-0 overflow-x-auto bg-(--ds-background-100) py-5'
        style={codeThemeVariables}
      >
        <code
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 top-5 z-0 grid rounded-none border-0 bg-transparent p-0 text-left font-mono text-[13px]! leading-5 whitespace-pre text-(--ds-gray-1000) [font-variant-ligatures:none] break-normal hyphens-none [&_.line]:relative [&_.line]:min-h-5 [&_.line]:px-5 [&_.line>span]:inline-block'
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <NodeViewContent<'code'>
          as='code'
          className='relative z-10 block min-h-5 rounded-none border-0 bg-transparent px-5 py-0 text-left font-mono text-[13px]! leading-5 whitespace-pre text-transparent caret-(--ds-gray-1000) [font-variant-ligatures:none] break-normal hyphens-none selection:bg-(--ds-blue-300) selection:text-transparent'
        />
      </pre>
    </NodeViewWrapper>
  )
}

export const RichTextCodeBlock = CodeBlock.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      meta: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-meta'),
        rendered: false
      }
    }
  },

  parseMarkdown: (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
    if (
      token.raw?.startsWith('```') === false &&
      token.raw?.startsWith('~~~') === false &&
      token.codeBlockStyle !== 'indented'
    ) {
      return []
    }

    const { language, meta } = parseFenceInfo(token.lang)

    return helpers.createNode(
      'codeBlock',
      { language, meta },
      token.text ? [helpers.createTextNode(token.text)] : []
    )
  },

  renderMarkdown: (node: JSONContent, h: MarkdownRendererHelpers) => {
    const info = getFenceInfo(node.attrs?.language, node.attrs?.meta)

    if (!node.content) {
      return `\`\`\`${info}\n\n\`\`\``
    }

    return [`\`\`\`${info}`, h.renderChildren(node.content), '```'].join('\n')
  },

  addNodeView() {
    return ReactNodeViewRenderer(RichTextCodeBlockView)
  }
})
