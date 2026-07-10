import { ArrowLeft, Hash } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

type TagPageParams = {
  tag: string
}

export default async function TagPage({
  params
}: {
  params: Promise<TagPageParams>
}) {
  const { tag } = await params

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-9rem)] w-full flex-col px-6 pb-20 lg:px-0'>
      <div className='flex flex-1 flex-col items-center justify-center text-center'>
        <Hash className='mb-5 size-10 text-muted-foreground' />
        <h1 className='text-4xl font-semibold tracking-tight'># {tag}</h1>
        <p className='mt-4 text-muted-foreground'>标签文章列表正在建设中</p>
        <Link
          className='mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary'
          href='/blog'
        >
          <ArrowLeft className='size-4' />
          返回博客
        </Link>
      </div>
    </main>
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<TagPageParams>
}): Promise<Metadata> {
  const { tag } = await params

  return {
    title: `# ${tag}`,
    description: `查看标签“${tag}”下的文章`
  }
}
