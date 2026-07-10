export type SearchResultType = 'directory' | 'article'
export type SearchHighlightField = 'title' | 'description' | 'tag' | 'content'

export type SearchResultTag = {
  id: string
  name: string
  color: string
}

export type SearchResult = {
  id: string
  type: SearchResultType
  title: string
  path: string
  titleMatched: boolean
  description?: string
  tags?: SearchResultTag[]
  content?: string
}

export type SearchResponse = {
  items: SearchResult[]
}
