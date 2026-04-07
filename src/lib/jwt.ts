import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment')

export function sign(payload: object, opts?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...(opts || {}) })
}

export function verify<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}
