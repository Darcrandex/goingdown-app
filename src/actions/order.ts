'use server'
import { db } from '@/db'
import { billTable, PointRecordType } from '@/db/schema/bill'
import { Order, OrderStatus, orderTable } from '@/db/schema/order'
import { userTable } from '@/db/schema/user'
import Big from 'big.js'
import { eq } from 'drizzle-orm'
import { checkToken } from './auth'

// 获取所有订单
export async function getOrders() {
  const user = await checkToken()
  const orders = await db.select().from(orderTable).where(eq(orderTable.userId, user.id))
  return orders
}

// 创建订单
export async function createOrder() {
  const user = await checkToken()
  const [createdOrder] = await db
    .insert(orderTable)
    .values({
      userId: user.id,

      // 测试参数
      amount: 100,
      paymentId: Date.now().toString(),
      points: '1000',
    })
    .returning()

  return createdOrder
}

// 修改订单
export async function updateOrder(orderId: string, updates: Partial<Order>) {
  const user = await checkToken()
  const [order] = await db.select().from(orderTable).where(eq(orderTable.id, orderId))

  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.userId !== user.id) {
    throw new Error('没有权限修改此订单')
  }

  const [updatedOrder] = await db.update(orderTable).set(updates).where(eq(orderTable.id, orderId)).returning()

  // 订单完成
  if (updates.status === OrderStatus.PAID) {
    // 同步更新积分
    const newPoints = Big(user.points).add(updatedOrder.points).toString()
    await db.update(userTable).set({ points: newPoints }).where(eq(userTable.id, user.id))

    // 记录积分变动
    await db.insert(billTable).values({
      userId: user.id,
      type: PointRecordType.RECHARGE,
      orderId: updatedOrder.id,
      points: updatedOrder.points,
      remark: '积分充值',
    })
  }

  return updatedOrder
}
