export default function Loading() {
  return (
    <main
      className='flex h-screen items-center justify-center'
      aria-busy='true'
      aria-live='polite'
    >
      <div className='flex flex-col items-center gap-4 text-muted-foreground'>
        <span className='sr-only'>页面加载中</span>
        <span className='relative inline-flex size-5'>
          <span className='absolute inset-0 rounded-full border-2 border-border' />
          <span className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground' />
        </span>
      </div>
    </main>
  )
}
