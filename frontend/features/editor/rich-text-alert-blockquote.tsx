import {
  mergeAttributes,
  Node,
  wrappingInputRule,
  type JSONContent,
  type MarkdownParseHelpers,
  type MarkdownRendererHelpers,
  type MarkdownToken
} from '@tiptap/core'
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps
} from '@tiptap/react'
import { ChevronDown } from 'lucide-react'

import {
  MARKDOWN_ALERT_MARKER_PATTERN,
  MARKDOWN_ALERT_META,
  type MarkdownAlertType,
  toMarkdownAlertType
} from '@/components/markdown/markdown-components/alert/meta'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const ALERT_TYPE_OPTIONS: MarkdownAlertType[] = [
  'note',
  'tip',
  'important',
  'warning',
  'caution'
]

const inputRegex = /^\s*>\s$/

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockQuote: {
      setBlockquote: () => ReturnType
      toggleBlockquote: () => ReturnType
      unsetBlockquote: () => ReturnType
    }
  }
}

export const RichTextAlertBlockquote = Node.create({
  name: 'blockquote',

  content: 'block+',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      alertType: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          toMarkdownAlertType(element.getAttribute('data-alert-type') ?? ''),
        rendered: false
      }
    }
  },

  parseHTML() {
    return [{ tag: 'blockquote' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const alertType = toMarkdownAlertType(String(node.attrs.alertType ?? ''))

    return [
      'blockquote',
      mergeAttributes(HTMLAttributes, {
        class: getBlockquoteClassName(alertType),
        ...(alertType && { 'data-alert-type': alertType })
      }),
      0
    ]
  },

  parseMarkdown: (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
    const parseBlockChildren = helpers.parseBlockChildren ?? helpers.parseChildren
    const children = parseBlockChildren(token.tokens || [])
    const alertType = removeAlertMarkerFromContent(children)

    return helpers.createNode(
      'blockquote',
      alertType ? { alertType } : undefined,
      children
    )
  },

  renderMarkdown: (node: JSONContent, h: MarkdownRendererHelpers) => {
    if (!node.content) {
      return ''
    }

    const alertType = toMarkdownAlertType(String(node.attrs?.alertType ?? ''))
    const renderedChildren = node.content.map(
      (child, index) =>
        h.renderChild?.(child, index) ?? h.renderChildren([child])
    )
    const prefix = '>'
    const renderedBlockquoteContent = renderedChildren
      .map((content) =>
        content
          .split('\n')
          .map((line) => (line.trim() ? `${prefix} ${line}` : prefix))
          .join('\n')
      )
      .join(`\n${prefix}\n`)

    if (!alertType) {
      return renderedBlockquoteContent
    }

    const marker = `${prefix} [!${MARKDOWN_ALERT_META[alertType].marker}]`

    return renderedBlockquoteContent
      ? `${marker}\n${renderedBlockquoteContent}`
      : marker
  },

  addCommands() {
    return {
      setBlockquote:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
      toggleBlockquote:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
      unsetBlockquote:
        () =>
        ({ commands }) =>
          commands.lift(this.name)
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote()
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type
      })
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(RichTextAlertBlockquoteView)
  }
})

function RichTextAlertBlockquoteView({
  node,
  updateAttributes
}: NodeViewProps) {
  const alertType = toMarkdownAlertType(String(node.attrs.alertType ?? ''))

  if (!alertType) {
    return (
      <NodeViewWrapper
        as='blockquote'
        className='p-3 text-sm before:content-none after:content-none [&>p]:leading-[1.5] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0'
      >
        <NodeViewContent />
      </NodeViewWrapper>
    )
  }

  const meta = MARKDOWN_ALERT_META[alertType]
  const { Icon } = meta
  const handleAlertTypeChange = (value: string) => {
    const nextType = toMarkdownAlertType(value)

    if (!nextType) return

    updateAttributes({ alertType: nextType })
  }

  return (
    <NodeViewWrapper
      as='blockquote'
      className={getBlockquoteClassName(alertType)}
      data-alert-type={alertType}
    >
      <div className='mb-2 flex items-center justify-between gap-3'>
        <div
          className={cn(
            'flex items-center gap-2 font-semibold uppercase tracking-normal',
            meta.accentClassName
          )}
          contentEditable={false}
        >
          <Icon className='size-4 shrink-0' />
          <span>{meta.title}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label='切换警报类型'
              className='inline-flex h-7 items-center gap-1 rounded-md border border-(--ds-gray-300) bg-(--ds-background-100) px-2 text-xs font-medium text-(--ds-gray-900) outline-none transition-colors hover:border-(--ds-gray-600) hover:bg-(--ds-background-200) focus-visible:border-(--ds-blue-700)'
              contentEditable={false}
              type='button'
            >
              {meta.marker}
              <ChevronDown className='size-3.5' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-40'
          >
            <DropdownMenuRadioGroup
              onValueChange={handleAlertTypeChange}
              value={alertType}
            >
              {ALERT_TYPE_OPTIONS.map((type) => (
                <DropdownMenuRadioItem
                  key={type}
                  value={type}
                >
                  {MARKDOWN_ALERT_META[type].marker}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  )
}

function getBlockquoteClassName(alertType: MarkdownAlertType | null) {
  if (!alertType) {
    return 'p-3 text-sm before:content-none after:content-none [&>p]:leading-[1.5] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0'
  }

  const meta = MARKDOWN_ALERT_META[alertType]

  return cn(
    'my-6 rounded-md border bg-(--ds-background-100) p-4 text-sm text-(--ds-gray-900) not-italic',
    meta.borderClassName,
    'before:content-none after:content-none',
    '[&>p]:my-3 [&>p]:leading-[1.6] [&>p:first-of-type]:mt-0 [&>p:last-child]:mb-0',
    '[&>ul]:my-3 [&>ol]:my-3 [&>pre]:my-3'
  )
}

function removeAlertMarkerFromContent(content: JSONContent[]) {
  const firstBlockIndex = content.findIndex((child) => child.type === 'paragraph')

  if (firstBlockIndex === -1) {
    return null
  }

  const firstBlock = content[firstBlockIndex]
  const firstTextIndex =
    firstBlock.content?.findIndex((child) => child.type === 'text') ?? -1

  if (firstTextIndex === -1) {
    return null
  }

  const firstText = firstBlock.content?.[firstTextIndex]
  const markerMatch = firstText?.text?.match(MARKDOWN_ALERT_MARKER_PATTERN)

  if (!markerMatch) {
    return null
  }

  const alertType = toMarkdownAlertType(markerMatch[1])

  if (!alertType) {
    return null
  }

  const nextText = firstText?.text?.slice(markerMatch[0].length) ?? ''
  const nextInlineContent = [...(firstBlock.content ?? [])]

  if (nextText) {
    nextInlineContent[firstTextIndex] = {
      ...firstText,
      text: nextText
    }
  } else {
    nextInlineContent.splice(firstTextIndex, 1)
  }

  if (nextInlineContent.length > 0) {
    content[firstBlockIndex] = {
      ...firstBlock,
      content: nextInlineContent
    }
  } else if (content.length > 1) {
    content.splice(firstBlockIndex, 1)
  } else {
    content[firstBlockIndex] = {
      ...firstBlock,
      content: []
    }
  }

  return alertType
}
