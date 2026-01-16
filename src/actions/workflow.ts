'use server'

import { db } from '@/db'
import { workflowTable } from '@/db/schema/workflow'
import { eq } from 'drizzle-orm'

export async function addWorkfow(params: {
  id?: string
  workflowId: string
  name: string
  nodeInfoList: AppScope.NodeInfoConfig[]
}) {
  const { workflowId, name, nodeInfoList } = params
  await db.insert(workflowTable).values({
    rh_workflowId: workflowId,
    name,
    config: JSON.stringify(nodeInfoList),
  })
}

export async function updateWorkfow(params: {
  id: string
  workflowId: string
  name: string
  nodeInfoList: AppScope.NodeInfoConfig[]
}) {
  const { id, workflowId, name, nodeInfoList } = params
  await db
    .update(workflowTable)
    .set({
      rh_workflowId: workflowId,
      name,
      config: JSON.stringify(nodeInfoList),
    })
    .where(eq(workflowTable.id, id))
}

export async function getWorkfows() {
  const workflows = await db.select().from(workflowTable)
  return workflows
}

export async function getWorkfowById(id: string) {
  const workflow = await db.select().from(workflowTable).where(eq(workflowTable.id, id)).limit(1)
  return workflow[0]
}

export async function deleteWorkfow(id: string) {
  await db.delete(workflowTable).where(eq(workflowTable.id, id))
}
