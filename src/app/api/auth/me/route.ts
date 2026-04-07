import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

type OptionalString = string | null | undefined

function normalizeOptionalField(value: unknown): OptionalString {
  if (typeof value === 'string') {
    return value.trim() === '' ? null : value.trim()
  }
  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await getCurrentUser(token)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Me route error:', error)
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
    const { 
      name, 
      email,
      phoneNumber,
      contactTelegram,
      contactWhatsapp,
      employeeId,
      jobTitle,
      department,
      company,
      supervisorName,
      employmentType,
      biography,
     } = body

    const normalized = {
      name: normalizeOptionalField(name),
      email: normalizeOptionalField(email),
      phoneNumber: normalizeOptionalField(phoneNumber),
      contactTelegram: normalizeOptionalField(contactTelegram),
      contactWhatsapp: normalizeOptionalField(contactWhatsapp),
      employeeId: normalizeOptionalField(employeeId),
      jobTitle: normalizeOptionalField(jobTitle),
      department: normalizeOptionalField(department),
      company: normalizeOptionalField(company),
      supervisorName: normalizeOptionalField(supervisorName),
      employmentType: normalizeOptionalField(employmentType),
      biography: normalizeOptionalField(biography),
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name !== undefined && normalized.name !== null && { name: normalized.name }),
        ...(email !== undefined && normalized.email !== null && { email: normalized.email }),
        ...(phoneNumber !== undefined && { phoneNumber: normalized.phoneNumber }),
        ...(contactTelegram !== undefined && { contactTelegram: normalized.contactTelegram }),
        ...(contactWhatsapp !== undefined && { contactWhatsapp: normalized.contactWhatsapp }),
        ...(employeeId !== undefined && normalized.employeeId !== null && { employeeId: normalized.employeeId }),
        ...(jobTitle !== undefined && { jobTitle: normalized.jobTitle }),
        ...(department !== undefined && { department: normalized.department }),
        ...(company !== undefined && { company: normalized.company }),
        ...(supervisorName !== undefined && { supervisorName: normalized.supervisorName }),
        ...(employmentType !== undefined && { employmentType: normalized.employmentType }),
        ...(biography !== undefined && { biography: normalized.biography }),
      },
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

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta?.target.join(', ')
        : error.meta?.target
      return NextResponse.json(
        { error: `A record with the same ${target} already exists.` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
