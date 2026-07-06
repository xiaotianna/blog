'use client'

import { CircleArrowUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import type { MarkdownHeadingItem } from '@/lib/markdown-headings'
import { cn } from '@/lib/utils'

type BlogDetailTableOfContentsProps = {
  items: MarkdownHeadingItem[]
}

type BlogDetailTableOfContentsContentProps = {
  className?: string
  headingClassName?: string
  items: MarkdownHeadingItem[]
  onNavigate?: () => void
  title?: string
}

const ARTICLE_SCROLL_OFFSET = 140

function getContentHeadings() {
  return document.querySelectorAll(
    '#blog-detail-content h2, #blog-detail-content h3'
  )
}

function getEncodedHash(title: string) {
  return encodeURIComponent(title)
}

function updateHash(title: string) {
  window.history.pushState(null, '', `#${getEncodedHash(title)}`)
}

function scrollToElement(
  element: Element,
  behavior: ScrollBehavior = 'auto'
) {
  window.scrollTo({
    top:
      window.scrollY +
      element.getBoundingClientRect().top -
      ARTICLE_SCROLL_OFFSET,
    behavior
  })
}

function getDecodedHashTitle() {
  try {
    return decodeURIComponent(window.location.hash.slice(1))
  } catch {
    return ''
  }
}

export function BlogDetailTableOfContents({
  items
}: BlogDetailTableOfContentsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <aside className='not-prose fixed right-6 top-32 z-40 hidden w-52 lg:block 2xl:left-[calc(50%+34rem)] 2xl:right-auto 2xl:w-56'>
      <BlogDetailTableOfContentsContent
        className='max-h-[calc(100vh-10rem)]'
        items={items}
      />
    </aside>
  )
}

export function BlogDetailTableOfContentsContent({
  className,
  headingClassName,
  items,
  onNavigate,
  title = 'On this page'
}: BlogDetailTableOfContentsContentProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const scrollToHeading = useCallback((headingIndex: number) => {
    const headings = getContentHeadings()
    const target = headings[headingIndex]

    if (!target) return

    scrollToElement(target)
  }, [])

  const handleHeadingClick = (item: MarkdownHeadingItem, index: number) => {
    setActiveIndex(index)
    updateHash(item.title)
    scrollToHeading(index)
    onNavigate?.()
  }

  const scrollToTop = () => {
    setActiveIndex(null)
    window.history.pushState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`
    )
    const content = document.getElementById('blog-detail-content')

    if (!content) return

    scrollToElement(content, 'smooth')
    onNavigate?.()
  }

  useEffect(() => {
    if (!window.location.hash) return

    const hashTitle = getDecodedHashTitle()
    const headingIndex = items.findIndex((item) => item.title === hashTitle)

    if (headingIndex === -1) return

    window.requestAnimationFrame(() => {
      setActiveIndex(headingIndex)
      scrollToHeading(headingIndex)
    })
  }, [items, scrollToHeading])

  useEffect(() => {
    let frameId: number | null = null

    const updateActiveHeading = () => {
      frameId = null

      const headings = Array.from(getContentHeadings())
      const nextActiveIndex = headings.reduce<number | null>(
        (currentIndex, heading, index) => {
          const top = heading.getBoundingClientRect().top

          return top <= ARTICLE_SCROLL_OFFSET ? index : currentIndex
        },
        null
      )

      setActiveIndex(nextActiveIndex)
    }

    const handleScroll = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateActiveHeading)
    }

    frameId = window.requestAnimationFrame(updateActiveHeading)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <nav
      aria-label='目录'
      className={cn('flex min-h-0 flex-col', className)}
    >
      {title ? (
        <p
          className={cn(
            'mb-4 shrink-0 text-sm font-semibold text-(--ds-gray-1000)',
            headingClassName
          )}
        >
          {title}
        </p>
      ) : null}
      <ol className='min-h-0 flex-1 space-y-3 overflow-y-auto pr-2'>
        {items.map((item, index) => {
          const isActive = activeIndex === index

          return (
            <li key={`${item.level}-${item.title}-${index}`}>
              <button
                type='button'
                aria-current={isActive ? 'true' : undefined}
                onClick={() => handleHeadingClick(item, index)}
                className={cn(
                  'block w-full cursor-pointer text-left text-sm leading-5 text-(--ds-gray-900) transition-colors hover:text-(--geist-link-color)',
                  item.level === 3 && 'pl-5',
                  isActive && 'text-(--geist-link-color)'
                )}
              >
                {item.title}
              </button>
            </li>
          )
        })}
      </ol>
      <div className='mt-8 shrink-0 border-t border-(--ds-gray-200) pt-5'>
        <button
          type='button'
          onClick={scrollToTop}
          className='flex cursor-pointer items-center gap-2 text-sm text-(--ds-gray-900) transition-colors hover:text-(--geist-link-color)'
        >
          Scroll to top
          <CircleArrowUp className='size-4' />
        </button>
      </div>
    </nav>
  )
}
