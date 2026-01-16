'use server'

import { db } from '@/db'
import { Task, taskTable } from '@/db/schema/task'
import { eq } from 'drizzle-orm'
import { checkToken } from './auth'
import { runWokflowTask } from './rh'

export async function addTask(params: { workflowId: string; nodeInfoList: AppScope.NodeInfo[] }) {
  const user = await checkToken()
  const rhTask = await runWokflowTask(params)

  console.log('create task====> ', rhTask)

  const [task] = await db
    .insert(taskTable)
    .values({
      userId: user.id,
      rhTaskId: rhTask.taskId,
      taskStatus: rhTask.taskStatus,
    })
    .returning()

  return { ...rhTask, id: task.id }
}

export async function updateTask(params: Partial<Task> & { id: string }) {
  await checkToken()
  await db.update(taskTable).set(params).where(eq(taskTable.id, params.id))
}

export async function getTasks() {
  const user = await checkToken()
  const tasks = await db.select().from(taskTable).where(eq(taskTable.userId, user.id))
  return tasks
}
