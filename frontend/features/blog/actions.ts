'use server'

import { goApiFetch, readApiResponse } from '@/lib/server/go-api'
import { isAuthenticated } from '@/lib/server/permissions/check'
import { revalidatePath } from 'next/cache'

export type BlogMutationActionResult = {
  ok: boolean
  message?: string
  path?: string
}

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
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

  const name = input.name.trim()
  const slug = input.slug.trim()
  const description = input.description.trim()

  if (!name) {
    return { ok: false, message: '请输入目录名称' }
  }

  if (!slug) {
    return { ok: false, message: '请输入目录 slug' }
  }

  try {
    const response = await goApiFetch('/category/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        slug,
        description,
        parentId: input.parentId || null
      })
    })
    const result = await readApiResponse<CategoryData>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || '新增目录失败，请稍后重试'
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || '新增目录成功'
    }
  } catch {
    return {
      ok: false,
      message: '目录服务暂不可用，请稍后重试'
    }
  }
}

export async function updateCategoryAction(input: {
  description: string
  id: string
  name: string
  slug: string
}): Promise<BlogMutationActionResult> {
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

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

  try {
    const response = await goApiFetch(`/category/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        slug,
        description
      })
    })
    const result = await readApiResponse<CategoryData>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || '更新目录失败，请稍后重试'
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || '更新目录成功',
      path: result.data.path
    }
  } catch {
    return {
      ok: false,
      message: '目录服务暂不可用，请稍后重试'
    }
  }
}

export async function moveCategoryAction(input: {
  id: string
  parentId?: string | null
}): Promise<BlogMutationActionResult> {
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

  const id = input.id.trim()

  if (!id) {
    return { ok: false, message: '目录 ID 不存在' }
  }

  try {
    const response = await goApiFetch(
      `/category/${encodeURIComponent(id)}/move`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parentId: input.parentId || null
        })
      }
    )
    const result = await readApiResponse<CategoryData>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || '移动目录失败，请稍后重试'
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || '移动目录成功',
      path: result.data.path
    }
  } catch {
    return {
      ok: false,
      message: '目录服务暂不可用，请稍后重试'
    }
  }
}

export async function createArticleAction(input: {
  categoryId: string
  description: string
  slug: string
  title: string
}): Promise<BlogMutationActionResult> {
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

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

  try {
    const response = await goApiFetch('/article/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categoryId,
        title,
        slug,
        description
      })
    })
    const result = await readApiResponse<ArticleData>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || '新增文章失败，请稍后重试'
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || '新增文章成功'
    }
  } catch {
    return {
      ok: false,
      message: '文章服务暂不可用，请稍后重试'
    }
  }
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
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

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

  try {
    const response = await goApiFetch(`/article/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        slug,
        description,
        content,
        status,
        tagIds
      })
    })
    const result = await readApiResponse<ArticleData>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || '更新文章失败，请稍后重试'
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || '更新文章成功',
      path: result.data.path
    }
  } catch {
    return {
      ok: false,
      message: '文章服务暂不可用，请稍后重试'
    }
  }
}

export async function moveArticleAction(input: {
  categoryId: string
  id: string
}): Promise<BlogMutationActionResult> {
  const authError = await ensureAuthenticated()

  if (authError) {
    return authError
  }

  const id = input.id.trim()
  const categoryId = input.categoryId.trim()

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  if (!categoryId) {
    return { ok: false, message: '请选择文章所属目录路径' }
  }

  try {
    const response = await goApiFetch(
      `/article/${encodeURIComponent(id)}/move`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryId
        })
      }
    )
    const result = await readApiResponse<ArticleData>(response)

    if (!response.ok || !result.data?.id) {
      return {
        ok: false,
        message: result.message || '移动文章失败，请稍后重试'
      }
    }

    revalidatePath('/blog')

    return {
      ok: true,
      message: result.message || '移动文章成功',
      path: result.data.path
    }
  } catch {
    return {
      ok: false,
      message: '文章服务暂不可用，请稍后重试'
    }
  }
}

async function ensureAuthenticated(): Promise<BlogMutationActionResult | null> {
  if (await isAuthenticated()) {
    return null
  }

  return {
    ok: false,
    message: '请先登录后再操作'
  }
}
