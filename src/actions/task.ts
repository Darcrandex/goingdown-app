'use server'
import { db } from '@/db'
import { billTable, PointRecordType } from '@/db/schema/bill'
import { Task, TaskStatus, taskTable } from '@/db/schema/task'
import { userTable } from '@/db/schema/user'
import Big from 'big.js'
import { and, eq } from 'drizzle-orm'
import { checkToken } from './auth'
import { getTaskStatusAndResult, runWebapp, runWorkflow } from './rh'

// 检查是否有正在排队的任务
export async function checkQueuedTask() {
  const user = await checkToken()
  const list = await db
    .select()
    .from(taskTable)
    .where(and(eq(taskTable.userId, user.id), eq(taskTable.status, TaskStatus.QUEUED)))

  return list.length === 0
}

// 创建任务
export async function addTask(params: { webappId?: string; workflowId?: string; nodeInfoList: AppScope.NodeInfo[] }) {
  const user = await checkToken()

  const rhTask = params.webappId
    ? await runWebapp({ webappId: params.webappId, nodeInfoList: params.nodeInfoList })
    : params.workflowId
      ? await runWorkflow({ workflowId: params.workflowId, nodeInfoList: params.nodeInfoList })
      : null

  console.log('rh task', rhTask)

  if (rhTask?.code !== 0) {
    throw new Error('任务创建失败')
  }

  const [createdTask] = await db.insert(taskTable).values({ userId: user.id, taskId: rhTask.data.taskId }).returning()
  return createdTask
}

// 获取任务详情
export async function getTaskById(id: string) {
  const user = await checkToken()
  const [task] = await db.select().from(taskTable).where(eq(taskTable.id, id))
  if (!task) {
    throw new Error('任务不存在')
  }
  if (task.userId !== user.id) {
    throw new Error('权限不足')
  }

  if (task.status === TaskStatus.SUCCESS || task.status === TaskStatus.FAILED) {
    return task
  }

  // 调用RH API同步任务状态
  const rhTaskDetail = await getTaskStatusAndResult(task.taskId)
  let taskData: Partial<Task> = {}

  if (rhTaskDetail.code === 0 && Array.isArray(rhTaskDetail.data)) {
    const duration = rhTaskDetail.data.reduce((acc, cur) => acc + Number.parseInt(cur.taskCostTime), 0)
    const points = Number(-0.2 * duration).toFixed(2)
    taskData = { status: TaskStatus.SUCCESS, duration: duration, points, resultList: rhTaskDetail.data, errorMsg: '' }
  } else if (rhTaskDetail.code === 805 && typeof rhTaskDetail.data === 'object') {
    taskData = { status: TaskStatus.FAILED, duration: 0, resultList: [], errorMsg: rhTaskDetail.data }
  } else if (rhTaskDetail.code === 804) {
    taskData = { status: TaskStatus.RUNNING, duration: 0, resultList: [], errorMsg: '' }
  } else if (rhTaskDetail.code === 813) {
    taskData = { status: TaskStatus.QUEUED, duration: 0, resultList: [], errorMsg: '' }
  }

  const [updatedTask] = await db.update(taskTable).set(taskData).where(eq(taskTable.id, id)).returning()
  // 检查是否已记录积分
  const recordeds = await db
    .select()
    .from(billTable)
    .where(and(eq(billTable.taskId, id), eq(billTable.userId, user.id)))

  // 任务完成(成功)
  if (updatedTask.status === TaskStatus.SUCCESS && recordeds.length === 0) {
    // 同步更新积分
    const newPoints = Big(user.points).add(updatedTask.points).toString()
    await db.update(userTable).set({ points: newPoints }).where(eq(userTable.id, user.id))

    // 记录积分变动
    await db.insert(billTable).values({
      userId: user.id,
      type: PointRecordType.CONSUME,
      taskId: updatedTask.id,
      points: updatedTask.points,
      remark: '运行AI应用',
    })
  }

  return updatedTask
}

// 获取用户所有任务
export async function getTasks() {
  const user = await checkToken()
  const tasks = await db.select().from(taskTable).where(eq(taskTable.userId, user.id))
  return tasks
}
