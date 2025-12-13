import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Client } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useClients() {
  const { clients } = useFileSystem()
  const collection = useJsonCollection<Client>('clients', clients)
  const { log } = useActivity()

  const createClient = async (input: Omit<Client, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])
    await log({ action: 'إضافة عميل', entity: 'client', entityId: id, details: input.name })
  }

  const updateClient = async (id: string, patch: Partial<Client>) => {
    await collection.save((items) => {
      const idx = items.findIndex((c) => c.id === id)
      if (idx === -1) return items
      const next = [...items]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
    await log({ action: 'تحديث عميل', entity: 'client', entityId: id })
  }

  const deleteClient = async (id: string) => {
    await collection.save((items) => items.filter((c) => c.id !== id))
    await log({ action: 'حذف عميل', entity: 'client', entityId: id })
  }

  return {
    ...collection,
    createClient,
    updateClient,
    deleteClient,
  }
}
