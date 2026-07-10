import { OgCard } from '@/features/metadata/og-card'
import { getOgRenderer } from '@/features/metadata/takumi-renderer'
import { ImageResponse } from 'takumi-js/response'

export const runtime = 'nodejs'

const DEFAULT_TITLE = "小T1an's Blog"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = readParam(searchParams, 'title', DEFAULT_TITLE, 88)
  const description = readParam(searchParams, 'description', '', 160)
  const label = readParam(searchParams, 'label', 'PREVIEW', 24)
  const tags = searchParams
    .getAll('tag')
    .map((tag) => tag.trim().slice(0, 24))
    .filter(Boolean)
    .slice(0, 4)
  const renderer = await getOgRenderer()

  return new ImageResponse(
    <OgCard
      description={description}
      label={label}
      tags={tags}
      title={title}
    />,
    {
      format: 'png',
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      },
      height: 630,
      renderer,
      width: 1200
    }
  )
}

function readParam(
  searchParams: URLSearchParams,
  name: string,
  fallback: string,
  maxLength: number
) {
  return (searchParams.get(name)?.trim() || fallback).slice(0, maxLength)
}
