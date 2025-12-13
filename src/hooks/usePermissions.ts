import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { PermissionUser, UserRole } from '../types/domain'
import { createId } from '../utils/id'

export function usePermissions() {
  const { permissions } = useFileSystem()
  const collection = useJsonCollection<PermissionUser>('permissions', permissions)

  const addUser = async (name: string, role: UserRole) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { id, name, role, createdAt: now }])
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
