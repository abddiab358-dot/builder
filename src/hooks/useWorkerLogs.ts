import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { WorkerLogEntry } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useWorkerLogs(projectId?: string) {
  const { workersLog } = useFileSystem()
  const collection = useJsonCollection<WorkerLogEntry>('workersLog', workersLog)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((e) => (projectId ? e.projectId === projectId : true)),
  }

  const createLog = async (input: Omit<WorkerLogEntry, 'id' | 'createdAt' | 'totalCost'>) => {
    const id = createId()
    const now = new Date().toISOString()
    const totalCost = input.workersCount * input.hoursPerWorker * input.hourlyRate
    await collection.save((items) => [...items, { ...input, id, createdAt: now, totalCost }])
    await log({ action: 'تسجيل يومية عمال', entity: 'workerLog', entityId: id })
  }

  const deleteLog = async (id: string) => {
    await collection.save((items) => items.filter((e) => e.id !== id))
    await log({ action: 'حذف يومية عمال', entity: 'workerLog', entityId: id })
  }

  return {
    ...filtered,
    createLog,
    deleteLog,
  }
}
