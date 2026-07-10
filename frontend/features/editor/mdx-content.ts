const RAW_BLOCK_LANGUAGE = 'mdx-raw-block'
const RAW_BLOCK_FENCE = '```' + RAW_BLOCK_LANGUAGE

export function protectMdxForRichText(source: string) {
  const blocks = splitMarkdownBlocks(source.replace(/\r\n/g, '\n'))

  return blocks.map(protectBlock).join('\n\n')
}

export function restoreMdxFromRichText(source: string) {
  return source.replace(
    new RegExp(`${RAW_BLOCK_FENCE}\\n([\\s\\S]*?)\\n\`\`\``, 'g'),
    (_, raw: string) => raw.trim()
  )
}

export function createMdxComponentBlock() {
  return [
    '<Callout type="info">',
    '  在这里写自定义 MDX 组件内容',
    '</Callout>'
  ].join('\n')
}

function protectBlock(block: string) {
  const trimmed = block.trim()

  if (!trimmed || isFencedCodeBlock(trimmed) || !isRawMdxBlock(trimmed)) {
    return block
  }

  return `${RAW_BLOCK_FENCE}\n${trimmed}\n\`\`\``
}

function splitMarkdownBlocks(source: string) {
  const lines = source.split('\n')
  const blocks: string[] = []
  let current: string[] = []
  let fence: { marker: '`' | '~'; length: number } | null = null

  const pushCurrent = () => {
    blocks.push(current.join('\n'))
    current = []
  }

  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)

    if (fenceMatch) {
      const marker = fenceMatch[1][0] as '`' | '~'
      const length = fenceMatch[1].length

      if (!fence) {
        fence = { marker, length }
      } else if (marker === fence.marker && length >= fence.length) {
        fence = null
      }
    }

    if (!fence && line.trim() === '') {
      if (current.length > 0) {
        pushCurrent()
      }

      continue
    }

    current.push(line)
  }

  if (current.length > 0) {
    pushCurrent()
  }

  return blocks
}

function isFencedCodeBlock(block: string) {
  return /^ {0,3}(`{3,}|~{3,})/.test(block)
}

function isRawMdxBlock(block: string) {
  return (
    /^(import|export)\s/m.test(block) ||
    /^<[A-Z][\w.:-]*(\s|>|\/>)/m.test(block) ||
    /^<\/[A-Z][\w.:-]*>/m.test(block)
  )
}
