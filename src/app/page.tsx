'use client'

import { getWorkfows } from '@/actions/workflow'
import { useUserInfo } from '@/query/useUserInfo'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export default function Home() {
  const userInfoQuery = useUserInfo()

  const workflowsQuery = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkfows,
  })

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
          <li key={item.id}>
            <Link href={`/workflow/${item.id}`}>{item.name}</Link>
          </li>
        ))}
      </ol>
    </>
  )
}
