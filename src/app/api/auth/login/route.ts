import { generateToken, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: 'Email and password are required' },
//         { status: 400 }
//       )
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       )
//     }

//     // if (!user.emailVerified) {
//     //   return NextResponse.json(
//     //     {
//     //       error:
//     //         'Please verify your email address before logging in. Check your inbox for the verification link.',
//     //       requiresVerification: true,
//     //     },
//     //     { status: 401 }
//     //   )
//     // }

//     const isValidPassword = await verifyPassword(password, user.password)

//     if (!isValidPassword) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       )
//     }

//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLoginAt: new Date() },
//     })

//     const token = generateToken(user.id)

//     const response = NextResponse.json({
//       //added ok: true to indicate successful login
//       ok: true,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         emailVerified: user.emailVerified,
//         role: user.role,
//         employeeId: user.employeeId,
//         phoneNumber: user.phoneNumber,
//         jobTitle: user.jobTitle,
//         department: user.department,
//         company: user.company,
//         supervisorName: user.supervisorName,
//         employmentType: user.employmentType,
//         biography: user.biography,
//         lastLoginAt: user.lastLoginAt,
//       },
//     })

//     response.cookies.set('auth-token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 7,
//       path: '/',
//     })

//     return response
//   } catch (error) {
//     console.error('Login error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json()

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { name },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = generateToken(user.id)

    const response = NextResponse.json({
      //added ok: true to indicate successful login
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        employeeId: user.employeeId,
        phoneNumber: user.phoneNumber,
        jobTitle: user.jobTitle,
        department: user.department,
        company: user.company,
        supervisorName: user.supervisorName,
        employmentType: user.employmentType,
        biography: user.biography,
        lastLoginAt: user.lastLoginAt,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}