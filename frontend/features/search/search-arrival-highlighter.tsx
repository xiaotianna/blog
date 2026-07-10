'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import type { SearchHighlightField } from './search-types'

const HIGHLIGHT_QUERY_LIMIT = 100
const HIGHLIGHT_DELAY = 80
const HIGHLIGHT_DURATION = 2800
const HIGHLIGHT_MAX_AGE = 15_000
const HIGHLIGHT_STORAGE_KEY = 'blog-search-arrival-highlight'
const SEARCH_HIGHLIGHT_NAME = 'search-arrival-highlight'
const HIGHLIGHT_FIELDS = new Set<SearchHighlightField>([
  'title',
  'description',
  'tag',
  'content'
])

type SearchHighlightPayload = {
  createdAt: number
  field: SearchHighlightField
  hint?: string
  path: string
  query: string
}

type ActiveHighlight = {
  element: HTMLElement
  restore: () => void
}

type LocatedHighlight = {
  activate: () => ActiveHighlight | null
  element: HTMLElement
  getRect: () => DOMRect
  scrollIntoView: (behavior: ScrollBehavior) => void
}

type HighlightRegistryLike = {
  delete: (name: string) => boolean
  set: (name: string, highlight: unknown) => void
}

type HighlightConstructor = new (...ranges: Range[]) => unknown

let memoryHighlight: SearchHighlightPayload | null = null

export function queueSearchHighlight({
  field,
  hint,
  path,
  query
}: {
  field: SearchHighlightField
  hint?: string
  path: string
  query: string
}) {
  const normalizedQuery = normalizeQuery(query)
  if (!normalizedQuery) return

  const payload: SearchHighlightPayload = {
    createdAt: Date.now(),
    field,
    hint: hint?.trim() || undefined,
    path: normalizePath(path),
    query: normalizedQuery
  }

  memoryHighlight = payload
  try {
    window.sessionStorage.setItem(
      HIGHLIGHT_STORAGE_KEY,
      JSON.stringify(payload)
    )
  } catch {
    // The in-memory value keeps same-tab navigation working when storage is blocked.
  }
}

export function SearchArrivalHighlighter({ rootId }: { rootId: string }) {
  const pathname = usePathname()

  useEffect(() => {
    const payload = readSearchHighlight(pathname)
    if (!payload) return

    let activeHighlight: ActiveHighlight | null = null
    let cleanupTimer: number | undefined
    let visibilityCleanup: (() => void) | undefined
    const locateTimer = window.setTimeout(() => {
      const root = document.getElementById(rootId)
      if (!root) return
      clearSearchHighlight()

      const locatedHighlight = locateFirstMatch(
        root,
        payload.query,
        payload.field,
        payload.hint
      )
      if (!locatedHighlight) return

      if (!isRectInViewport(locatedHighlight.getRect())) {
        locatedHighlight.scrollIntoView(
          prefersReducedMotion() ? 'auto' : 'smooth'
        )
      }
      visibilityCleanup = activateWhenVisible(
        locatedHighlight.getRect,
        () => locatedHighlight.scrollIntoView('auto'),
        () => {
          activeHighlight = locatedHighlight.activate()
          if (!activeHighlight) return

          cleanupTimer = window.setTimeout(() => {
            activeHighlight?.restore()
            activeHighlight = null
          }, HIGHLIGHT_DURATION)
        }
      )
    }, HIGHLIGHT_DELAY)

    return () => {
      window.clearTimeout(locateTimer)
      if (cleanupTimer) window.clearTimeout(cleanupTimer)
      visibilityCleanup?.()
      activeHighlight?.restore()
    }
  }, [pathname, rootId])

  return null
}

function readSearchHighlight(pathname: string) {
  let payload = memoryHighlight

  try {
    const storedValue = window.sessionStorage.getItem(HIGHLIGHT_STORAGE_KEY)
    if (storedValue) payload = JSON.parse(storedValue) as SearchHighlightPayload
  } catch {
    // Fall back to the in-memory value.
  }

  if (
    !isSearchHighlightPayload(payload) ||
    Date.now() - payload.createdAt > HIGHLIGHT_MAX_AGE ||
    normalizePath(pathname) !== normalizePath(payload.path)
  ) {
    clearSearchHighlight()
    return null
  }

  return payload
}

