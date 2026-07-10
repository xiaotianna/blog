import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { Renderer } from 'takumi-js/node'

const require = createRequire(import.meta.url)

const fontSources = [
  {
    path: require.resolve(
      '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2'
    ),
    weight: 400
  },
  {
    path: require.resolve(
      '@fontsource/noto-sans-sc/files/noto-sans-sc-latin-400-normal.woff2'
    ),
    weight: 400
  },
  {
    path: require.resolve(
      '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff2'
    ),
    weight: 700
  },
  {
    path: require.resolve(
      '@fontsource/noto-sans-sc/files/noto-sans-sc-latin-700-normal.woff2'
    ),
    weight: 700
  }
] as const

let rendererPromise: Promise<Renderer> | undefined

export function getOgRenderer() {
  rendererPromise ??= createOgRenderer()

  return rendererPromise
}

async function createOgRenderer() {
  const renderer = new Renderer()

  for (const source of fontSources) {
    const data = await readFile(source.path)

    await renderer.registerFont({
      data,
      name: `Noto Sans SC ${source.weight} ${source.path.includes('latin') ? 'Latin' : 'Chinese'}`,
      subsetOf: 'Noto Sans SC',
      weight: source.weight
    })
  }

  return renderer
}
