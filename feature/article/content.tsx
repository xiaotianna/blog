import { MarkdownRender } from "@/components/markdown"
import { ThemeToggle } from "@/components/theme-toggle"

export const ArticleContent = ({ content }: { content: string }) => {
  return (
    <div className='mx-auto min-h-screen w-full max-w-260 px-12 max-xl:px-8 max-md:px-5'>
      <main className='min-w-0 py-14 pb-24 max-md:py-9'>
        <div className='mb-6 flex justify-end'>
          <ThemeToggle />
        </div>
        <article
          className='article-content'
        >
          <MarkdownRender>{content}</MarkdownRender>
        </article>
      </main>
    </div>
  )
}
