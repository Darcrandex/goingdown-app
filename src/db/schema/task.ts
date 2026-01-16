// 任务模型
import { integer, json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { userTable } from './user'

export const taskTable = pgTable('tasks', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userTable.id),

  rhTaskId: text('rh_task_id'),
  taskStatus: text('task_status').default('QUEUED'),
  taskResultData: json('task_result_data'),
  taskFailedReason: json('task_failed_reason'),

  // 积分消耗(需要平台内折算)
  balance: integer('balance').default(0).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export type Task = typeof taskTable.$inferSelect
