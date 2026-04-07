// Test registration with work email
console.log('Testing registration with work email...')

async function testRegistrationWithWorkEmail() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rahman@g7aerospace.com.my',
        password: 'testpassword123',
        name: 'Rahman Test'
      })
    })
    
    const data = await response.json()
    console.log('Registration response:', { status: response.status, data })
    
    if (data.message) {
      console.log('\n✅ Registration successful!')
      console.log('📧 Check your email: rahman@g7aerospace.com.my')
      console.log('📋 Look for subject: "Please verify your email - NDT System"')
    }
  } catch (error) {
    console.error('Registration error:', error.message)
  }
}

// Run test
testRegistrationWithWorkEmail()