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
    await log({ action: 'تسجيل مصروف', entity: 'expense', entityId: id, details: input.label })
  }

  const deleteExpense = async (id: string) => {
    await collection.save((items) => items.filter((e) => e.id !== id))
    await log({ action: 'حذف مصروف', entity: 'expense', entityId: id })
  }

  return {
    ...filtered,
    createExpense,
    deleteExpense,
  }
}
