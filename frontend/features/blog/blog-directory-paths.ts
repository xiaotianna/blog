import type { BlogDirectoryOption } from './blog-data'

export type BlogDirectoryPathOption = BlogDirectoryOption

export const ROOT_DIRECTORY_PATH = '__root__'

export function getDefaultDirectoryPath(
  options: BlogDirectoryPathOption[],
  activePath?: string
) {
  if (!activePath) {
    return ''
  }

  return options.find((option) => option.path === activePath)?.path ?? ''
}
