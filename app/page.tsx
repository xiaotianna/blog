import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ArticleContent } from "@/feature/article/content"

export default async function Home() {
  const content = await readFile(
    join(process.cwd(), "public", "demo.mdx"),
    "utf8",
  )

  return <ArticleContent content={content} />
}
