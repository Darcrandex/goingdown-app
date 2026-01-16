// 积分账户(钱包)模型

import { doublePrecision, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { userTable } from './user'

export const walletTable = pgTable('wallets', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userTable.id), // 关联用户ID
  balance: doublePrecision('balance').default(0).notNull(), // 当前积分余额（核心字段）
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})
