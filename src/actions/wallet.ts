'use server'
import { db } from '@/db'
import { walletTable } from '@/db/schema/wallet'
import { eq } from 'drizzle-orm'
import { checkToken } from './auth'

export async function getUserWallet() {
  const user = await checkToken()
  const [wallet] = await db.select().from(walletTable).where(eq(walletTable.userId, user.id)).limit(1)
  if (!wallet) {
    throw new Error('Wallet not found')
  }
  return wallet
}
