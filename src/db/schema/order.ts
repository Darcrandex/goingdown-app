// 积分充值订单模型

import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { userTable } from './user'

// 充值订单状态枚举
export enum RechargeOrderStatus {
  PENDING = 'pending', // 待支付
  PAID = 'paid', // 已支付（积分已到账）
  FAILED = 'failed', // 支付失败
  REFUNDED = 'refunded', // 已退款（积分扣回）
  CANCELLED = 'cancelled', // 已取消
}

export const orderTable = pgTable('orders', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userTable.id), // 关联用户ID
  amount: integer('amount').default(0).notNull(), // 订单金额（核心字段）
  status: text('status').default(RechargeOrderStatus.PENDING).notNull(), // 订单状态（默认待处理）
  payType: text('pay_type').default('wechat').notNull(), // 支付类型（默认微信）
  payTime: timestamp('pay_time'), // 支付时间
  paymentId: text('payment_id'), // 支付流水号（微信/支付宝）
  balance: integer('balance').default(0).notNull(), // 订单积分金额
  remark: text('remark'), // 订单备注

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})
