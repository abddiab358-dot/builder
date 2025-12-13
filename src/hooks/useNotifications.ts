import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Notification, NotificationType } from '../types/domain'
import { createId } from '../utils/id'

export function useNotifications() {
  const { notifications } = useFileSystem()
  const collection = useJsonCollection<Notification>('notifications', notifications)

  const notify = async (input: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now, read: false }])
  }

  const markRead = async (id: string, read = true) => {
    await collection.save((items) => {
      const next = items.map((n) => (n.id === id ? { ...n, read } : n))
      return next
    })
  }

  const markAllRead = async () => {
    await collection.save((items) => items.map((n) => ({ ...n, read: true })))
  }

  const createSimpleNotification = async (type: NotificationType, message: string) => {
    await notify({ type, message })
  }

  return {
    ...collection,
    notify,
    markRead,
    markAllRead,
    createSimpleNotification,
  }
}
