'use client'

import { CopyCodeButton } from './copy-code-button'
import { LanguageIcon } from './language/language-icon'

interface CodeBlockHeaderProps {
  code: string
  filename?: string
  language: string
}

export const CodeBlockHeader = ({
  code,
  filename,
  language,
}: CodeBlockHeaderProps) => {
  const title = filename || language

  return (
    <div className='flex h-12 items-center rounded-t-md border-b border-(--ds-gray-400) bg-(--ds-background-200) pr-3 pl-4'>
      <div className='mr-auto flex min-w-0 items-center gap-2 text-[13px] text-(--ds-gray-900)'>
        <span
          className='inline-flex size-4 shrink-0 items-center justify-center text-(--ds-gray-900)'
          aria-hidden='true'
        >
          <LanguageIcon language={language} filename={filename} />
        </span>
        <span className='inline-block min-w-0 max-w-full truncate break-normal'>{title}</span>
      </div>
      <div className='flex self-stretch gap-1'>
        <CopyCodeButton code={code} />
      </div>
    </div>
  )
}