function clearSearchHighlight() {
  memoryHighlight = null
  try {
    window.sessionStorage.removeItem(HIGHLIGHT_STORAGE_KEY)
  } catch {
    // The in-memory value has already been cleared.
  }
}

function isSearchHighlightPayload(
  payload: SearchHighlightPayload | null
): payload is SearchHighlightPayload {
  return Boolean(
    payload &&
      typeof payload.createdAt === 'number' &&
      typeof payload.path === 'string' &&
      typeof payload.query === 'string' &&
      (typeof payload.hint === 'undefined' ||
        typeof payload.hint === 'string') &&
      isSearchHighlightField(payload.field) &&
      normalizeQuery(payload.query)
  )
}

function locateFirstMatch(
  root: HTMLElement,
  query: string,
  field: SearchHighlightField,
  hint?: string
) {
  const requestedScopes = Array.from(
    root.querySelectorAll<HTMLElement>(`[data-search-field='${field}']`)
  ).filter(isElementVisible)
  const scopes = requestedScopes.length > 0 ? requestedScopes : [root]

  if (hint) {
    for (const scope of scopes) {
      const hintedMatch = findMatchingTextNode(scope, query, hint, true)
      if (hintedMatch) {
        return locateTextHighlight(
          hintedMatch.node,
          hintedMatch.index,
          query.length
        )
      }
    }
  }

  for (const scope of scopes) {
    const match = findMatchingTextNode(scope, query)
    if (match) return locateTextHighlight(match.node, match.index, query.length)
  }

  const fallback = scopes.find((scope) => isElementVisible(scope))
  return fallback ? locateElementHighlight(fallback) : null
}

function locateTextHighlight(
  node: Text,
  index: number,
  length: number
): LocatedHighlight | null {
  const element = node.parentElement
  if (!element) return null

  const range = document.createRange()
  try {
    range.setStart(node, index)
    range.setEnd(node, index + length)
  } catch {
    return locateElementHighlight(element)
  }

  return {
    element,
    getRect: () => range.getBoundingClientRect(),
    scrollIntoView: (behavior) =>
      scrollRectIntoView(range.getBoundingClientRect(), behavior),
    activate: () => highlightTextNode(node, index, length)
  }
}

function locateElementHighlight(element: HTMLElement): LocatedHighlight {
  return {
    element,
    getRect: () => element.getBoundingClientRect(),
    scrollIntoView: (behavior) =>
      element.scrollIntoView({ behavior, block: 'center' }),
    activate: () => highlightElement(element)
  }
}

function findMatchingTextNode(
  root: HTMLElement,
  query: string,
  hint?: string,
  requireHint = false
) {
  const normalizedQuery = query.toLocaleLowerCase()
  const normalizedHint = hint
    ?.replace(/^…|…$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (
        !parent ||
        parent.closest('script, style, [data-search-highlight-ignore]') ||
        !isElementVisible(parent)
      ) {
        return NodeFilter.FILTER_REJECT
      }

      return node.textContent?.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    }
  })

  let firstMatch: { node: Text; index: number } | null = null
  let node = walker.nextNode()
  while (node) {
    const text = node.textContent ?? ''
    const normalizedText = text.toLocaleLowerCase()
    const index = normalizedText.indexOf(normalizedQuery)
    if (index >= 0) {
      const match = { node: node as Text, index }
      const comparableText = normalizedText.replace(/\s+/g, ' ')
      if (normalizedHint && comparableText.includes(normalizedHint)) return match
      firstMatch ??= match
    }
    node = walker.nextNode()
  }

  return requireHint ? null : firstMatch
}

