import { MarkdownRender } from "@/components/markdown"

export const ArticleContent = ({ content }: { content: string }) => {
  return (
    <div className='mx-auto min-h-screen w-full max-w-260 px-12 max-xl:px-8 max-md:px-5'>
      <main className='min-w-0 py-14 pb-24 max-md:py-9'>
        <article
          className='article-content'
          data-docs-container
        >
          <MarkdownRender>{content}</MarkdownRender>
        </article>
      </main>
    </div>
  )
}
