# Code block remark helpers

## 目的

Markdown fenced code block 支持在语言名后追加 meta 信息：

````md
```tsx filename="app/page.tsx"
export default function Page() {}
```
````

在 remark 的 mdast 阶段，这段 `filename="app/page.tsx"` 存在于 code node 的 `meta` 字段。
但 `react-markdown` 的 `components.code` 收到的是转换后的 hast element，不会直接拿到
`props.meta`。

`remarkCodeMeta` 使用 unified 官方支持的 `node.data.hProperties` 通道，把 mdast code node
上的信息挂到最终 hast/React 属性里。当前默认行为是：

```ts
node.meta -> data-meta
code block -> data-code-block
```

这样代码块组件就能从 `node.properties['data-meta']` 读取原始 meta 字符串，并解析出
`filename` 等 UI 信息；同时通过 `data-code-block` 区分 fenced code block 和 inline code。

## 默认用法

```tsx
import ReactMarkdown from 'react-markdown'
import { remarkCodeMeta } from './markdown-components/code/extennal'

export function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkCodeMeta]}>
      {children}
    </ReactMarkdown>
  )
}
```

然后在 `components.code` 里读取 `data-meta`：

```ts
const meta = getStringProperty(node, 'data-meta')
```

## 自定义属性

如果后续不只需要 `meta`，可以用 `createRemarkCodeMetaPlugin` 创建一个自定义插件。

```ts
import { createRemarkCodeMetaPlugin } from './markdown-components/code/extennal'

const remarkCodeBlockProps = createRemarkCodeMetaPlugin({
  properties: {
    'data-meta': 'meta',
    'data-code-block': () => true,
    'data-language': 'lang',
    'data-code-length': (node) => node.value?.length
  }
})
```

`properties` 的 key 是最终写入 hast/React 的属性名，value 可以是：

- code node 上的字段名，比如 `meta`、`lang`、`value`
- 一个函数，接收完整 code node，并返回要写入的值

返回 `undefined`、`null` 或空字符串时，该属性不会写入。

## 何时需要

需要从代码块 fence 后面的 meta 信息驱动 UI 时使用它，例如：

- 显示文件名：`filename="app/page.tsx"`
- 传递行号设置：`lineNumbers`
- 传递高亮范围：`highlight="1,3-5"`
- 保留自定义代码块参数，交给代码块组件自行解析

如果只需要语言名和普通语法高亮，不需要这个插件；语言名已经会通过 `className`
以 `language-tsx` 这类形式传给 `components.code`。
