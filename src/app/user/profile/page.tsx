'use client'

import { useUserInfo } from '@/query/useUserInfo'

export default function Profile() {
  const userInfoQuery = useUserInfo()

  return (
    <>
      <h1>用户中心</h1>

      <div className='m-10 wrap-break-word'>
        <pre>{JSON.stringify(userInfoQuery.data, null, 2)}</pre>
      </div>
    </>
  )
}
