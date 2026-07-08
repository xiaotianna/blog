'use server'

import { goApiFetch, readApiResponse } from '@/lib/server/go-api'
import { revalidatePath } from 'next/cache'

export type BlogMutationActionResult = {
  ok: boolean
  message?: string
}

type CategoryData = {
  id: string
}

type ArticleData = {
  id: string
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
