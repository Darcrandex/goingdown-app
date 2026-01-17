'use server'
import { db } from '@/db'
import { Webapp, webappTable } from '@/db/schema/webapp'
import { eq } from 'drizzle-orm'
import { checkToken } from './auth'

// 获取 app 列表
export async function getWebappList() {
  const webappList = await db.select().from(webappTable)
  return webappList as Webapp[]
}

// 获取 app 详情
export async function getWebappById(id: string) {
  const [webappDetail] = await db.select().from(webappTable).where(eq(webappTable.id, id))
  return webappDetail
}

// 新增或更新 app
export async function upsertWebapp(params: Omit<Webapp, 'id'> & { id?: string }) {
  const user = await checkToken()
  if (user.role !== 'admin') {
    throw new Error('权限不足')
  }

  const { id, ...rest } = params
  if (id) {
    // 更新
    await db.update(webappTable).set(rest).where(eq(webappTable.id, id))
  } else {
    // 新增
    await db.insert(webappTable).values(rest)
  }
}

// 删除 app
export async function deleteWebapp(id: string) {
  const user = await checkToken()
  if (user.role !== 'admin') {
    throw new Error('权限不足')
  }

  await db.delete(webappTable).where(eq(webappTable.id, id))
}
