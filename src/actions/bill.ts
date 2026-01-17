'use server'
import { db } from '@/db'
import { billTable } from '@/db/schema/bill'
import { eq } from 'drizzle-orm'
import { checkToken } from './auth'

// 获取所有消费记录
export async function getBills() {
  const user = await checkToken()
  const bills = await db.select().from(billTable).where(eq(billTable.userId, user.id))
  return bills
}
