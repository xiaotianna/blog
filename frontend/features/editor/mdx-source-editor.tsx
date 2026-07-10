'use client'

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
  useActiveCode,
  type SandpackTheme
} from '@codesandbox/sandpack-react'
import { MarkdownContentClient } from '@/components/markdown/markdown-content-client'
import { useTheme } from 'next-themes'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react'

import { cn } from '@/lib/utils'

import { createMarkdownImage } from './editor-image-markdown'
import type { EditorCommandHandle } from './rich-text-editor'

type MdxSourceEditorProps = {
  content: string
  onChange: (content: string) => void
}

const CONTENT_FILE = '/content.mdx'

export const MdxSourceEditor = forwardRef<EditorCommandHandle, MdxSourceEditorProps>(
  function MdxSourceEditor({ content, onChange }, ref) {
    const { resolvedTheme } = useTheme()
    const initialContentRef = useRef(content)
    const sandpackTheme =
      resolvedTheme === 'dark' ? sandpackDarkTheme : sandpackLightTheme
    const files = useMemo(
      () => ({
        [CONTENT_FILE]: {
          active: true,
          code: initialContentRef.current
        }
      }),
      []
    )

    return (
      <SandpackProvider
        files={files}
        options={{
          activeFile: CONTENT_FILE,
          visibleFiles: [CONTENT_FILE]
        }}
        template='react'
        theme={sandpackTheme}
      >
        <SandpackMdxBody
          content={content}
          onChange={onChange}
          ref={ref}
        />
      </SandpackProvider>
    )
  }
)

