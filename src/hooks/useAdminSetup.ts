import { useCallback } from 'react'
import { useJsonCollection } from './useJsonCollection'
import { readJSONFile, saveJSONFile } from '../storage/fileSystem'
import { hashPassword } from '../utils/password'
import { createId } from '../utils/id'
import { useFileSystem } from '../context/FileSystemContext'

export function useAdminSetup() {
  const { permissions: permissionsHandle } = useFileSystem()
  const { data: users = [] } = useJsonCollection('permissions.json', permissionsHandle)

  const hasAdminUser = useCallback(() => {
    return Array.isArray(users) && users.some((u: any) => u.role === 'admin')
  }, [users])

  const createAdminUser = useCallback(
    async (name: string, username: string, password: string) => {
      try {
        const adminExists = hasAdminUser()
        if (adminExists) {
          return { success: false, message: 'حساب أدمن موجود بالفعل' }
        }

        const adminUser = {
          id: createId(),
          name,
          username,
          password: hashPassword(password),
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
        }

        const currentUsers = Array.isArray(users) ? users : []
        const updatedUsers = [adminUser, ...currentUsers]

        await saveJSONFile('permissions.json', updatedUsers)

        return {
          success: true,
          message: 'تم إنشاء حساب الأدمن بنجاح',
          user: adminUser,
        }
      } catch (error) {
        console.error('Failed to create admin user:', error)
        return { success: false, message: 'فشل إنشاء حساب الأدمن' }
      }
    },
    [users, hasAdminUser]
  )

  return {
    hasAdminUser: hasAdminUser(),
    createAdminUser,
  }
}
