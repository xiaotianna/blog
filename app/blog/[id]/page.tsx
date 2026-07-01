import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ArticleContent } from "@/features/article/content"

export default async function BlogDetail() {
  const content = await readFile(
    join(process.cwd(), "public", "demo.mdx"),
    "utf8",
  )

  return <ArticleContent content={content} />
}
