export const CodeTheme = {
  name: 'next-docs',
  type: 'light' as const,
  colors: {
    'editor.background': 'transparent',
    'editor.foreground': 'var(--shiki-color-text)'
  },
  fg: 'var(--shiki-color-text)',
  bg: 'transparent',
  settings: [
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'keyword.operator',
        'punctuation.definition.template-expression'
      ],
      settings: { foreground: 'var(--shiki-token-keyword)' }
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'constant.other.symbol'
      ],
      settings: { foreground: 'var(--shiki-token-string-expression)' }
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: 'var(--shiki-token-comment)' }
    },
    {
      scope: ['entity.name.function', 'support.function', 'variable.function'],
      settings: { foreground: 'var(--shiki-token-function)' }
    },
    {
      scope: [
        'entity.name.tag',
        'support.class.component',
        'entity.name.type.class'
      ],
      settings: { foreground: 'var(--shiki-token-constant)' }
    },
    {
      scope: ['entity.other.attribute-name', 'variable.parameter'],
      settings: { foreground: 'var(--shiki-token-function)' }
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'variable.other.constant'
      ],
      settings: { foreground: 'var(--shiki-token-constant)' }
    },
    {
      scope: ['punctuation', 'meta.brace', 'meta.delimiter'],
      settings: { foreground: 'var(--shiki-token-punctuation)' }
    }
  ]
}
