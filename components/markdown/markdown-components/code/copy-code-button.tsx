'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

interface CopyCodeButtonProps {
  code: string
}

export const CopyCodeButton = ({ code }: CopyCodeButtonProps) => {
  const { copy, isCopied } = useCopyToClipboard()

  return (
    <button
      type='button'
      className='next-docs-code-copy'
      aria-label={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
      data-copied={isCopied}
      onClick={() => void copy(code.replace(/\n$/, ''))}
    >
      {isCopied ? (
        <CheckIcon className='next-docs-code-copy-icon size-4' />
      ) : (
        <CopyIcon className='next-docs-code-copy-icon size-4' />
      )}
    </button>
  )
}
