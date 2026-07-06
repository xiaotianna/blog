import type { MarkdownMetadataData } from './parse-frontmatter'

interface MarkdownMetadataProps {
  metadata: MarkdownMetadataData
}

export const MarkdownMetadata = ({ metadata }: MarkdownMetadataProps) => {
  if (
    !metadata.title &&
    !metadata.description &&
    !metadata.version &&
    !metadata.lastUpdated
  ) {
    return null
  }

  return (
    <div className='not-prose mb-8'>
      {metadata.title ? (
        <h1 className='m-0 text-[40px] font-semibold leading-[1.16] tracking-normal text-(--ds-gray-1000)'>
          {metadata.title}
        </h1>
      ) : null}
      {metadata.description ? (
        <p className='mb-0 mt-4 max-w-190 text-[17px] leading-7 text-(--ds-gray-900)'>
          {metadata.description}
        </p>
      ) : null}
      <div className='mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-(--ds-gray-900)'>
        {metadata.version ? <span>v{metadata.version}</span> : null}
        {metadata.lastUpdated ? (
          <span>Updated {metadata.lastUpdated}</span>
        ) : null}
      </div>
    </div>
  )
}
