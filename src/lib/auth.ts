import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || ''
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment')

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || ''

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string) {
  return jwt.sign({ userId, sub: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; sub: string }
  } catch {
    return null
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function isAllowedEmailDomain(email: string): boolean {
  if (!ALLOWED_DOMAIN) return true

  const allowedDomains = ALLOWED_DOMAIN
    .split(',')
    .map((domain) => domain.trim().toLowerCase())

  const normalizedEmail = email.toLowerCase()

  return allowedDomains.some((domain) => {
    const cleanDomain = domain.startsWith('@') ? domain : `@${domain}`
    return normalizedEmail.endsWith(cleanDomain)
  })
}

export async function getCurrentUser(token?: string) {
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  return prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      emailVerified: true,
      biography: true,
      employeeId: true,
      jobTitle: true,
      department: true,
      company: true,
      supervisorName: true,
      phoneNumber: true,
      contactTelegram: true,
      contactWhatsapp: true,
      employmentType: true,
      role: true,
      lastLoginAt: true,
    },
  })
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({
    where: { userId },
  })

  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken) {
      return { success: false, error: 'Invalid verification token' }
    }

    if (verificationToken.expiresAt && verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })

      return { success: false, error: 'Verification token has expired' }
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    })

    await prisma.verificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    })

    return { success: true, userId: verificationToken.userId }
  } catch (error) {
    console.error('Email verification error:', error)
    return { success: false, error: 'Verification failed' }
  }
}

// Legacy support functions for backward compatibility
export function sign(payload: object, opts?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...(opts || {}) })
}

export function verify<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}