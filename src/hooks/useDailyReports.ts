import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { DailyReport } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useDailyReports(projectId?: string) {
  const { dailyReports } = useFileSystem()
  const collection = useJsonCollection<DailyReport>('dailyReports', dailyReports)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((r) => (projectId ? r.projectId === projectId : true)),
  }

  const createReport = async (input: Omit<DailyReport, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])
    log({ action: 'تسجيل تقرير يومي', entity: 'dailyReport', entityId: id, details: input.date }).catch(() => {})
  }

  const deleteReport = async (id: string) => {
    await collection.save((items) => items.filter((r) => r.id !== id))
    log({ action: 'حذف تقرير يومي', entity: 'dailyReport', entityId: id }).catch(() => {})
  }

  return {
    ...filtered,
    createReport,
    deleteReport,
  }
}
