/**
 * Password utility functions
 * Note: For production, use bcrypt or argon2 on the backend
 * This is a simple hash for local storage only
 */

export function hashPassword(password: string): string {
  // Simple hash function for local storage (NOT production safe)
  // In production, always hash on backend with bcrypt/argon2
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

export function verifyPassword(password: string, hash: string): boolean {
  // Verify password against hash
  return hashPassword(password) === hash
}

export function generateAdminPassword(): string {
  // Generate a secure admin password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
