// 可用工作流模型

import { json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const workflowTable = pgTable('workflows', {
  id: uuid().primaryKey().defaultRandom(),
  name: text('name').notNull(),
  rh_workflowId: text('rh_workflow_id').notNull(), // 关联RH工作流ID
  config: json('config'), // 工作流配置（JSON格式）
  description: text('description'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})