const SandpackMdxBody = forwardRef<EditorCommandHandle, MdxSourceEditorProps>(
  function SandpackMdxBody({ content, onChange }, ref) {
    const { code, updateCode } = useActiveCode()
    const editorPaneRef = useRef<HTMLDivElement>(null)
    const historyRef = useRef<string[]>([content])
    const historyIndexRef = useRef(0)
    const isApplyingHistoryRef = useRef(false)
    const lastEmittedRef = useRef(content)
    const lastObservedCodeRef = useRef(code)
    const previewScrollRef = useRef<HTMLDivElement>(null)
    const scrollSyncLockRef = useRef<'editor' | 'preview' | null>(null)
    const scrollSyncUnlockTimerRef = useRef<number | null>(null)

    const currentCode = typeof code === 'string' ? code : content

    const emitChange = (nextContent: string) => {
      onChange(nextContent)
      lastEmittedRef.current = nextContent
    }

    const pushHistory = (nextContent: string) => {
      const current = historyRef.current[historyIndexRef.current]

      if (current === nextContent) {
        return
      }

      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
      historyRef.current.push(nextContent)
      historyIndexRef.current = historyRef.current.length - 1
    }

    useImperativeHandle(
      ref,
      () => ({
        canRedo: () => historyIndexRef.current < historyRef.current.length - 1,
        canUndo: () => historyIndexRef.current > 0,
        focus: () => {
          document
            .querySelector<HTMLElement>('.sp-code-editor textarea, .sp-code-editor .cm-content')
            ?.focus()
        },
        getContent: () => currentCode,
        insertImage: (image) => {
          const markdown = `\n\n${createMarkdownImage(image)}\n\n`
          const nextContent = insertTextAtActiveEditorSelection(currentCode, markdown)

          updateCode(nextContent)
          emitChange(nextContent)
          pushHistory(nextContent)

          return nextContent
        },
        redo: () => {
          if (historyIndexRef.current >= historyRef.current.length - 1) return
          historyIndexRef.current += 1
          isApplyingHistoryRef.current = true
          const nextContent = historyRef.current[historyIndexRef.current]
          updateCode(nextContent)
          emitChange(nextContent)
        },
        undo: () => {
          if (historyIndexRef.current <= 0) return
          historyIndexRef.current -= 1
          isApplyingHistoryRef.current = true
          const nextContent = historyRef.current[historyIndexRef.current]
          updateCode(nextContent)
          emitChange(nextContent)
        }
      }),
      [currentCode, onChange, updateCode]
    )

    useEffect(() => {
      if (typeof code !== 'string') return
      if (content === lastEmittedRef.current || code === content) {
        return
      }

      lastEmittedRef.current = content
      updateCode(content)
    }, [code, content, updateCode])

    useEffect(() => {
      if (typeof code !== 'string') return
      if (code === lastObservedCodeRef.current) return

      lastObservedCodeRef.current = code
      if (code === lastEmittedRef.current) {
        if (isApplyingHistoryRef.current) {
          isApplyingHistoryRef.current = false
        }
        return
      }

      emitChange(code)

      if (isApplyingHistoryRef.current) {
        isApplyingHistoryRef.current = false
        return
      }

      pushHistory(code)
    }, [code])

    useEffect(() => {
      let animationFrame = 0
      let editorScroller: HTMLElement | null = null
      let retryCount = 0

      const attachEditorScrollListener = () => {
        const previewScroller = previewScrollRef.current
        editorScroller = editorPaneRef.current?.querySelector<HTMLElement>('.cm-scroller') ?? null

        if (!editorScroller || !previewScroller) {
          retryCount += 1
          if (retryCount < 20) {
            animationFrame = window.requestAnimationFrame(attachEditorScrollListener)
          }
          return
        }

        editorScroller.addEventListener('scroll', handleEditorScroll, { passive: true })
      }

      const syncScroll = (
        source: HTMLElement,
        target: HTMLElement,
        sourceName: 'editor' | 'preview'
      ) => {
        if (scrollSyncLockRef.current && scrollSyncLockRef.current !== sourceName) {
          return
        }

        scrollSyncLockRef.current = sourceName
        target.scrollTop = getSyncedScrollTop(source, target)

        if (scrollSyncUnlockTimerRef.current !== null) {
          window.clearTimeout(scrollSyncUnlockTimerRef.current)
        }

        scrollSyncUnlockTimerRef.current = window.setTimeout(() => {
          scrollSyncLockRef.current = null
          scrollSyncUnlockTimerRef.current = null
        }, 80)
      }

      const handleEditorScroll = () => {
        const previewScroller = previewScrollRef.current

        if (!previewScroller || !editorScroller) {
          return
        }

        syncScroll(editorScroller, previewScroller, 'editor')
      }

      attachEditorScrollListener()

      return () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame)
        }
        editorScroller?.removeEventListener('scroll', handleEditorScroll)
        if (scrollSyncUnlockTimerRef.current !== null) {
          window.clearTimeout(scrollSyncUnlockTimerRef.current)
          scrollSyncUnlockTimerRef.current = null
        }
      }
    }, [])

    const handlePreviewScroll = () => {
      const editorScroller = editorPaneRef.current?.querySelector<HTMLElement>('.cm-scroller')
      const previewScroller = previewScrollRef.current

      if (!editorScroller || !previewScroller) {
        return
      }

      if (scrollSyncLockRef.current && scrollSyncLockRef.current !== 'preview') {
        return
      }

      scrollSyncLockRef.current = 'preview'
      editorScroller.scrollTop = getSyncedScrollTop(previewScroller, editorScroller)

      if (scrollSyncUnlockTimerRef.current !== null) {
        window.clearTimeout(scrollSyncUnlockTimerRef.current)
      }

      scrollSyncUnlockTimerRef.current = window.setTimeout(() => {
        scrollSyncLockRef.current = null
        scrollSyncUnlockTimerRef.current = null
      }, 80)
    }

    return (
      <div className='h-[calc(100dvh-3.5rem)] min-h-0 bg-background p-4 max-md:h-auto'>
        <SandpackLayout className='!grid !h-full !min-h-0 !grid-cols-2 !overflow-hidden !rounded-lg !border !border-border !bg-background max-md:!min-h-[calc(100dvh-8rem)] max-md:!grid-cols-1'>
          <div
            className='min-h-0 border-r border-border max-md:min-h-[50dvh] max-md:border-r-0 max-md:border-b'
            ref={editorPaneRef}
          >
            <SandpackCodeEditor
              className={cn(
                '!h-full !bg-background',
                '[&_.cm-editor]:!h-full [&_.cm-scroller]:!font-mono max-md:[&_.cm-content]:pb-20'
              )}
              closableTabs={false}
              readOnly={false}
              showLineNumbers
              showTabs={false}
              wrapContent
            />
          </div>
          <div
            className='min-h-0 flex-1 overflow-auto bg-background p-6 max-md:min-h-[50dvh] max-md:p-4'
            onScroll={handlePreviewScroll}
            ref={previewScrollRef}
          >
            <article className='article-content min-h-full'>
              <MarkdownContentClient>
                {stripMdxRuntimeOnlyBlocks(currentCode)}
              </MarkdownContentClient>
            </article>
          </div>
        </SandpackLayout>
      </div>
    )
  }
)

