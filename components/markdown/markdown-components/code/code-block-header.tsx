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
  return (
    <div className='next-docs-code-header'>
      <div className='next-docs-code-title'>
        <span
          className='next-docs-code-file-icon'
          aria-hidden='true'
        >
          <LanguageIcon language={language} />
        </span>
        <span className='next-docs-code-filename'>{filename}</span>
      </div>
      <div className='next-docs-code-actions'>
        <CopyCodeButton code={code} />
      </div>
    </div>
  )
}
