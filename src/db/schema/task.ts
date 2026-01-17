// 任务模型
import { integer, json, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { userTable } from './user'

export enum TaskStatus {
  QUEUED = 'QUEUED', // 待处理
  RUNNING = 'RUNNING', // 运行中
  SUCCESS = 'SUCCESS', // 已完成
  FAILED = 'FAILED', // 已失败
}

export const taskTable = pgTable('tasks', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userTable.id),

  // 任务记录和运行结果只保留7天
  taskId: text('task_id').notNull(), // 关联RH任务ID
  status: text('status').default(TaskStatus.QUEUED).notNull(), // 任务状态，默认QUEUED
  duration: integer('duration').default(0).notNull(), // 运行时长(秒)
  resultList: json('result_list'), // 任务运行结果列表
  errorMsg: json('error_msg'), // 任务运行错误信息

  // 积分消耗(需要平台内折算)
  points: numeric('points').default('0').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export type Task = typeof taskTable.$inferSelect
