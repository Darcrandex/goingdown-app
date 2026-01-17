'use server'
import { db } from '@/db'
import { User, userTable } from '@/db/schema/user'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// 登录/注册
export async function userLogin(params: { phone: string; code: string }) {
  const { phone, code } = params

  // 验证手机号
  if (!phone.trim() || phone.trim().length !== 11) {
    throw new Error('Invalid phone')
  }

  // 验证验证码
  if (!code.trim()) {
    throw new Error('Invalid code')
  }

  let finalUser: User | undefined = undefined

  // 验证用户是否存在
  const [existingUser] = await db.select().from(userTable).where(eq(userTable.phone, phone.trim())).limit(1)

  if (!existingUser) {
    // 注册新用户
    const [newUser] = await db
      .insert(userTable)
      .values({ phone: phone.trim(), nickname: `用户${phone.trim().slice(-4)}` })
      .returning()
    finalUser = newUser
  } else {
    finalUser = existingUser
  }

  // 生成 token
  const token = jwt.sign({ userId: finalUser.id }, process.env.JWT_SECRET!, { expiresIn: '7Day' })
  const cookieStore = await cookies()
  cookieStore.set('token', token)
  revalidatePath('/')
}

// 检查 token (返回用户信息)
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

// 获取用户信息
export async function getUserInfo() {
  const user = await checkToken()
  return user
}

// 登出
export async function userLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  revalidatePath('/')
}
