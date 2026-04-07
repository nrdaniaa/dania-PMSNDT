// Check what verification tokens exist in the database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTokens() {
  try {
    console.log('🔍 Checking verification tokens in database...\n')
    
    const tokens = await prisma.verificationToken.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Show last 10 tokens
    })
    
    if (tokens.length === 0) {
      console.log('❌ No verification tokens found in database')
      console.log('This means tokens are not being created during registration')
      return
    }
    
    console.log(`✅ Found ${tokens.length} verification token(s):`)
    
    tokens.forEach((token, index) => {
      const isExpired = token.expiresAt < new Date()
      console.log(`\n${index + 1}. Token: ${token.token.substring(0, 16)}...`)
      console.log(`   User: ${token.user.email} (${token.user.name})`)
      console.log(`   User ID: ${token.user.id}`)
      console.log(`   Email Verified: ${token.user.emailVerified}`)
      console.log(`   Created: ${token.createdAt}`)
      console.log(`   Expires: ${token.expiresAt}`)
      console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`)
    })
    
    // Test verification with the most recent token
    if (tokens.length > 0) {
      const latestToken = tokens[0]
      if (latestToken.expiresAt > new Date()) {
        console.log(`\n🧪 Testing verification with latest token...`)
        console.log(`Token: ${latestToken.token}`)
        console.log(`Test URL: http://localhost:3000/api/auth/verify-email?token=${latestToken.token}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTokens()