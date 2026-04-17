import { createVerificationToken } from '@/lib/auth'
import { sign } from '@/lib/jwt'
import { sendVerificationEmail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'register') {
      const body = await request.json()
      const { email, username, password } = body

      if (!email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
      }

      const existing = await prisma.user.findUnique({
        where: { email },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email,
          name: username || email.split('@')[0],
          password: hashedPassword,
          role: 'customer',
          emailVerified: false,
        },
      })

      const verificationToken = await createVerificationToken(user.id)

      sendVerificationEmail(email, verificationToken).catch((e) =>
        console.error('email send failed', e)
      )

      return NextResponse.json({ ok: true })
    }

    if (action === 'login') {
      const body = await request.json()
      const { email, password } = body

      if (!email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json({ error: 'No account found' }, { status: 404 })
      }

      if (!user.emailVerified) {
        return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
      }

      const ok = await bcrypt.compare(password, user.password)

      if (!ok) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      const token = sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      })

      const res = NextResponse.json({ ok: true })
      res.cookies.set('auth-token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      return res
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}