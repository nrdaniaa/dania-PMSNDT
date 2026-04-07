// Test the complete registration and verification flow
console.log('Testing complete registration and verification flow...')

async function testCompleteFlow() {
  try {
    // Step 1: Register a new user
    console.log('\n📝 Step 1: Registering user...')
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testflow@gmail.com',
        password: 'testpassword123',
        name: 'Test Flow User'
      })
    })
    
    const registerData = await registerResponse.json()
    console.log('Registration response:', { status: registerResponse.status, data: registerData })
    
    if (registerResponse.status !== 200) {
      console.error('❌ Registration failed')
      return
    }
    
    console.log('✅ Registration successful, user ID:', registerData.user.id)
    
    // Step 2: Check what token was created (we can't access it directly, but we can see the verification URL format)
    console.log('\n📧 Step 2: Verification email would contain a URL like:')
    console.log('http://localhost:3000/api/auth/verify-email?token=<generated-token>')
    
    console.log('\n⚠️  To complete verification:')
    console.log('1. Check your email for the verification link')
    console.log('2. Click the link or copy the token from the URL')
    console.log('3. The token should be a 64-character hex string')
    
    // Let's also check if we can see tokens in the database (we'll create a separate script for this)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCompleteFlow()