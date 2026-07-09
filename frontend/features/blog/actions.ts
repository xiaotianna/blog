'use server'

import {
  enqueueArticleCoverJob,
  getArticleCoverJobStatus,
  processArticleCoverJobQueue
} from '@/lib/server/article-cover-jobs'
import type {
  ArticleCoverJobSnapshot,
  ArticleCoverJobStatus
} from '@/lib/server/article-cover-jobs'
import { getAuthToken } from '@/lib/server/auth'
import { goApiFetch, readApiResponse } from '@/lib/server/go-api'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { after } from 'next/server'

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

type TagData = {
  id: string
}

type ArticleImageData = {
  url?: string
}

type UploadArticleImageActionResult = BlogMutationActionResult & {
  url?: string
}

type ArticleCoverJobActionResult = BlogMutationActionResult & {
  job?: ArticleCoverJobSnapshot
}

type ArticleCoverJobStatusActionResult = {
  ok: boolean
  job?: ArticleCoverJobSnapshot
  message?: string
  status?: ArticleCoverJobStatus
}

const ARTICLE_IMAGE_FILE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
])
const ARTICLE_IMAGE_MAX_SIZE = 10 * 1024 * 1024

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

export async function deleteCategoryAction(input: {
  id: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()

  if (!id) {
    return { ok: false, message: '目录 ID 不存在' }
  }

  const result = await runBlogMutation<CategoryData>({
    path: `/category/${encodeURIComponent(id)}`,
    method: 'DELETE',
    failureMessage: '删除目录失败，请稍后重试',
    serviceUnavailableMessage: '目录服务暂不可用，请稍后重试',
    successMessage: '删除目录成功'
  })

  if (result.ok && result.path) {
    revalidatePath(`/blog/${result.path}`)
    revalidatePath(getParentBlogPath(result.path))
  }

  return result
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

export async function createTagAction(input: {
  color: string
  name: string
}): Promise<BlogMutationActionResult> {
  const color = input.color.trim()
  const name = input.name.trim()

  if (!name) {
    return { ok: false, message: '请输入标签名称' }
  }

  if (name.length > 40) {
    return { ok: false, message: '标签名称不能超过 40 个字符' }
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { ok: false, message: '请选择有效的标签颜色' }
  }

  return runBlogMutation<TagData>({
    path: '/tag/',
    method: 'POST',
    body: {
      color,
      name
    },
    failureMessage: '新增标签失败，请稍后重试',
    serviceUnavailableMessage: '标签服务暂不可用，请稍后重试',
    successMessage: '新增标签成功'
  })
}

export async function updateTagAction(input: {
  color: string
  id: string
  name: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()
  const color = input.color.trim()
  const name = input.name.trim()

  if (!id) {
    return { ok: false, message: '标签 ID 不存在' }
  }

  if (!name) {
    return { ok: false, message: '请输入标签名称' }
  }

  if (name.length > 40) {
    return { ok: false, message: '标签名称不能超过 40 个字符' }
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { ok: false, message: '请选择有效的标签颜色' }
  }

  return runBlogMutation<TagData>({
    path: `/tag/${encodeURIComponent(id)}`,
    method: 'PATCH',
    body: {
      color,
      name
    },
    failureMessage: '更新标签失败，请稍后重试',
    serviceUnavailableMessage: '标签服务暂不可用，请稍后重试',
    successMessage: '更新标签成功'
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

  const result = await runBlogMutation<ArticleData>({
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

  if (result.ok && result.path) {
    revalidatePath(`/post/${result.path}`)
  }

  return result
}

export async function updateArticleContentAction(input: {
  article: {
    description: string
    id: string
    slug: string
    status: string
    tagIds: string[]
    title: string
  }
  content: string
}): Promise<BlogMutationActionResult> {
  return updateArticleAction({
    id: input.article.id,
    title: input.article.title,
    slug: input.article.slug,
    description: input.article.description,
    status: input.article.status,
    content: input.content,
    tagIds: input.article.tagIds
  })
}

export async function updateArticleCoverAction(input: {
  id: string
  path: string
}): Promise<ArticleCoverJobActionResult> {
  const id = input.id.trim()
  const path = input.path.trim()

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  if (!path) {
    return { ok: false, message: '文章路径不存在' }
  }

  const authToken = await getAuthToken()

  if (!authToken) {
    return { ok: false, message: '请先登录' }
  }

  const cookieHeader = (await cookies()).toString()
  const job = enqueueArticleCoverJob({
    authToken,
    cookieHeader,
    id,
    path
  })

  after(async () => {
    try {
      await processArticleCoverJobQueue()
    } catch (error) {
      console.error('文章封面任务队列异常', error)
    }
  })

  return {
    ok: true,
    job,
    message:
      job.status === 'running'
        ? '封面正在生成中'
        : '封面更新任务已加入队列'
  }
}

export async function getArticleCoverJobStatusAction(
  jobId: string
): Promise<ArticleCoverJobStatusActionResult> {
  const id = jobId.trim()

  if (!id) {
    return {
      ok: false,
      message: '封面任务不存在'
    }
  }

  const job = getArticleCoverJobStatus(id)

  if (!job) {
    return {
      ok: false,
      message: '封面任务已过期'
    }
  }

  if (job.status === 'queued') {
    after(async () => {
      try {
        await processArticleCoverJobQueue()
      } catch (error) {
        console.error('文章封面任务队列异常', error)
      }
    })
  }

  return {
    ok: true,
    job,
    message: job.message,
    status: job.status
  }
}

export async function uploadArticleCoverAction(
  formData: FormData
): Promise<BlogMutationActionResult> {
  const id = String(formData.get('id') ?? '').trim()
  const path = String(formData.get('path') ?? '').trim()
  const cover = formData.get('cover')

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  if (!(cover instanceof File) || cover.size === 0) {
    return { ok: false, message: '请选择要上传的封面图' }
  }

  const uploadFormData = new FormData()
  uploadFormData.set('cover', cover)

  try {
    const result = await fetchArticleCoverUpload(id, uploadFormData)

    if (result.ok && path) {
      revalidatePath(`/blog/${path}`)
      revalidatePath(`/post/${path}`)
    }

    return result
  } catch {
    return {
      ok: false,
      message: '文章服务暂不可用，请稍后重试'
    }
  }
}

export async function uploadArticleImageAction(
  formData: FormData
): Promise<UploadArticleImageActionResult> {
  const id = String(formData.get('id') ?? '').trim()
  const image = formData.get('image')

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  if (!(image instanceof File) || image.size === 0) {
    return { ok: false, message: '请选择要上传的图片' }
  }

  if (image.size > ARTICLE_IMAGE_MAX_SIZE) {
    return { ok: false, message: '图片不能超过 10MB' }
  }

  if (!ARTICLE_IMAGE_FILE_TYPES.has(image.type)) {
    return { ok: false, message: '图片仅支持 PNG、JPEG、WebP 或 GIF' }
  }

  const uploadFormData = new FormData()
  uploadFormData.set('image', image)

  try {
    return await fetchArticleImageUpload(id, uploadFormData)
  } catch {
    return {
      ok: false,
      message: '文章服务暂不可用，请稍后重试'
    }
  }
}

export async function deleteArticleCoverAction(input: {
  id: string
  path: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()
  const path = input.path.trim()

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  try {
    const response = await fetchArticleCoverDelete(id)

    if (!response.ok) {
      return response
    }

    if (path) {
      revalidatePath(`/blog/${path}`)
      revalidatePath(`/post/${path}`)
    }

    return response
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

export async function deleteArticleAction(input: {
  id: string
  path: string
}): Promise<BlogMutationActionResult> {
  const id = input.id.trim()
  const path = input.path.trim()

  if (!id) {
    return { ok: false, message: '文章 ID 不存在' }
  }

  const result = await runBlogMutation<ArticleData>({
    path: `/article/${encodeURIComponent(id)}`,
    method: 'DELETE',
    failureMessage: '删除文章失败，请稍后重试',
    serviceUnavailableMessage: '文章服务暂不可用，请稍后重试',
    successMessage: '删除文章成功'
  })

  if (result.ok) {
    if (path) {
      revalidatePath(`/blog/${path}`)
      revalidatePath(`/post/${path}`)
      revalidatePath(getParentBlogPath(path))
    }

    if (result.path && result.path !== path) {
      revalidatePath(`/blog/${result.path}`)
      revalidatePath(`/post/${result.path}`)
      revalidatePath(getParentBlogPath(result.path))
    }
  }

  return result
}

async function fetchArticleCoverUpload(
  id: string,
  formData: FormData
): Promise<BlogMutationActionResult> {
  const response = await goApiFetch(`/article/${encodeURIComponent(id)}/cover`, {
    method: 'PATCH',
    body: formData
  })
  const result = await readApiResponse<ArticleData>(response)

  if (!response.ok || !result.data?.id) {
    return {
      ok: false,
      message: result.message || '上传文章封面失败，请稍后重试'
    }
  }

  return {
    ok: true,
    message: result.message || '上传文章封面成功',
    path: result.data.path
  }
}

async function fetchArticleCoverDelete(
  id: string
): Promise<BlogMutationActionResult> {
  const response = await goApiFetch(`/article/${encodeURIComponent(id)}/cover`, {
    method: 'DELETE'
  })
  const result = await readApiResponse<ArticleData>(response)

  if (!response.ok || !result.data?.id) {
    return {
      ok: false,
      message: result.message || '删除文章封面失败，请稍后重试'
    }
  }

  return {
    ok: true,
    message: result.message || '删除文章封面成功',
    path: result.data.path
  }
}

async function fetchArticleImageUpload(
  id: string,
  formData: FormData
): Promise<UploadArticleImageActionResult> {
  const response = await goApiFetch(
    `/article/${encodeURIComponent(id)}/assets/images`,
    {
      method: 'POST',
      body: formData
    }
  )
  const result = await readApiResponse<ArticleImageData>(response)

  if (!response.ok || !result.data?.url) {
    return {
      ok: false,
      message: result.message || '上传文章图片失败，请稍后重试'
    }
  }

  return {
    ok: true,
    message: result.message || '上传文章图片成功',
    url: result.data.url
  }
}

function getParentBlogPath(path: string) {
  const segments = path.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return '/blog'
  }

  return `/blog/${segments.slice(0, -1).join('/')}`
}
