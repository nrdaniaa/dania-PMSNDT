import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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

    const data = await request.formData()
    const file: File | null = data.get('avatar') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' }, { status: 400 })
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    const filename = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('') + path.extname(file.name)
    const filepath = path.join(process.cwd(), 'public', 'avatars', filename)

    // Ensure directory exists
    await mkdir(path.dirname(filepath), { recursive: true })

    // Convert file to buffer and write
    const bytesData = await file.arrayBuffer()
    const buffer = Buffer.from(bytesData)
    await writeFile(filepath, buffer)

    // Update user avatar in DB
    const avatarUrl = `/avatars/${filename}`
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { avatar: avatarUrl },
    })

    return NextResponse.json({ avatar: avatarUrl })
  } catch (error) {
    console.error('Upload avatar error:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}