function highlightTextNode(node: Text, index: number, length: number) {
  const registry = (CSS as unknown as { highlights?: HighlightRegistryLike })
    .highlights
  const HighlightClass = (
    window as unknown as { Highlight?: HighlightConstructor }
  ).Highlight
  const parent = node.parentElement

  if (
    !registry ||
    !HighlightClass ||
    !parent ||
    index < 0 ||
    index + length > node.length
  ) {
    return parent ? highlightElement(parent) : null
  }

  try {
    const range = document.createRange()
    range.setStart(node, index)
    range.setEnd(node, index + length)
    registry.set(SEARCH_HIGHLIGHT_NAME, new HighlightClass(range))
  } catch {
    return highlightElement(parent)
  }

  const animation = createTextHighlightAnimation()

  return {
    element: parent,
    restore() {
      animation?.cancel()
      document.documentElement.style.removeProperty(
        '--search-arrival-highlight-opacity'
      )
      registry.delete(SEARCH_HIGHLIGHT_NAME)
    }
  }
}

function createTextHighlightAnimation() {
  if (prefersReducedMotion()) {
    document.documentElement.style.setProperty(
      '--search-arrival-highlight-opacity',
      '0.78'
    )
    return null
  }

  return document.documentElement.animate(
    [
      { '--search-arrival-highlight-opacity': '0.78', offset: 0 },
      { '--search-arrival-highlight-opacity': '0.78', offset: 0.2 },
      { '--search-arrival-highlight-opacity': '0', offset: 0.38 },
      { '--search-arrival-highlight-opacity': '0', offset: 0.5 },
      { '--search-arrival-highlight-opacity': '0.78', offset: 0.62 },
      { '--search-arrival-highlight-opacity': '0.78', offset: 0.78 },
      { '--search-arrival-highlight-opacity': '0', offset: 1 }
    ] as Keyframe[],
    {
      duration: HIGHLIGHT_DURATION,
      easing: 'ease-in-out',
      fill: 'forwards'
    }
  )
}

function highlightElement(element: HTMLElement) {
  element.classList.add('search-arrival-target')

  return {
    element,
    restore() {
      element.classList.remove('search-arrival-target')
    }
  }
}

function activateWhenVisible(
  getRect: () => DOMRect,
  forceIntoView: () => void,
  onVisible: () => void
) {
  let finished = false
  let frameId: number | undefined
  let fallbackTimer: number | undefined
  let lastTop: number | undefined
  let stableFrames = 0

  const checkPosition = () => {
    if (finished) return

    const rect = getRect()
    if (isRectInViewport(rect)) {
      const currentTop = rect.top
      stableFrames =
        typeof lastTop === 'number' && Math.abs(currentTop - lastTop) < 0.5
          ? stableFrames + 1
          : 0
      lastTop = currentTop

      if (stableFrames >= 3) {
        finished = true
        if (fallbackTimer) window.clearTimeout(fallbackTimer)
        frameId = window.requestAnimationFrame(onVisible)
        return
      }
    } else {
      lastTop = undefined
      stableFrames = 0
    }

    frameId = window.requestAnimationFrame(checkPosition)
  }

  frameId = window.requestAnimationFrame(checkPosition)
  fallbackTimer = window.setTimeout(() => {
    if (!isRectInViewport(getRect())) forceIntoView()
  }, 1400)

  return () => {
    finished = true
    if (frameId) window.cancelAnimationFrame(frameId)
    if (fallbackTimer) window.clearTimeout(fallbackTimer)
  }
}

function normalizeQuery(query: string) {
  return Array.from(query.trim()).slice(0, HIGHLIGHT_QUERY_LIMIT).join('')
}

function normalizePath(path: string) {
  try {
    return decodeURIComponent(path).replace(/\/+$/, '') || '/'
  } catch {
    return path.replace(/\/+$/, '') || '/'
  }
}

function isElementVisible(element: HTMLElement) {
  return element.getClientRects().length > 0
}

function isRectInViewport(rect: DOMRect) {
  const center = rect.top + rect.height / 2

  return center >= 72 && center <= window.innerHeight - 32
}

function scrollRectIntoView(rect: DOMRect, behavior: ScrollBehavior) {
  const top =
    window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2

  window.scrollTo({ top: Math.max(0, top), behavior })
}

function isSearchHighlightField(
  field: string | undefined
): field is SearchHighlightField {
  return Boolean(field && HIGHLIGHT_FIELDS.has(field as SearchHighlightField))
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
