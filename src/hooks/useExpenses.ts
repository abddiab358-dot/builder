import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Expense } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useExpenses(projectId?: string) {
  const { expenses } = useFileSystem()
  const collection = useJsonCollection<Expense>('expenses', expenses)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((e) => (projectId ? e.projectId === projectId : true)),
  }

  const createExpense = async (input: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])
    log({ action: 'تسجيل مصروف', entity: 'expense', entityId: id, details: input.label }).catch(() => {})
  }

  const deleteExpense = async (id: string) => {
    await collection.save((items) => items.filter((e) => e.id !== id))
    log({ action: 'حذف مصروف', entity: 'expense', entityId: id }).catch(() => {})
  }

  const updateExpense = async (id: string, patch: Partial<Expense>) => {
    await collection.save((items) => {
      const idx = items.findIndex((e) => e.id === id)
      if (idx === -1) return items
      const next = [...items]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
    log({ action: 'تحديث مصروف', entity: 'expense', entityId: id }).catch(() => {})
  }

  return {
    ...filtered,
    createExpense,
    deleteExpense,
    updateExpense,
  }
}
