'use client'

import { useUserInfo } from '@/query/useUserInfo'
import { PropsWithChildren } from 'react'

export default function AdminLayout(props: PropsWithChildren) {
  const userInfoQuery = useUserInfo()

  if (userInfoQuery.data?.role !== 'admin') {
    return <p className='m-6 text-center text-red-500'>您没有权限访问此页面</p>
  }

  return (
    <div>
      <h1 className='text-center text-2xl font-bold'>admin 管理页面</h1>
      {props.children}
    </div>
  )
}
