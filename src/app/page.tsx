'use client'

import { getWebappList } from '@/actions/webapp'
import { useUserInfo } from '@/query/useUserInfo'
import { useQuery } from '@tanstack/react-query'
import { App } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const { message } = App.useApp()
  const userInfoQuery = useUserInfo()

  const { data } = useQuery({
    queryKey: ['webapp', 'list'],
    queryFn: () => getWebappList(),
  })

  const beforeNavigate = (id: string) => {
    if (userInfoQuery.isError) {
      message.error('请先登录')
      router.push('/login')
      return
    }
    router.push(`/webapp/${id}`)
  }

  return (
    <>
      <header className='flex items-center space-x-4'>
        <p>{userInfoQuery.data?.nickname}</p>

        {userInfoQuery.isError && <Link href='/login'>登录</Link>}
        {userInfoQuery.isSuccess && <Link href='/user/profile'>用户中心</Link>}
      </header>

      <hr />

      <h1>webapp List</h1>

      <ol className='m-6 list-decimal space-y-2'>
        {data?.map((item) => (
          <li
            key={item.id}
            className='cursor-pointer underline hover:text-blue-500'
            onClick={() => beforeNavigate(item.id)}
          >
            {item.name}
          </li>
        ))}
      </ol>
    </>
  )
}
