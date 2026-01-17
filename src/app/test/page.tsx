'use client'

import { useQuery } from '@tanstack/react-query'
import { delay } from 'es-toolkit'
import { useState } from 'react'

const getSomething = async () => {
  await delay(100)
  const roll = Math.random()
  console.log('roll', roll)

  const running = roll < 0.8
  return {
    code: 0,
    data: roll,
    status: running ? 'running' : 'success',
    msg: running ? '运行中' : '操作成功',
  }
}

export default function TestPage() {
  const [isDone, setIsDone] = useState(false)
  const { data } = useQuery({
    enabled: !isDone,
    refetchInterval: 2000,
    queryKey: ['getSomething'],
    queryFn: async () => {
      const res = await getSomething()
      if (res.status === 'success') {
        setIsDone(true)
      }
      return res
    },
  })

  return (
    <div className='m-10 space-y-3 text-xl'>
      <h1>Test Page</h1>
      <p>isDone: {isDone.toString()}</p>
      <hr />

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
