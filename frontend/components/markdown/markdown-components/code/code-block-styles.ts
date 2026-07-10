import { type CSSProperties } from 'react'

export const codeThemeVariables = {
  '--shiki-color-text': 'var(--ds-gray-1000)',
  '--shiki-color-background': 'transparent',
  '--shiki-token-constant': 'var(--ds-blue-900)',
  '--shiki-token-string': 'var(--ds-green-900)',
  '--shiki-token-comment': 'var(--ds-gray-900)',
  '--shiki-token-keyword': 'var(--ds-pink-900)',
  '--shiki-token-parameter': 'var(--ds-amber-900)',
  '--shiki-token-function': 'var(--ds-purple-900)',
  '--shiki-token-string-expression': 'var(--ds-green-900)',
  '--shiki-token-punctuation': 'var(--ds-gray-1000)',
  '--shiki-token-link': 'var(--ds-green-900)'
} as CSSProperties

export const codeBlockClassName =
  'grid rounded-none border-0 bg-transparent p-0 text-left font-mono text-[13px]! leading-5 whitespace-pre text-(--ds-gray-1000) [font-variant-ligatures:none] break-normal hyphens-none [&_.highlighted-line]:relative [&_.highlighted-line]:min-h-5 [&_.highlighted-line]:bg-(--ds-blue-300) [&_.highlighted-line]:px-5 [&_.highlighted-line]:shadow-[inset_2px_0_0_0_var(--ds-blue-900)] [&_.highlighted-line>span]:inline-block [&_.line]:relative [&_.line]:min-h-5 [&_.line]:px-5 [&_.line>span]:inline-block [&_.line[data-active=true]]:bg-(--ds-amber-300) [&_.line[data-active=true]]:shadow-[inset_2px_0_0_0_var(--ds-amber-900)] **:data-[added=true]:bg-(--ds-green-300) **:data-[added=true]:shadow-[inset_2px_0_0_0_var(--ds-green-900)] **:data-[highlighted=true]:bg-(--ds-blue-300) **:data-[highlighted=true]:shadow-[inset_2px_0_0_0_var(--ds-blue-900)] **:data-[removed=true]:bg-(--ds-red-300) **:data-[removed=true]:shadow-[inset_2px_0_0_0_var(--ds-red-900)]'
