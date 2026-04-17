import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ qualifications: [] }, { status: 401 })
    }

    const currentUser = await getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ qualifications: [] }, { status: 401 })
    }

    const qualifications = await prisma.ndtQualification.findMany({
      where: { userId: currentUser.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ qualifications })
  } catch (error) {
    console.error('Error fetching NDT qualifications:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { method, level, certNumber, approvalNo, expiresAt, renewDate } = body

    if (!method || !level) {
      return NextResponse.json({ error: 'Method and level are required' }, { status: 400 })
    }

    const qualification = await prisma.ndtQualification.create({
      data: {
        userId: currentUser.id,
        method,
        level,
        certNumber: certNumber || null,
        approvalNo: approvalNo || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        renewDate: renewDate ? new Date(renewDate) : null,
        active: true,
      },
    })

    return NextResponse.json({ qualification })
  } catch (error) {
    console.error('Error creating NDT qualification:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, method, level, certNumber, approvalNo, expiresAt, renewDate, active } = body

    if (!id) {
      return NextResponse.json({ error: 'Qualification ID is required' }, { status: 400 })
    }

    const qualification = await prisma.ndtQualification.update({
      where: { id, userId: currentUser.id },
      data: {
        method,
        level,
        certNumber: certNumber || null,
        approvalNo: approvalNo || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        renewDate: renewDate ? new Date(renewDate) : null,
        active: active ?? true,
      },
    })

    return NextResponse.json({ qualification })
  } catch (error) {
    console.error('Error updating NDT qualification:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Qualification ID is required' }, { status: 400 })
    }

    await prisma.ndtQualification.delete({
      where: { id, userId: currentUser.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting NDT qualification:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
