import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

type UploadRouteParams = {
  path: string[]
}

export const runtime = 'nodejs'

const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const UPLOADS_ROOT = resolve(
  process.env.BLOG_UPLOADS_DIR ??
    resolve(process.cwd(), '..', 'backend', 'uploads')
)

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<UploadRouteParams> }
) {
  const { path } = await params
  const filePath = resolveUploadPath(path)

  if (!filePath) {
    return new Response('Not Found', { status: 404 })
  }

  const contentType = IMAGE_CONTENT_TYPES[extname(filePath).toLowerCase()]

  if (!contentType) {
    return new Response('Not Found', { status: 404 })
  }

  try {
    const file = await readFile(filePath)

    return new Response(new Uint8Array(file), {
      headers: {
        'cache-control': CACHE_CONTROL,
        'content-type': contentType
      }
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}

function resolveUploadPath(path: string[]) {
  if (!path.length || path[0] !== 'covers') {
    return ''
  }

  if (
    path.some(
      (segment) =>
        !segment ||
        segment === '.' ||
        segment === '..' ||
        segment.includes('/') ||
        segment.includes('\\')
    )
  ) {
    return ''
  }

  const filePath = resolve(UPLOADS_ROOT, ...path)

  if (!filePath.startsWith(`${UPLOADS_ROOT}/`)) {
    return ''
  }

  return filePath
}
