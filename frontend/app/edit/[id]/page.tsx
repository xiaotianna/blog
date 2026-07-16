import { ArticleEditorShell } from '@/features/editor/article-editor-shell'
import { getArticleDetailById } from '@/features/blog/blog-data'
import { normalizeInternalRedirect } from '@/lib/redirect'
import { isNotFoundApiError } from '@/lib/server/go-api'
import { getCurrentUser } from '@/lib/server/current-user'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = buildPageMetadata({
  title: '编辑文章',
  description: '编辑文章 MDX 内容。',
  noIndex: true,
  path: '/edit'
})

type EditArticlePageProps = {
  params: Promise<{
    id: string
  }>
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  const redirectTo = normalizeInternalRedirect(`/edit/${id}`)

  if (!UUID_PATTERN.test(id)) {
    notFound()
  }

  if (!(await getCurrentUser())) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  try {
    const article = await getArticleDetailById(id)

    return <ArticleEditorShell article={article} />
  } catch (error) {
    if (isNotFoundApiError(error)) {
      notFound()
    }

    throw error
  }
}
