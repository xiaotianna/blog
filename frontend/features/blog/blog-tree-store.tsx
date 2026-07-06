'use client'

import type { BlogTreeNode } from '@/features/blog/blog-data'
import { useEffect, useSyncExternalStore } from 'react'

type BlogTreeSnapshot = {
  tree: BlogTreeNode[]
}

const emptySnapshot: BlogTreeSnapshot = {
  tree: []
}

let snapshot = emptySnapshot
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function setBlogTree(tree: BlogTreeNode[]) {
  snapshot = { tree }
  emitChange()
}

function clearBlogTree() {
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

export function useBlogTreeSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function BlogTreeRegistry({ tree }: { tree: BlogTreeNode[] }) {
  useEffect(() => {
    setBlogTree(tree)

    return () => {
      clearBlogTree()
    }
  }, [tree])

  return null
}
