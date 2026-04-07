import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to get from database first, fallback to env
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'session_timeout_ms' }
    })

    const sessionTimeout = setting
      ? parseInt(setting.value)
      : parseInt(process.env.SESSION_TIMEOUT_MS || '1800000')

    return NextResponse.json({
      sessionTimeout,
      warningTime: 60000 // 1 minute before logout
    })
  } catch (error) {
    console.error('Error fetching session settings:', error)
    // Fallback to env variable
    const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MS || '1800000')
    return NextResponse.json({
      sessionTimeout,
      warningTime: 60000
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { sessionTimeout } = body

    if (!sessionTimeout || typeof sessionTimeout !== 'number' || sessionTimeout < 60000) {
      return NextResponse.json({ error: 'Invalid session timeout. Must be at least 1 minute.' }, { status: 400 })
    }

    // Update or create the setting
    const setting = await prisma.systemSettings.upsert({
      where: { key: 'session_timeout_ms' },
      update: {
        value: sessionTimeout.toString(),
        updatedById: user.id
      },
      create: {
        key: 'session_timeout_ms',
        value: sessionTimeout.toString(),
        description: 'Session timeout in milliseconds',
        updatedById: user.id
      }
    })

    return NextResponse.json({
      sessionTimeout: parseInt(setting.value),
      warningTime: 60000
    })
  } catch (error) {
    console.error('Error updating session settings:', error)
    return NextResponse.json({ error: 'Failed to update session settings' }, { status: 500 })
  }
}