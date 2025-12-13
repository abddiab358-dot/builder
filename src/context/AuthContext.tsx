import { createContext, useContext, useState, useEffect } from 'react'
import { PermissionUser } from '../types/domain'
import { readJSONFile, saveJSONFile } from '../storage/fileSystem'
import { getSavedDirectoryHandle } from '../storage/handleStore'
import { hashPassword, verifyPassword } from '../utils/password'

export interface AuthUser {
  id: string
  name: string
  role: 'manager' | 'staff' | 'viewer'
  isLoggedIn: boolean
  username?: string
  lastPath?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (userId: string, name: string, role: PermissionUser['role'], username?: string) => Promise<void>
  loginWithPassword: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (name: string, role: PermissionUser['role']) => void
  saveCurrentPath: (path: string) => void
  getLastPath: () => string
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// Initialize default data in localStorage if not exists
async function initializeDefaultData() {
  const stored = localStorage.getItem('file:permissions.json')
  if (!stored) {
    const defaultPermissions = [
      {
        id: 'osamah-admin-001',
        name: 'Osamah',
        username: 'osamah',
        passwordHash: '14399c1',
        role: 'manager',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('file:permissions.json', JSON.stringify(defaultPermissions))
  }

  // Initialize other default files
  if (!localStorage.getItem('file:projects.json')) {
    localStorage.setItem('file:projects.json', JSON.stringify([]))
  }
  if (!localStorage.getItem('file:tasks.json')) {
    localStorage.setItem('file:tasks.json', JSON.stringify([]))
  }
  if (!localStorage.getItem('file:clients.json')) {
    localStorage.setItem('file:clients.json', JSON.stringify([]))
  }
  if (!localStorage.getItem('file:session.json')) {
    localStorage.setItem('file:session.json', JSON.stringify({}))
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize default data and load user
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDefaultData()
        
        // Try to load session from localStorage first (reliable)
        const stored = localStorage.getItem('file:session.json')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            if (data && data.user) {
              console.log('Session restored from localStorage:', data.user.username)
              setUser(data.user)
            }
          } catch (error) {
            console.error('Failed to parse session from localStorage:', error)
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  const login = async (userId: string, name: string, role: PermissionUser['role'], username?: string) => {
    const newUser: AuthUser = {
      id: userId,
      name,
      role,
      isLoggedIn: true,
      username,
    }
    setUser(newUser)

    // Save session to localStorage directly (most reliable)
    try {
      localStorage.setItem('file:session.json', JSON.stringify({ user: newUser }))
      console.log('Session saved to localStorage:', username)
    } catch (error) {
      console.error('Failed to save session to localStorage:', error)
    }

    // Also try to save to file system
    try {
      await saveJSONFile('session.json', { user: newUser })
    } catch (error) {
      console.error('Failed to save session to file system:', error)
    }
  }

  const loginWithPassword = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt for user:', username)
      console.log('localStorage keys:', Object.keys(localStorage))
      
      // قراءة مباشرة من localStorage - هذا موثوق أكثر
      let usersData: any[] | null = null
      
      const stored = localStorage.getItem('file:permissions.json')
      console.log('Raw localStorage data:', stored)
      
      if (stored) {
        try {
          usersData = JSON.parse(stored)
          console.log('Parsed users from localStorage:', usersData)
        } catch (parseError) {
          console.error('Failed to parse localStorage data:', parseError)
        }
      }

      const users = usersData || []

      // البحث عن المستخدم
      const user = users.find((u: any) => u.username === username)
      if (!user) {
        console.log('User not found:', username, 'Available users:', users.map((u: any) => u.username))
        // إذا لم يوجد، حاول إضافة البيانات الافتراضية
        console.log('Attempting to reinitialize default data...')
        await initializeDefaultData()
        // حاول مرة أخرى
        const storedAgain = localStorage.getItem('file:permissions.json')
        if (storedAgain) {
          const retryUsers = JSON.parse(storedAgain)
          const retryUser = retryUsers.find((u: any) => u.username === username)
          if (retryUser) {
            console.log('User found after reinitialization:', retryUser.name)
            const inputHash = hashPassword(password)
            const isValidPassword = verifyPassword(password, retryUser.passwordHash)
            if (isValidPassword) {
              await login(retryUser.id, retryUser.name, retryUser.role, username)
              return true
            }
          }
        }
        return false
      }

      console.log('User found:', user.name, 'Password hash:', user.passwordHash)
      
      // التحقق من كلمة السر
      const inputHash = hashPassword(password)
      console.log('Input password hash:', inputHash, 'Stored hash:', user.passwordHash)
      
      const isValidPassword = verifyPassword(password, user.passwordHash)
      if (!isValidPassword) {
        console.log('Invalid password for user:', username)
        return false
      }

      console.log('Login successful for user:', username)
      
      // تسجيل الدخول
      await login(user.id, user.name, user.role, username)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    // حذف ملف الجلسة من localStorage
    try {
      localStorage.removeItem('file:session.json')
      console.log('Session cleared from localStorage')
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  const updateUser = (name: string, role: PermissionUser['role']) => {
    if (user) {
      const updatedUser = { ...user, name, role }
      setUser(updatedUser)
      // Save to localStorage
      try {
        localStorage.setItem('file:session.json', JSON.stringify({ user: updatedUser }))
        // Also try to save to file system
        saveJSONFile('session.json', { user: updatedUser }).catch(() => {})
      } catch (error) {
        console.error('Failed to update session:', error)
      }
    }
  }

  const saveCurrentPath = (path: string) => {
    if (user) {
      const updatedUser = { ...user, lastPath: path }
      setUser(updatedUser)
      try {
        // Save to localStorage
        localStorage.setItem('file:session.json', JSON.stringify({ user: updatedUser }))
        // Also try to save to file system
        saveJSONFile('session.json', { user: updatedUser }).catch(() => {})
      } catch (error) {
        console.error('Failed to save path:', error)
      }
    }
  }

  const getLastPath = (): string => {
    return user?.lastPath || '/dashboard'
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithPassword, logout, updateUser, saveCurrentPath, getLastPath, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
