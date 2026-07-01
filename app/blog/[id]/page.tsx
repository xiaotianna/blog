import { readdir, readFile } from 'node:fs/promises'
import { extname, join, parse } from 'node:path'

import { MarkdownRender } from '@/components/markdown'
import { notFound } from 'next/navigation'

type BlogDetailParams = {
  id: string
}

const PUBLIC_DIR = join(process.cwd(), 'public')
const MARKDOWN_EXTENSIONS = ['.mdx', '.md'] as const

function isMarkdownFile(file: string) {
  return MARKDOWN_EXTENSIONS.includes(
    extname(file) as (typeof MARKDOWN_EXTENSIONS)[number]
  )
}

async function getMarkdownFiles() {
  const entries = await readdir(PUBLIC_DIR, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => entry.name)
}

async function getBlogContent(id: string) {
  const files = await getMarkdownFiles()
  const file = MARKDOWN_EXTENSIONS.map((extension) => `${id}${extension}`).find(
    (filename) => files.includes(filename)
  )

  if (!file) {
    notFound()
  }

  return readFile(join(PUBLIC_DIR, file), 'utf8')
}

export async function generateStaticParams(): Promise<BlogDetailParams[]> {
  const files = await getMarkdownFiles()
  const ids = new Set(files.map((file) => parse(file).name))

  return Array.from(ids).map((id) => ({
    id
  }))
}

export default async function BlogDetail({
  params
}: {
  params: Promise<BlogDetailParams>
}) {
  const { id } = await params
  const content = await getBlogContent(id)

  return (
    <article className='article-content'>
      <MarkdownRender>{content}</MarkdownRender>
    </article>
  )
}
