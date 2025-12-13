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
      console.log('Login attempt for user:', username)
      
      // محاولة القراءة من الملفات أولاً
      let usersData: any[] | null = null
      
      try {
        const dir = await getSavedDirectoryHandle()
        if (dir) {
          const handle = await dir.getFileHandle('permissions.json').catch(() => null)
          if (handle) {
            const file = await handle.getFile()
            const text = await file.text()
            if (text.trim()) {
              usersData = JSON.parse(text)
              console.log('Loaded users from file system:', usersData)
            }
          }
        }
      } catch (fileError) {
        console.log('File system access failed, falling back to localStorage', fileError)
      }
      
      // الرجوع إلى localStorage إذا فشل الملف
      if (!usersData) {
        const stored = localStorage.getItem('file:permissions.json')
        usersData = stored ? JSON.parse(stored) : []
        console.log('Loaded users from localStorage:', usersData)
      }

      const users = usersData || []

      // البحث عن المستخدم
      const user = users.find((u: any) => u.username === username)
      if (!user) {
        console.log('User not found:', username, 'Available users:', users.map((u: any) => u.username))
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
