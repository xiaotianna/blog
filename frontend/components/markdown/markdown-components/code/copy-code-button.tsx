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
      className='flex size-8 cursor-pointer items-center justify-center self-center rounded-[5px] border-0 bg-transparent p-0 text-(--ds-gray-900) transition-colors hover:bg-(--ds-gray-alpha-200) focus-visible:[box-shadow:var(--ds-focus-ring,0_0_0_2px_var(--ds-background-100),0_0_0_4px_var(--ds-blue-700))] focus-visible:outline-none data-[copied=true]:text-(--ds-green-900)'
      aria-label={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
      data-copied={isCopied}
      onClick={() => void copy(code.replace(/\n$/, ''))}
    >
      {isCopied ? (
        <CheckIcon className='size-4' />
      ) : (
        <CopyIcon className='size-4' />
      )}
    </button>
  )
}
