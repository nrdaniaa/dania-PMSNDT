import { sendWelcomeEmail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

async function verifyToken(token: string) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!tokenRecord) {
    return { success: false, error: 'Invalid verification token' }
  }

  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: tokenRecord.id },
    })

    return { success: false, error: 'Verification token has expired' }
  }

  if (!tokenRecord.user.emailVerified) {
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    })
  }

  await prisma.verificationToken.deleteMany({
    where: { userId: tokenRecord.userId },
  })

  return {
    success: true,
    userId: tokenRecord.user.id,
    email: tokenRecord.user.email,
    name: tokenRecord.user.name,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const result = await verifyToken(token)

    if (!result.success) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'verification_failed')
      return NextResponse.redirect(redirectUrl)
    }

    try {
      if (result.email) {
        await sendWelcomeEmail(result.email, result.name || 'User')
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error)
    }

    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('verified', '1')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Email verification error:', error)

    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', 'verification_failed')
    return NextResponse.redirect(redirectUrl)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const result = await verifyToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      )
    }

    try {
      if (result.email) {
        await sendWelcomeEmail(result.email, result.name || 'User')
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error)
    }

    return NextResponse.json({
      message: 'Email verified successfully! You can now log in to your account.',
      success: true,
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', success: false },
      { status: 500 }
    )
  }
}