import {
  createVerificationToken,
  hashPassword,
  isAllowedEmailDomain,
} from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      employeeId,
      phoneNumber,
      jobTitle,
      department,
      company,
      supervisorName,
      employmentType,
      biography,
      role,
    } = await request.json()

    // if (!email || !password) {
    //   return NextResponse.json(
    //     { error: 'Email and password are required' },
    //     { status: 400 }
    //   )
    // }
    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      )
    }


    // if (!isAllowedEmailDomain(email)) {
    //   const allowedDomains = process.env.ALLOWED_DOMAIN
    //     ?.split(',')
    //     .map((d) => d.trim())
    //     .join(' or ')

    //   return NextResponse.json(
    //     {
    //       error: allowedDomains
    //         ? `Registration is restricted to specific domains only. Please use your ${allowedDomains} email address.`
    //         : 'Registration is restricted to authorized domains only.',
    //     },
    //     { status: 400 }
    //   )
    // }

   
    const existingUser = await prisma.user.findUnique({
      where: { name },
    })

    if (existingUser) {
      // if (existingUser.emailVerified) {
      //   return NextResponse.json(
      //     { error: 'User already exists and is verified' },
      //     { status: 400 }
      //   )
      // }

      // try {
      //   const verificationToken = await createVerificationToken(existingUser.id)
      //   await sendVerificationEmail(email, verificationToken)

      //   return NextResponse.json({
      //     message:
      //       'A verification email has been resent to your email address. Please check your inbox and click the verification link to complete your registration.',
      //     requiresVerification: true,
      //   })
      // } catch (error) {
      //   console.error('Failed to resend verification email:', error)
      //   return NextResponse.json(
      //     { error: 'Failed to resend verification email' },
      //     { status: 500 }
      //   )
      // }
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    if (employeeId) {
      const existingEmployee = await prisma.user.findUnique({
        where: { employeeId },
      })

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee ID is already in use' },
          { status: 400 }
        )
      }
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Determine role based on username - if username contains "admin", set role to admin
    // const role = name.toLowerCase().includes("admin") ? "admin" : "user"

    let roleToAssign = role || 'customer'; // default to 'customer' if no role provided
    if (name.toLowerCase().includes('admin')) {
      roleToAssign = 'admin';
    } else {
      if(!role) {
        return NextResponse.json(
          { error: 'Role is required for non-admin users' },
          { status: 400 }
        )
       }
      roleToAssign = role; 
    }

     

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        //name: name || email.split('@')[0],
        employeeId: employeeId || null,
        phoneNumber: phoneNumber || null,
        jobTitle: jobTitle || null,
        department: department || null,
        company: company || null,
        supervisorName: supervisorName || null,
        employmentType: employmentType || null,
        biography: biography || null,
        role: roleToAssign,
        // emailVerified: false,
        emailVerified: true, 
      },
    })

    try {
      //without email verification for now, we can just return success response immediately
      return NextResponse.json({
        ok: true,
        message: 'Registration successful! You can now log in.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          employeeId: user.employeeId,
          phoneNumber: user.phoneNumber,
          jobTitle: user.jobTitle,
          department: user.department,
          company: user.company,
          supervisorName: user.supervisorName,
          employmentType: user.employmentType,
          biography: user.biography,
        },
      })

      // const verificationToken = await createVerificationToken(user.id)
      // await sendVerificationEmail(email, verificationToken)

      // return NextResponse.json({
      //   message:
      //     'Registration successful! Please check your email and click the verification link to complete your account setup.',
      //   requiresVerification: true,
      //   user: {
      //     id: user.id,
      //     email: user.email,
      //     name: user.name,
      //     employeeId: user.employeeId,
      //     phoneNumber: user.phoneNumber,
      //     jobTitle: user.jobTitle,
      //     department: user.department,
      //     company: user.company,
      //     supervisorName: user.supervisorName,
      //     employmentType: user.employmentType,
      //     biography: user.biography,
      //   },
      // })
    } catch (error) {

    
      // console.error('Failed to send verification email:', error)

      // await prisma.verificationToken.deleteMany({
      //   where: { userId: user.id },
      // })

       await prisma.user.delete({
        where: { id: user.id },
      })

      // return NextResponse.json(
      //   { error: 'Failed to send verification email. Please try again.' },
      //   { status: 500 }
      // )
      
    }

    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}