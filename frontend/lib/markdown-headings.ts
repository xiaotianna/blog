export type MarkdownHeadingItem = {
  level: 1 | 2 | 3
  title: string
}

function getHeadingText(rawText: string) {
  return rawText
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~]/g, '')
    .trim()
}

export function extractMarkdownHeadings(source: string): MarkdownHeadingItem[] {
  const headings: MarkdownHeadingItem[] = []
  let codeFence: string | null = null

  for (const line of source.split('\n')) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)

    if (fenceMatch) {
      const fence = fenceMatch[1][0]

      if (!codeFence) {
        codeFence = fence
      } else if (codeFence === fence) {
        codeFence = null
      }

      continue
    }

    if (codeFence) continue

    const headingMatch = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/)

    if (!headingMatch) continue

    const title = getHeadingText(headingMatch[2])

    if (!title) continue

    headings.push({
      level: headingMatch[1].length as 1 | 2 | 3,
      title
    })
  }

  return headings
}
