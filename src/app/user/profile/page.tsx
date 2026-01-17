'use client'

import { createOrder, updateOrder } from '@/actions/order'
import { OrderStatus } from '@/db/schema/order'
import { useUserInfo } from '@/query/useUserInfo'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from 'antd'
import { delay } from 'es-toolkit'
import Link from 'next/link'

export default function Profile() {
  const queryClient = useQueryClient()
  const userInfoQuery = useUserInfo()

  const chargeMutation = useMutation({
    mutationFn: async () => {
      const order = await createOrder()
      await delay(2000)
      await updateOrder(order.id, { status: OrderStatus.PAID })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [] })
    },
  })

  return (
    <>
      <h1>用户中心</h1>

      <div className='m-10 wrap-break-word'>
        <pre>{JSON.stringify(userInfoQuery.data, null, 2)}</pre>
      </div>

      <footer className='m-10 space-x-4'>
        <Button type='primary' onClick={() => chargeMutation.mutate()} loading={chargeMutation.isPending}>
          充值100
        </Button>

        <Link href='/user/bill'>消费记录</Link>
      </footer>

      <footer className='m-10 space-x-4'>
        <Link href='/user/tasks'>任务记录</Link>
      </footer>
    </>
  )
}