function insertTextAtActiveEditorSelection(content: string, text: string) {
  const activeElement = document.activeElement

  if (
    activeElement instanceof HTMLTextAreaElement &&
    activeElement.closest('.sp-code-editor')
  ) {
    const start = activeElement.selectionStart
    const end = activeElement.selectionEnd

    return `${content.slice(0, start)}${text}${content.slice(end)}`
  }

  return `${content}${text}`
}

function getSyncedScrollTop(source: HTMLElement, target: HTMLElement) {
  const sourceRange = source.scrollHeight - source.clientHeight
  const targetRange = target.scrollHeight - target.clientHeight

  if (sourceRange <= 0 || targetRange <= 0) {
    return 0
  }

  return (source.scrollTop / sourceRange) * targetRange
}

const sandpackBaseTheme = {
  font: {
    body: 'var(--font-geist-sans)',
    mono: 'var(--font-mono)',
    size: '14px',
    lineHeight: '1.7'
  },
  syntax: {
    plain: 'var(--ds-gray-1000)',
    comment: 'var(--ds-gray-900)',
    keyword: 'var(--ds-pink-900)',
    definition: 'var(--ds-purple-900)',
    punctuation: 'var(--ds-gray-1000)',
    property: 'var(--ds-blue-900)',
    tag: 'var(--ds-blue-900)',
    static: 'var(--ds-amber-900)',
    string: 'var(--ds-green-900)'
  }
} satisfies Pick<SandpackTheme, 'font' | 'syntax'>

const sandpackLightTheme = {
  ...sandpackBaseTheme,
  colors: {
    surface1: 'var(--background)',
    surface2: 'var(--card)',
    surface3: 'var(--muted)',
    disabled: 'var(--muted-foreground)',
    base: 'var(--foreground)',
    clickable: 'var(--foreground)',
    hover: 'var(--muted)',
    accent: 'var(--foreground)',
    error: 'var(--destructive)',
    errorSurface: 'color-mix(in oklch, var(--destructive), transparent 88%)',
    warning: 'var(--ds-amber-900)',
    warningSurface: 'var(--ds-amber-300)'
  }
} satisfies SandpackTheme

const sandpackDarkTheme = {
  ...sandpackBaseTheme,
  colors: {
    surface1: 'var(--background)',
    surface2: 'var(--card)',
    surface3: 'var(--muted)',
    disabled: 'var(--muted-foreground)',
    base: 'var(--foreground)',
    clickable: 'var(--foreground)',
    hover: 'var(--muted)',
    accent: 'var(--foreground)',
    error: 'var(--destructive)',
    errorSurface: 'color-mix(in oklch, var(--destructive), transparent 82%)',
    warning: 'var(--ds-amber-900)',
    warningSurface: 'var(--ds-amber-300)'
  }
} satisfies SandpackTheme

function stripMdxRuntimeOnlyBlocks(content: string) {
  let fence: string | null = null

  return content
    .split('\n')
    .filter((line) => {
      const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})/)

      if (fenceMatch) {
        const marker = fenceMatch[2][0]

        if (!fence) {
          fence = marker
        } else if (fence === marker) {
          fence = null
        }

        return true
      }

      if (fence) {
        return true
      }

      return !/^\s*(import|export)\s.+$/.test(line)
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
