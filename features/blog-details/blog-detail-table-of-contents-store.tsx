'use client'

import type { MarkdownHeadingItem } from '@/lib/markdown-headings'
import { useEffect, useSyncExternalStore } from 'react'

type BlogDetailTableOfContentsSnapshot = {
  items: MarkdownHeadingItem[]
}

const emptySnapshot: BlogDetailTableOfContentsSnapshot = {
  items: []
}

let snapshot = emptySnapshot
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function setTableOfContentsItems(items: MarkdownHeadingItem[]) {
  snapshot = { items }
  emitChange()
}

function clearTableOfContentsItems() {
  snapshot = emptySnapshot
  emitChange()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return snapshot
}

function getServerSnapshot() {
  return emptySnapshot
}

export function useBlogDetailTableOfContentsSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function BlogDetailTableOfContentsRegistry({
  items
}: {
  items: MarkdownHeadingItem[]
}) {
  useEffect(() => {
    setTableOfContentsItems(items)

    return () => {
      clearTableOfContentsItems()
    }
  }, [items])

  return null
}
