// 用户模型
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  nickname: text('nickname').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').unique(),
  role: text('role').default('user'), // 'user' or 'admin'

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export type User = typeof userTable.$inferSelect
