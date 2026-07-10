import type {
  ArticleStatus,
  BlogArticle,
  BlogCategory
} from '@/features/blog/blog-data'
import { requestGoApiData } from '@/lib/server/go-api'

type HomeCategory = Pick<
  BlogCategory,
  'id' | 'name' | 'path' | 'description'
>

type HomeArticle = Pick<
  BlogArticle,
  'id' | 'title' | 'path' | 'description' | 'status' | 'updatedAt'
>

export type HomeCategoryCard = {
  category: HomeCategory
  articles: HomeArticle[]
}

export type HomeCategoryData = {
  canManageArticles: boolean
  items: HomeCategoryCard[]
}

type HomeCategoryApiItem = HomeCategory & {
  articles: HomeArticle[]
}

type HomeCategoryApiResponse = {
  canManageArticles: boolean
  items: HomeCategoryApiItem[]
}

export type HomeArticleStatus = ArticleStatus

export async function getHomeCategoryData(): Promise<HomeCategoryData> {
  const response =
    await requestGoApiData<HomeCategoryApiResponse>('/category/home')

  return {
    canManageArticles: response.canManageArticles,
    items: response.items.map(({ articles, ...category }) => ({
      category,
      articles
    }))
  }
}
