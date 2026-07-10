import { BlogDetailContent } from '@/features/blog-details/blog-detail-content'
import { BlogPostEditAction } from '@/features/blog-details/blog-post-edit-action'
import { BlogPostHeader } from '@/features/blog-details/blog-post-header'
import { JsonLd } from '@/components/metadata/json-ld'
import { siteConfig, siteUrl } from '@/config/site'
import {
  BlogArticleTagBadge,
  getArticleTagHref
} from '@/features/blog/blog-article-tag-badge'
import { getArticleDetail, normalizeBlogPath } from '@/features/blog/blog-data'
import { getPublicArticleCoverUrl } from '@/lib/article-cover-url'
import { buildOgImageUrl, buildPageMetadata } from '@/lib/metadata'
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

  const isPublished = article.status === 'publish'

  return (
    <>
      {isPublished ? <JsonLd data={createArticleJsonLd(article)} /> : null}
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
    </>
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

  const tags = article.tags.map((tag) => tag.name)

  return buildPageMetadata({
    description: article.description,
    image: getPublicArticleCoverUrl(article.cover, { absolute: true }),
    keywords: tags,
    label: 'ARTICLE',
    modifiedTime: article.updatedAt,
    noIndex: article.status !== 'publish',
    path: `/post/${path}`,
    publishedTime:
      article.status === 'publish' ? article.publishedAt : undefined,
    tags,
    title: article.title,
    type: 'article'
  })
}

function createArticleJsonLd(
  article: NonNullable<Awaited<ReturnType<typeof getArticleDetail>>>
) {
  const articleUrl = new URL(
    `post/${article.path.replace(/^\/+/, '')}`,
    siteUrl
  ).toString()
  const tags = article.tags.map((tag) => tag.name)
  const image =
    getPublicArticleCoverUrl(article.cover, { absolute: true }) ||
    buildOgImageUrl({
      description: article.description,
      label: 'ARTICLE',
      tags,
      title: article.title
    })

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${articleUrl}#article`,
        '@type': 'BlogPosting',
        author: {
          '@id': new URL('#person', siteUrl).toString(),
          '@type': 'Person',
          name: siteConfig.author,
          url: siteUrl.toString()
        },
        dateModified: article.updatedAt || article.publishedAt,
        datePublished: article.publishedAt,
        description: article.description,
        headline: article.title,
        image,
        inLanguage: 'zh-CN',
        isPartOf: { '@id': new URL('#website', siteUrl).toString() },
        keywords: tags.join(', '),
        mainEntityOfPage: articleUrl,
        publisher: { '@id': new URL('#person', siteUrl).toString() }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            item: siteUrl.toString(),
            name: '首页',
            position: 1
          },
          {
            '@type': 'ListItem',
            item: new URL('blog', siteUrl).toString(),
            name: '博客',
            position: 2
          },
          {
            '@type': 'ListItem',
            item: articleUrl,
            name: article.title,
            position: 3
          }
        ]
      }
    ]
  }
}
