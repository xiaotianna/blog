import { fileIconMap, filenameIconMap } from './icon-map'
import { fileStrategies, filenameStrategies } from './icon-strategies'

function normalizeValue(value?: string) {
  return value?.trim().toLowerCase() || ''
}

function getNormalizedFilename(filename?: string) {
  return normalizeValue(filename)?.replaceAll('\\', '/') || ''
}

function getBasename(filename?: string) {
  const normalizedFilename = getNormalizedFilename(filename)

  if (!normalizedFilename) {
    return ''
  }

  const segments = normalizedFilename.split('/')

  return segments[segments.length - 1] || ''
}

function matchByExactFileName(filename?: string) {
  const normalizedFilename = getNormalizedFilename(filename)
  const basename = getBasename(filename)

  if (!normalizedFilename) {
    return null
  }

  const strategy = filenameStrategies.find((item) =>
    item.fileNames?.includes(basename) || item.fileNames?.includes(normalizedFilename)
  )

  return strategy?.icon ?? null
}

function matchByGlobPattern(filename?: string) {
  const normalizedFilename = getNormalizedFilename(filename)
  const basename = getBasename(filename)

  if (!normalizedFilename) {
    return null
  }

  const strategy = filenameStrategies.find((item) =>
    item.patterns?.some((pattern) => pattern.test(basename) || pattern.test(normalizedFilename))
  )

  return strategy?.icon ?? null
}

function matchByLanguage(language?: string) {
  const normalizedLanguage = normalizeValue(language)

  if (!normalizedLanguage) {
    return null
  }

  const strategy = fileStrategies.find((item) => item.aliases.includes(normalizedLanguage))

  return strategy?.icon ?? null
}

export type LanguageIconKey = keyof typeof fileIconMap

export function LanguageIcon({
  language,
  filename,
}: {
  language?: string
  filename?: string
}) {
  const filenameIconKey =
    matchByExactFileName(filename) ??
    matchByGlobPattern(filename)

  if (filenameIconKey) {
    return filenameIconMap[filenameIconKey]
  }

  const fileIconKey =
    matchByLanguage(language) ??
    'text'

  return fileIconMap[fileIconKey]
}
