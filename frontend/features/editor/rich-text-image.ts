'use client'

import type {
  JSONContent,
  MarkdownParseHelpers,
  MarkdownRendererHelpers,
  MarkdownToken
} from '@tiptap/core'
import { mergeAttributes, Node } from '@tiptap/core'

function escapeMarkdownImageText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/]/g, '\\]')
}

function escapeMarkdownImageUrl(value: string) {
  return value.replace(/\)/g, '\\)')
}

function escapeMarkdownImageTitle(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function getTokenImageAttrs(token: MarkdownToken) {
  const attrs = token as MarkdownToken & {
    href?: string
    text?: string
    title?: string | null
  }

  return {
    alt: attrs.text ?? '',
    src: attrs.href ?? '',
    title: attrs.title ?? null
  }
}

export const RichTextImage = Node.create({
  name: 'image',

  inline: true,
  group: 'inline',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('src')
      },
      alt: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('alt') ?? ''
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('title')
      }
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        class:
          'my-4 max-h-[32rem] max-w-full rounded-md border border-border object-contain'
      })
    ]
  },

  parseMarkdown: (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
    const attrs = getTokenImageAttrs(token)

    if (!attrs.src) {
      return []
    }

    return helpers.createNode('image', attrs)
  },

  renderMarkdown: (node: JSONContent, _h: MarkdownRendererHelpers) => {
    const src = String(node.attrs?.src ?? '')
    const alt = String(node.attrs?.alt ?? '')
    const title = String(node.attrs?.title ?? '')
    const image = `![${escapeMarkdownImageText(alt)}](${escapeMarkdownImageUrl(src)})`

    if (!title) {
      return image
    }

    return `${image.replace(/\)$/, '')} "${escapeMarkdownImageTitle(title)}")`
  }
})
