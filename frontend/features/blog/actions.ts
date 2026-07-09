'use server'

import { runBlogMutation } from './blog-mutation'
import type { BlogMutationActionResult } from './blog-mutation'

export type { BlogMutationActionResult } from './blog-mutation'

type CategoryData = {
  id: string
  path?: string
}

type ArticleData = {
  id: string
  path?: string
}

export async function createCategoryAction(input: {
  description: string
  name: string
  parentId?: string
  slug: string
}): Promise<BlogMutationActionResult> {
  const name = input.name.trim()
  const slug = input.slug.trim()
  const description = input.description.trim()

  if (!name) {
    return { ok: false, message: '请输入目录名称' }
  }

  if (!slug) {
    return { ok: false, message: '请输入目录 slug' }
  }

  return runBlogMutation<CategoryData>({
    path: '/category/',
    method: 'POST',
    body: {
      name,
      slug,
      description,
      parentId: input.parentId || null
    },
    failureMessage: '新增目录失败，请稍后重试',
    serviceUnavailableMessage: '目录服务暂不可用，请稍后重试',
    successMessage: '新增目录成功'
  })
}

export async function updateCategoryAction(input: {
  description: string
  id: string
  name: string
  slug: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()
  const name = input.name.trim()
  const slug = input.slug.trim()
  const description = input.description.trim()

  if (!id) {
    return { ok: false, message: '目录 ID 不存在' }
  }

  if (!name) {
    return { ok: false, message: '请输入目录名称' }
  }

  if (!slug) {
    return { ok: false, message: '请输入目录 slug' }
  }

  return runBlogMutation<CategoryData>({
    path: `/category/${encodeURIComponent(id)}`,
    method: 'PATCH',
    body: {
      name,
      slug,
      description
    },
    failureMessage: '更新目录失败，请稍后重试',
    serviceUnavailableMessage: '目录服务暂不可用，请稍后重试',
    successMessage: '更新目录成功'
  })
}

export async function moveCategoryAction(input: {
  id: string
  parentId?: string | null
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()

  if (!id) {
    return { ok: false, message: '目录 ID 不存在' }
  }

  return runBlogMutation<CategoryData>({
    path: `/category/${encodeURIComponent(id)}/move`,
    method: 'PATCH',
    body: {
      parentId: input.parentId || null
    },
    failureMessage: '移动目录失败，请稍后重试',
    serviceUnavailableMessage: '目录服务暂不可用，请稍后重试',
    successMessage: '移动目录成功'
  })
}

export async function createArticleAction(input: {
  categoryId: string
  description: string
  slug: string
  title: string
}): Promise<BlogMutationActionResult> {
  const categoryId = input.categoryId.trim()
  const title = input.title.trim()
  const slug = input.slug.trim()
  const description = input.description.trim()

  if (!categoryId) {
    return { ok: false, message: '请选择文章所属目录路径' }
  }

  if (!title) {
    return { ok: false, message: '请输入文章标题' }
  }

  if (!slug) {
    return { ok: false, message: '请输入文章 slug' }
  }

  return runBlogMutation<ArticleData>({
    path: '/article/',
    method: 'POST',
    body: {
      categoryId,
      title,
      slug,
      description
    },
    failureMessage: '新增文章失败，请稍后重试',
    serviceUnavailableMessage: '文章服务暂不可用，请稍后重试',
    successMessage: '新增文章成功'
  })
}

export async function updateArticleAction(input: {
  content: string
  description: string
  id: string
  slug: string
  status: string
  tagIds: string[]
  title: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()
  const slug = input.slug.trim()
  const title = input.title.trim()
  const description = input.description.trim()
  const content = input.content
  const status = input.status.trim()
  const tagIds = input.tagIds

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  if (!title) {
    return { ok: false, message: '请输入文章标题' }
  }

  if (!slug) {
    return { ok: false, message: '请输入文章 slug' }
  }

  if (!['publish', 'private', 'draft'].includes(status)) {
    return { ok: false, message: '请选择有效的文章状态' }
  }

  return runBlogMutation<ArticleData>({
    path: `/article/${encodeURIComponent(id)}`,
    method: 'PATCH',
    body: {
      title,
      slug,
      description,
      content,
      status,
      tagIds
    },
    failureMessage: '更新文章失败，请稍后重试',
    serviceUnavailableMessage: '文章服务暂不可用，请稍后重试',
    successMessage: '更新文章成功'
  })
}

export async function moveArticleAction(input: {
  categoryId: string
  id: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()
  const categoryId = input.categoryId.trim()

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  if (!categoryId) {
    return { ok: false, message: '请选择文章所属目录路径' }
  }

  return runBlogMutation<ArticleData>({
    path: `/article/${encodeURIComponent(id)}/move`,
    method: 'PATCH',
    body: {
      categoryId
    },
    failureMessage: '移动文章失败，请稍后重试',
    serviceUnavailableMessage: '文章服务暂不可用，请稍后重试',
    successMessage: '移动文章成功'
  })
}
