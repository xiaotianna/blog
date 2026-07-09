import { revalidatePath } from 'next/cache'

import { generateAndUploadArticleCover } from './article-cover'

type ArticleCoverJobPayload = {
  authToken: string
  cookieHeader: string
  id: string
  path: string
}

export type ArticleCoverJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'

export type ArticleCoverJobSnapshot = {
  id: string
  message?: string
  status: ArticleCoverJobStatus
}

type ArticleCoverJob = ArticleCoverJobSnapshot & {
  articleId: string
  createdAt: number
  payload: ArticleCoverJobPayload
  updatedAt: number
}

type ArticleCoverJobStore = {
  activeArticleJobIds: Map<string, string>
  isProcessing: boolean
  jobs: Map<string, ArticleCoverJob>
  queue: string[]
}

const JOB_TTL = 10 * 60 * 1000

const globalForArticleCoverJobs = globalThis as typeof globalThis & {
  __articleCoverJobStore?: ArticleCoverJobStore
}

const store =
  globalForArticleCoverJobs.__articleCoverJobStore ??
  createArticleCoverJobStore()

globalForArticleCoverJobs.__articleCoverJobStore = store

export function enqueueArticleCoverJob(
  payload: ArticleCoverJobPayload
): ArticleCoverJobSnapshot {
  cleanupArticleCoverJobs()

  const existingJobId = store.activeArticleJobIds.get(payload.id)
  const existingJob = existingJobId ? store.jobs.get(existingJobId) : undefined

  if (existingJob?.status === 'queued') {
    existingJob.payload = payload
    existingJob.message = '封面更新任务已加入队列'
    existingJob.updatedAt = Date.now()

    return toSnapshot(existingJob)
  }

  if (existingJob?.status === 'running') {
    return toSnapshot(existingJob)
  }

  const now = Date.now()
  const job: ArticleCoverJob = {
    articleId: payload.id,
    createdAt: now,
    id: `${payload.id}-${now}`,
    message: '封面更新任务已加入队列',
    payload,
    status: 'queued',
    updatedAt: now
  }

  store.jobs.set(job.id, job)
  store.activeArticleJobIds.set(payload.id, job.id)
  store.queue.push(job.id)

  return toSnapshot(job)
}

export function getArticleCoverJobStatus(
  jobId: string
): ArticleCoverJobSnapshot | null {
  cleanupArticleCoverJobs()

  const job = store.jobs.get(jobId)

  return job ? toSnapshot(job) : null
}

export async function processArticleCoverJobQueue() {
  if (store.isProcessing) {
    return
  }

  store.isProcessing = true

  try {
    while (store.queue.length > 0) {
      const jobId = store.queue.shift()
      const job = jobId ? store.jobs.get(jobId) : undefined

      if (!job || job.status !== 'queued') {
        continue
      }

      try {
        await runArticleCoverJob(job)
      } catch (error) {
        job.status = 'failed'
        job.message =
          error instanceof Error && error.message
            ? `文章封面更新失败：${error.message}`
            : '文章封面更新失败'
        job.updatedAt = Date.now()
        store.activeArticleJobIds.delete(job.articleId)
      }
    }
  } finally {
    store.isProcessing = false
  }
}

async function runArticleCoverJob(job: ArticleCoverJob) {
  job.status = 'running'
  job.message = '正在生成文章封面'
  job.updatedAt = Date.now()

  const result = await generateAndUploadArticleCover(job.payload)

  job.status = result.ok ? 'succeeded' : 'failed'
  job.message =
    result.message ?? (result.ok ? '文章封面已更新' : '文章封面更新失败')
  job.updatedAt = Date.now()

  store.activeArticleJobIds.delete(job.articleId)

  if (!result.ok) {
    return
  }

  revalidatePath(`/blog/${job.payload.path}`)
  revalidatePath(`/post/${job.payload.path}`)
}

function cleanupArticleCoverJobs() {
  const expiresBefore = Date.now() - JOB_TTL

  for (const [jobId, job] of store.jobs) {
    if (
      (job.status === 'succeeded' || job.status === 'failed') &&
      job.updatedAt < expiresBefore
    ) {
      store.jobs.delete(jobId)
    }
  }
}

function createArticleCoverJobStore(): ArticleCoverJobStore {
  return {
    activeArticleJobIds: new Map(),
    isProcessing: false,
    jobs: new Map(),
    queue: []
  }
}

function toSnapshot(job: ArticleCoverJob): ArticleCoverJobSnapshot {
  return {
    id: job.id,
    message: job.message,
    status: job.status
  }
}
