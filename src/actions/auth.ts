'use server'
import { db } from '@/db'
import { User, userTable } from '@/db/schema/user'
import { walletTable } from '@/db/schema/wallet'
import { hashContent, verifyContent } from '@/utils/hash.server'
import { and, eq } from 'drizzle-orm'
import { omit } from 'es-toolkit'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function userSignUp(params: { email: string; password: string }) {
  const { email, password } = params

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(and(eq(userTable.email, email)))
    .limit(1)

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const [createdUser] = await db
    .insert(userTable)
    .values({
      nickname: email.split('@')[0],
      email,
      password: await hashContent(password),
    })
    .returning()

  // 创建关联的钱包
  await db.insert(walletTable).values({ userId: createdUser.id, balance: 100 })
}

export async function userSignIn(params: { email: string; password: string }) {
  const { email, password } = params

  const [matchedUser] = await db
    .select()
    .from(userTable)
    .where(and(eq(userTable.email, email)))
    .limit(1)

  if (!matchedUser) {
    throw new Error('User with this email does not exist')
  }

  const isPasswordValid = await verifyContent(password, matchedUser.password)

  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  const token = jwt.sign({ userId: matchedUser.id }, process.env.JWT_SECRET!, { expiresIn: '1Day' })
  const cookieStore = await cookies()
  cookieStore.set('token', token)
  revalidatePath('/')
}

export async function getUserInfo(omitPassword: boolean = true) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) {
    throw new Error('No token found')
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  const [user] = await db.select().from(userTable).where(eq(userTable.id, decoded.userId)).limit(1)
  if (!user) {
    throw new Error('User not found')
  }

  return omitPassword ? omit(user, ['password']) : user
}

export async function userSignOut() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  revalidatePath('/')
}

export async function updatePassword(params: { oldPassword: string; newPassword: string }) {
  const { oldPassword, newPassword } = params

  const user = (await getUserInfo(false)) as User
  const isPasswordValid = await verifyContent(oldPassword, user.password)
  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  await db
    .update(userTable)
    .set({ password: await hashContent(newPassword) })
    .where(eq(userTable.id, user.id))
}

export async function checkToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) {
    throw new Error('No token found')
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  const [user] = await db.select().from(userTable).where(eq(userTable.id, decoded.userId)).limit(1)
  if (!user) {
    throw new Error('User not found')
  }

  return user
}
