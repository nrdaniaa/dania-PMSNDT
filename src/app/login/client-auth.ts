// utility to call server auth endpoints from the client
// export async function registerApi(email: string, username: string, password: string, additionalData?: { employeeId?: string, jobTitle?: string, department?: string, company?: string }) {
//   const res = await fetch('/api/auth/register', { 
//     method: 'POST', 
//     headers: { 'content-type': 'application/json' }, 
//     body: JSON.stringify({ 
//       email, 
//       name: username, 
//       password,
//       ...additionalData
//     }) 
//   })
//   return res.json()
// }

// export async function loginApi(email: string, password: string) {
//   const res = await fetch('/api/auth/login', { 
//     method: 'POST', 
//     headers: { 'content-type': 'application/json' }, 
//     body: JSON.stringify({ email, password }) 
//   })
//   return res.json()
// }
export async function registerApi( username: string, password: string, role: string, additionalData?: { employeeId?: string, jobTitle?: string, department?: string, company?: string }) {
  const res = await fetch('/api/auth/register', { 
    method: 'POST', 
    headers: { 'content-type': 'application/json' }, 
    body: JSON.stringify({ 
      name: username, 
      password,
      role,
      ...additionalData
    }) 
  })
  return res.json()
}

export async function loginApi(username: string, password: string) {
  const res = await fetch('/api/auth/login', { 
    method: 'POST', 
    headers: { 'content-type': 'application/json' }, 
    body: JSON.stringify({ name:username, password }) 
  })
  return res.json()
}

export async function logoutApi() {
  const res = await fetch('/api/auth/logout', { 
    method: 'POST', 
    headers: { 'content-type': 'application/json' }
  })
  return res.json()
}


