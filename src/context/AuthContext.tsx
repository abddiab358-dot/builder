import { createContext, useContext, useState, useEffect } from 'react'
import { PermissionUser } from '../types/domain'
import { readJSONFile, saveJSONFile } from '../storage/fileSystem'

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
        const data = await readJSONFile('session.json')
        if (data && data.user) {
          setUser(data.user)
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

    // حفظ الجلسة
    try {
      await saveJSONFile('session.json', { user: newUser })
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  const loginWithPassword = async (username: string, password: string): Promise<boolean> => {
    try {
      // قراءة بيانات المستخدمين
      const usersData = await readJSONFile('permissions.json')
      const users = usersData || []

      // البحث عن المستخدم
      const user = users.find((u: any) => u.username === username)
      if (!user) {
        return false
      }

      // التحقق من كلمة السر (في الإنتاج، استخدم bcrypt)
      // هنا نستخدم تشفير بسيط
      const isValidPassword = await verifyPassword(password, user.passwordHash)
      if (!isValidPassword) {
        return false
      }

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
    // حذف ملف الجلسة
    try {
      const handle = (window as any).projectFolderHandle
      if (handle) {
        handle.removeEntry('session.json').catch(() => {})
      }
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  const updateUser = (name: string, role: PermissionUser['role']) => {
    if (user) {
      const updatedUser = { ...user, name, role }
      setUser(updatedUser)
      // حفظ التحديث
      try {
        saveJSONFile('session.json', { user: updatedUser })
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
        saveJSONFile('session.json', { user: updatedUser })
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

// دالة تشفير وفك تشفير بسيطة (في الإنتاج استخدم bcrypt)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // في الإنتاج، استخدم bcrypt.compare()
  return simpleHash(password) === hash
}

export function createPasswordHash(password: string): string {
  // في الإنتاج، استخدم bcrypt.hash()
  return simpleHash(password)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
