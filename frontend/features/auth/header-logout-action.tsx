import { Button } from '@/components/ui/button'
import { logoutAction } from '@/features/auth/actions'
import { hasAuthToken } from '@/lib/server/auth'
import { LogOut } from 'lucide-react'

export async function HeaderLogoutAction() {
  const isLoggedIn = await hasAuthToken()

  if (!isLoggedIn) {
    return null
  }

  return (
    <form action={logoutAction}>
      <Button
        type='submit'
        variant='outline'
        size='icon'
        aria-label='退出登录'
        title='退出登录'
      >
        <LogOut className='size-4' />
      </Button>
    </form>
  )
}
