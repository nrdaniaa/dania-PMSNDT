// Simple test script to verify auth endpoints are working
console.log('Testing auth endpoints...')

async function testRegister() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    })
    
    const data = await response.json()
    console.log('Register response:', { status: response.status, data })
  } catch (error) {
    console.error('Register error:', error.message)
  }
}

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'testpassword123'
      })
    })
    
    const data = await response.json()
    console.log('Login response:', { status: response.status, data })
  } catch (error) {
    console.error('Login error:', error.message)
  }
}

// Run tests
testRegister().then(() => {
  console.log('Register test completed')
  // Don't test login as user won't be verified yet
})