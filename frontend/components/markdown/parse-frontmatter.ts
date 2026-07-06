export type MarkdownMetadataData = {
  title?: string
  description?: string
  folderId?: string
  version?: string
  lastUpdated?: string
  [key: string]: string | number | boolean | string[] | undefined
}

type FrontmatterValue = string | number | boolean | string[]

function parseFrontmatterValue(value: string): FrontmatterValue {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => String(parseFrontmatterValue(item)))
      .filter(Boolean)
  }

  const numberValue = Number(trimmed)

  if (trimmed && Number.isFinite(numberValue)) return numberValue

  return trimmed
}

function parseMetadata(frontmatter: string): MarkdownMetadataData {
  const metadata: MarkdownMetadataData = {}

  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf(':')

    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!key) continue

    metadata[key] = parseFrontmatterValue(value)
  }

  return metadata
}

export function parseFrontmatter(source: string) {
  if (!source.startsWith('---')) {
    return {
      metadata: {},
      body: source
    }
  }

  const closingFenceMatch = source.match(/\n---\s*(?:\n|$)/)

  if (!closingFenceMatch?.index) {
    return {
      metadata: {},
      body: source
    }
  }

  const frontmatter = source.slice(3, closingFenceMatch.index)
  const bodyStart = closingFenceMatch.index + closingFenceMatch[0].length

  return {
    metadata: parseMetadata(frontmatter),
    body: source.slice(bodyStart)
  }
}
