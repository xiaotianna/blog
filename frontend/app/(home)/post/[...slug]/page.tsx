import { BlogDetailContent } from '@/features/blog-details/blog-detail-content'
import { getArticleDetail, normalizeBlogPath } from '@/features/blog/blog-data'
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

  return <BlogDetailContent>{article.content}</BlogDetailContent>
}
