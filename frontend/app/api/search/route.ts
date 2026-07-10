import type { SearchResponse } from '@/features/search/search-types'
import {
  isGoApiError,
  requestGoApiData
} from '@/lib/server/go-api'

export const dynamic = 'force-dynamic'

const SEARCH_QUERY_LIMIT = 100
const RESPONSE_HEADERS = {
  'cache-control': 'private, no-store, max-age=0'
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''

  if (Array.from(query).length > SEARCH_QUERY_LIMIT) {
    return Response.json(
      { message: '搜索关键词不能超过100个字符' },
      { status: 400, headers: RESPONSE_HEADERS }
    )
  }

  try {
    const data = await requestGoApiData<SearchResponse>(
      `/search?q=${encodeURIComponent(query)}`
    )

    return Response.json(data, { headers: RESPONSE_HEADERS })
  } catch (error) {
    if (isGoApiError(error)) {
      return Response.json(
        { message: error.message || '搜索服务暂时不可用，请稍后重试' },
        { status: error.status, headers: RESPONSE_HEADERS }
      )
    }

    return Response.json(
      { message: '搜索服务暂时不可用，请稍后重试' },
      { status: 502, headers: RESPONSE_HEADERS }
    )
  }
}
