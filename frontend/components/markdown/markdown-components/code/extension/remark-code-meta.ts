type MarkdownNodeData = {
  hProperties?: Record<string, unknown>
  [key: string]: unknown
}

export type MarkdownNode = {
  type?: string
  meta?: string
  lang?: string
  value?: string
  data?: MarkdownNodeData
  children?: MarkdownNode[]
  [key: string]: unknown
}

type CodeMetaValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number>

type CodeMetaGetter = keyof MarkdownNode | ((node: MarkdownNode) => CodeMetaValue)

export type RemarkCodeMetaOptions = {
  properties?: Record<string, CodeMetaGetter>
  shouldTransform?: (node: MarkdownNode) => boolean
}

function readCodeMetaValue(node: MarkdownNode, getter: CodeMetaGetter) {
  if (typeof getter === 'function') return getter(node)

  const value = node[getter]

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    Array.isArray(value)
  ) {
    return value
  }

  return undefined
}

function visitMarkdownNode(
  node: MarkdownNode,
  visitor: (node: MarkdownNode) => void
) {
  visitor(node)

  if (!Array.isArray(node.children)) return

  for (const child of node.children) {
    visitMarkdownNode(child, visitor)
  }
}

export function createRemarkCodeMetaPlugin(options: RemarkCodeMetaOptions = {}) {
  const {
    properties = {
      'data-meta': 'meta',
      'data-code-block': () => true
    },
    shouldTransform = (node) => node.type === 'code'
  } = options

  return function remarkCodeMeta() {
    return function transformCodeMeta(tree: MarkdownNode) {
      visitMarkdownNode(tree, (node) => {
        if (!shouldTransform(node)) return

        const hProperties: Record<string, unknown> = {
          ...node.data?.hProperties
        }

        for (const [propertyName, getter] of Object.entries(properties)) {
          const value = readCodeMetaValue(node, getter)

          if (value === undefined || value === null || value === '') continue

          hProperties[propertyName] = value
        }

        node.data = {
          ...node.data,
          hProperties
        }
      })
    }
  }
}

export const remarkCodeMeta = createRemarkCodeMetaPlugin()
