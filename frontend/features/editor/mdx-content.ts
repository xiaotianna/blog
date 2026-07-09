const RAW_BLOCK_LANGUAGE = 'mdx-raw-block'
const RAW_BLOCK_FENCE = '```' + RAW_BLOCK_LANGUAGE

export function protectMdxForRichText(source: string) {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/)

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

  if (!trimmed || !isRawMdxBlock(trimmed)) {
    return block
  }

  return `${RAW_BLOCK_FENCE}\n${trimmed}\n\`\`\``
}

function isRawMdxBlock(block: string) {
  return (
    /^(import|export)\s/m.test(block) ||
    /^<[A-Z][\w.:-]*(\s|>|\/>)/m.test(block) ||
    /^<\/[A-Z][\w.:-]*>/m.test(block)
  )
}
