nt } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserVerification() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'testflow@gmail.com' },
      select: { email: true, name: true, emailVerified: true }
    })
    
    console.log('✅ User verification status:', user)
    
    if (user && user.emailVerified) {
      console.log('🎉 User is successfully verified and can now log in!')
    } else if (user && !user.emailVerified) {
      console.log('⏳ User exists but is not yet verified')
    } else {
      console.log('❌ User not found')
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserVerification()