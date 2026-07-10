import { BlogDetailContent } from '@/features/blog-details/blog-detail-content'
import { BlogPostEditAction } from '@/features/blog-details/blog-post-edit-action'
import { BlogPostHeader } from '@/features/blog-details/blog-post-header'
import {
  BlogArticleTagBadge,
  getArticleTagHref
} from '@/features/blog/blog-article-tag-badge'
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
    <BlogDetailContent
      beforeScrollToTop={
        article.tags.length > 0 ? (
          <div
            className='flex flex-wrap gap-2'
            data-search-field='tag'
          >
            {article.tags.map((tag) => (
              <BlogArticleTagBadge
                href={getArticleTagHref(tag)}
                key={tag.id}
                tag={tag}
              />
            ))}
          </div>
        ) : null
      }
      header={
        <BlogPostHeader
          action={<BlogPostEditAction articleId={article.id} />}
          description={article.description}
          publishedAt={article.publishedAt}
          status={article.status}
          tags={article.tags}
          title={article.title}
          updatedAt={article.updatedAt}
        />
      }
    >
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
      publishedTime:
        article.status === 'publish' && article.publishedAt
          ? article.publishedAt
          : undefined,
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
