'use client'

import { getWorkfows } from '@/actions/workflow'
import { useUserInfo } from '@/query/useUserInfo'
import { useQuery } from '@tanstack/react-query'
import { App } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const { message } = App.useApp()
  const userInfoQuery = useUserInfo()

  const workflowsQuery = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkfows,
  })

  const onOpenWorkflow = (id: string) => {
    if (userInfoQuery.isError) {
      message.error('请先登录')
      router.push('/login')
      return
    }
    router.push(`/workflow/${id}`)
  }

  return (
    <>
      <header className='flex items-center space-x-4'>
        <p>{userInfoQuery.data?.email}</p>

        {userInfoQuery.isError && <Link href='/login'>登录</Link>}
        {userInfoQuery.isSuccess && <Link href='/user/profile'>用户中心</Link>}
      </header>

      <hr />

      <h1>Workflow List</h1>

      <ol className='m-6 list-decimal'>
        {workflowsQuery.data?.map((item) => (
          <li
            key={item.id}
            className='cursor-pointer underline hover:text-blue-500'
            onClick={() => onOpenWorkflow(item.id)}
          >
            {item.name}
          </li>
        ))}
      </ol>
    </>
  )
}
