// 用户模型
import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  role: text('role').default('user'), // 'user' or 'admin'
  phone: text('phone').notNull().unique(), // 用户只能使用手机+验证码登录

  // 用户积分, 使用字符串保留精度
  points: numeric('points').default('0').notNull(),

  nickname: text('nickname'),
  email: text('email').unique(),
  password: text('password'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export type User = typeof userTable.$inferSelect
