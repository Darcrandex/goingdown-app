'use server'

import { db } from '@/db'
import { walletTable } from '@/db/schema/wallet'
import { eq } from 'drizzle-orm'
import { getUserWallet } from './wallet'

export async function updateBalance(balance: number) {
  const wallet = await getUserWallet()
  const prevBalance = wallet.balance
  const nextBalance = Math.max(0, prevBalance + balance)

  await db.update(walletTable).set({ balance: nextBalance }).where(eq(walletTable.id, wallet.id))
}
