import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { PermissionUser, UserRole } from '../types/domain'
import { createId } from '../utils/id'

export function usePermissions() {
  const { permissions } = useFileSystem()
  const collection = useJsonCollection<PermissionUser>('permissions', permissions)

  const addUser = async (name: string, role: UserRole, username?: string, passwordHash?: string) => {
    const id = createId()
    const now = new Date().toISOString()
    const newUser: any = { id, name, role, createdAt: now }
    
    // إضافة بيانات تسجيل الدخول إذا وجدت
    if (username) {
      newUser.username = username
    }
    if (passwordHash) {
      newUser.passwordHash = passwordHash
    }
    
    await collection.save((items) => [...items, newUser])
  }

  const updateUserRole = async (id: string, role: UserRole) => {
    await collection.save((items) => {
      const next = items.map((u) => (u.id === id ? { ...u, role } : u))
      return next
    })
  }

  const deleteUser = async (id: string) => {
    await collection.save((items) => items.filter((u) => u.id !== id))
  }

  return {
    ...collection,
    addUser,
    updateUserRole,
    deleteUser,
  }
}
