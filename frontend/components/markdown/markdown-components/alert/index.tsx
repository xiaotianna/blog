import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ComponentType,
  type ReactElement,
  type ReactNode
} from 'react'
import { type Components } from 'react-markdown'

import { cn } from '@/lib/utils'

import {
  MARKDOWN_ALERT_MARKER_PATTERN,
  MARKDOWN_ALERT_META,
  toMarkdownAlertType
} from './meta'

type ParagraphElement = ReactElement<{ children?: ReactNode }>

type BlockquoteProps = ComponentProps<
  Extract<NonNullable<Components['blockquote']>, ComponentType>
>

export function MarkdownBlockquote({
  children,
  className
}: BlockquoteProps) {
  const alert = getAlertBlockquote(children)

  if (!alert) {
    return (
      <blockquote
        className={cn(
          'p-3 text-sm before:content-none after:content-none [&>p]:leading-[1.5] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0',
          className
        )}
      >
        {children}
      </blockquote>
    )
  }

  const meta = MARKDOWN_ALERT_META[alert.type]
  const { Icon } = meta

  return (
    <div
      className={cn(
        'my-6 rounded-md border bg-(--ds-background-100) p-4 text-sm text-(--ds-gray-900)',
        meta.borderClassName,
        'before:content-none after:content-none',
        '[&>p]:my-3 [&>p]:leading-[1.6] [&>p:first-of-type]:mt-0 [&>p:last-child]:mb-0',
        '[&>ul]:my-3 [&>ol]:my-3 [&>pre]:my-3'
      )}
      role='note'
    >
      <div
        className={cn(
          'mb-2 flex items-center gap-2 font-semibold uppercase tracking-normal',
          meta.accentClassName
        )}
      >
        <Icon className='size-4 shrink-0' />
        <span>{meta.title}</span>
      </div>
      {alert.children}
    </div>
  )
}

function getAlertBlockquote(children: ReactNode) {
  const blockquoteChildren = Children.toArray(children)
  const firstParagraphIndex = blockquoteChildren.findIndex(isParagraphElement)

  if (firstParagraphIndex === -1) {
    return null
  }

  const firstParagraph = blockquoteChildren[firstParagraphIndex] as ParagraphElement
  const cleanedParagraph = removeAlertMarker(firstParagraph)

  if (!cleanedParagraph) {
    return null
  }

  const nextChildren = [...blockquoteChildren]

  if (cleanedParagraph.paragraph) {
    nextChildren[firstParagraphIndex] = cleanedParagraph.paragraph
  } else {
    nextChildren.splice(firstParagraphIndex, 1)
  }

  return {
    children: nextChildren,
    type: cleanedParagraph.type
  }
}

function removeAlertMarker(paragraph: ParagraphElement) {
  const paragraphChildren = Children.toArray(paragraph.props.children)
  const firstTextIndex = paragraphChildren.findIndex(
    (child) => typeof child === 'string'
  )

  if (firstTextIndex === -1) {
    return null
  }

  const firstText = paragraphChildren[firstTextIndex]

  if (typeof firstText !== 'string') {
    return null
  }

  const markerMatch = firstText.match(MARKDOWN_ALERT_MARKER_PATTERN)

  if (!markerMatch) {
    return null
  }

  const type = toMarkdownAlertType(markerMatch[1])

  if (!type) {
    return null
  }

  const nextText = firstText.slice(markerMatch[0].length)
  const nextParagraphChildren = [...paragraphChildren]

  if (nextText) {
    nextParagraphChildren[firstTextIndex] = nextText
  } else {
    nextParagraphChildren.splice(firstTextIndex, 1)
    removeLeadingLineBreak(nextParagraphChildren)
  }

  return {
    paragraph:
      nextParagraphChildren.length > 0
        ? cloneElement(paragraph, {
            children: nextParagraphChildren
          })
        : null,
    type
  }
}

function removeLeadingLineBreak(children: ReactNode[]) {
  const firstChild = children[0]

  if (typeof firstChild !== 'string') {
    return
  }

  const nextChild = firstChild.replace(/^\s*\r?\n/, '')

  if (nextChild) {
    children[0] = nextChild
  } else {
    children.shift()
  }
}

function isParagraphElement(node: ReactNode): node is ParagraphElement {
  return isValidElement(node) && node.type === 'p'
}
