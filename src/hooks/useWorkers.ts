import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Worker } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useWorkers(projectId?: string) {
  const { workers } = useFileSystem()
  const collection = useJsonCollection<Worker>('workers', workers)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((w) => (projectId ? w.projectId === projectId : true)),
  }

  const createWorker = async (input: Omit<Worker, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])
    log({ action: 'إضافة عامل', entity: 'worker', entityId: id, details: input.name }).catch(() => {})
  }

  const updateWorker = async (id: string, patch: Partial<Worker>) => {
    await collection.save((items) => {
      const idx = items.findIndex((w) => w.id === id)
      if (idx === -1) return items
      const next = [...items]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
    log({ action: 'تحديث عامل', entity: 'worker', entityId: id }).catch(() => {})
  }

  const deleteWorker = async (id: string) => {
    await collection.save((items) => items.filter((w) => w.id !== id))
    log({ action: 'حذف عامل', entity: 'worker', entityId: id }).catch(() => {})
  }

  return {
    ...filtered,
    createWorker,
    updateWorker,
    deleteWorker,
  }
}
