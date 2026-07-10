'use client'

import Image from 'next/image'
import { HoverCard } from 'radix-ui'

type BlogArticleThumbnailProps = {
  src: string
  title: string
}

export function BlogArticleThumbnail({
  src,
  title
}: BlogArticleThumbnailProps) {
  return (
    <HoverCard.Root
      closeDelay={100}
      openDelay={150}
    >
      <HoverCard.Trigger asChild>
        <span className='mt-1 block h-12 w-20 shrink-0'>
          <Image
            alt={`${title} 封面`}
            className='size-full rounded-md border border-border object-cover'
            height={48}
            src={src}
            unoptimized
            width={80}
          />
        </span>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          align='start'
          className='z-50 overflow-hidden rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
          collisionPadding={16}
          side='bottom'
          sideOffset={8}
        >
          <Image
            alt={`${title} 封面预览`}
            className='h-[180px] w-80 rounded-lg object-cover'
            height={180}
            src={src}
            unoptimized
            width={320}
          />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
