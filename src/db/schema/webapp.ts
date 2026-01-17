// AI应用模型
import { integer, json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const webappTable = pgTable('webapps', {
  id: uuid().primaryKey().defaultRandom(),
  name: text('name').notNull(), // 应用名称
  description: text('description'), // 应用描述
  coverList: text('cover_list').array(), // 应用封面(url)列表

  webappId: text('webapp_id'), // 关联RH Web应用ID
  workflowId: text('workflow_id'), // 关联RH工作流ID
  nodeInfoList: json('node_info_list'), // 节点入参

  likeCount: integer('like_count').default(0).notNull(), // 点赞数，默认0
  collectCount: integer('collect_count').default(0).notNull(), // 收藏数，默认0
  runCount: integer('run_count').default(0).notNull(), // 运行数，默认0

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export type Webapp = typeof webappTable.$inferSelect
