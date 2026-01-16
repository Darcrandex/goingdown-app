// 积分变动记录模型

import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { orderTable } from './order'
import { taskTable } from './task'
import { userTable } from './user'
import { walletTable } from './wallet'

// 积分变动类型枚举
export enum PointRecordType {
  RECHARGE = 'recharge', // 充值增加
  CONSUME = 'consume', // 消费扣除
  REFUND = 'refund', // 退款扣回
  ADJUST = 'adjust', // 管理员调整
  EXPIRY = 'expiry', // 积分过期
}

export const billTable = pgTable('bills', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userTable.id), // 关联用户ID
  walletId: uuid('wallet_id').references(() => walletTable.id), // 关联钱包ID
  type: text('type').default(PointRecordType.RECHARGE).notNull(), // 变动类型（默认充值）
  orderId: uuid('order_id').references(() => orderTable.id), // 关联订单ID(充值时)
  taskId: uuid('task_id').references(() => taskTable.id), // 关联任务ID(任务运行消费时)
  balance: integer('balance').default(0).notNull(), // 积分变动值（核心字段）
  remark: text('remark'), // 变动备注（可选）

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})
