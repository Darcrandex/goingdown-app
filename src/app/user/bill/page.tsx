'use client'

import { getBills } from '@/actions/bill'
import { useQuery } from '@tanstack/react-query'

export default function Bill() {
  const { data } = useQuery({
    queryKey: ['bill', 'list'],
    queryFn: () => getBills(),
  })

  return (
    <>
      <h1>消费记录</h1>

      <ol className='m-6 list-decimal space-y-2'>
        {data?.map((v) => (
          <li key={v.id}>
            <p>{v.type}</p>
            <p>{v.points}</p>
          </li>
        ))}
      </ol>
    </>
  )
}
