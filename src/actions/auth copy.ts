'use server'
import ResetPasswordEmail from '@/components/ResetPasswordEmail'
import { db } from '@/db'
import { User, userTable } from '@/db/schema/user'
import { hashContent, verifyContent } from '@/utils/hash.server'
import { render } from '@react-email/render'
import { and, eq } from 'drizzle-orm'
import { omit } from 'es-toolkit'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

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

  await db.insert(userTable).values({
    nickname: email.split('@')[0],
    email,
    password: await hashContent(password),
  })
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

export async function sendResetPasswordEmail(email: string) {
  const sign = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1H' })

  const headerList = await headers()
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const host = headerList.get('host')
  const baseUrl = `${protocol}://${host}`
  const resetUrl = `${baseUrl}/reset-password?sign=${sign}`

  const appName = ' nextjs Auth DB Template'
  const adminEmail = process.env.RESEND_ADMIN_EMAIL!
  const { error } = await resend.emails.send({
    from: `${appName} <onboarding@resend.dev>`,
    to: process.env.NODE_ENV === 'development' ? [adminEmail] : [email],
    subject: 'Reset Password',
    html: await render(ResetPasswordEmail({ resetUrl })),
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function resetPassword(sign: string, newPassword: string) {
  try {
    const decoded = jwt.verify(sign, process.env.JWT_SECRET!) as { email: string }
    const [user] = await db.select().from(userTable).where(eq(userTable.email, decoded.email))
    if (!user) {
      throw new Error('User not found')
    }

    const hashedPassword = await hashContent(newPassword || '')
    await db.update(userTable).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(userTable.id, user.id))

    const cookieStore = await cookies()
    cookieStore.delete('token')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    } else {
      throw new Error('Reset password failed')
    }
  }
}
