'use client'

import { getWebappList } from '@/actions/webapp'
import { useQuery } from '@tanstack/react-query'
import { Button } from 'antd'
import Link from 'next/link'

export default function Webapp() {
  const { data } = useQuery({
    queryKey: ['webapp', 'list'],
    queryFn: () => getWebappList(),
  })

  return (
    <div>
      <h1 className='text-center text-2xl font-bold'>webapp 管理页面</h1>

      <header>
        <Button type='primary' href='/admin/webapp/edit'>
          添加 webapp
        </Button>
      </header>

      <ol className='m-10 list-decimal space-y-4'>
        {data?.map((webapp) => (
          <li key={webapp.id}>
            <Link href={`/admin/webapp/edit?id=${webapp.id}`}>{webapp.name}</Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
