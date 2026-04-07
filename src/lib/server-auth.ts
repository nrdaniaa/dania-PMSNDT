import { verify } from './jwt'
import { prisma } from './prisma'

export async function getCurrentUser(token?: string) {
  if (!token) return null
  const payload = verify<{ sub: string }>(token)
  if (!payload?.sub) return null
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) return null
  const { passwordHash, verificationToken, ...publicUser } = user as any
  return publicUser
}
