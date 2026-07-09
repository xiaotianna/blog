import { BlogDetailContent } from '@/features/blog-details/blog-detail-content'
import { getArticleDetail, normalizeBlogPath } from '@/features/blog/blog-data'
import { getPublicArticleCoverUrl } from '@/lib/article-cover-url'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type BlogPostParams = {
  slug: string[]
}

export default async function BlogPostDetail({
  params
}: {
  params: Promise<BlogPostParams>
}) {
  const { slug } = await params
  const path = normalizeBlogPath(slug)
  const article = await getArticleDetail(path)

  if (!article) {
    notFound()
  }

  return (
    <BlogDetailContent title={article.title} description={article.description}>
      {article.content}
    </BlogDetailContent>
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<BlogPostParams>
}): Promise<Metadata> {
  const { slug } = await params
  const path = normalizeBlogPath(slug)
  const article = await getArticleDetail(path)

  if (!article) {
    return {}
  }

  const coverUrl = getPublicArticleCoverUrl(article.cover, { absolute: true })
  const images = coverUrl ? [{ url: coverUrl, width: 1200, height: 630 }] : []

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      images
    },
    twitter: {
      card: coverUrl ? 'summary_large_image' : 'summary',
      title: article.title,
      description: article.description,
      images: coverUrl ? [coverUrl] : undefined
    }
  }
}
