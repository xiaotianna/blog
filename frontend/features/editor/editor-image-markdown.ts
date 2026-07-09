export type EditorImageInput = {
  alt: string
  src: string
}

function escapeMarkdownImageText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/]/g, '\\]')
}

function escapeMarkdownImageUrl(value: string) {
  return value.replace(/\)/g, '\\)')
}

export function createMarkdownImage({ alt, src }: EditorImageInput) {
  return `![${escapeMarkdownImageText(alt.trim())}](${escapeMarkdownImageUrl(src.trim())})`
}
