import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Task } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'
import { useNotifications } from './useNotifications'

export function useTasks(projectId?: string) {
  const { tasks } = useFileSystem()
  const collection = useJsonCollection<Task>('tasks', tasks)
  const { log } = useActivity()
  const { notify } = useNotifications()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((t) => (projectId ? t.projectId === projectId : true)),
  }

  const createTask = async (input: Omit<Task, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])
    await log({ action: 'إنشاء مهمة', entity: 'task', entityId: id, details: input.title })

    if (input.dueDate) {
      await notify({
        type: 'task_due',
        message: `مهمة "${input.title}" تستحق في ${new Date(input.dueDate).toLocaleDateString('ar-EG')}`,
        projectId: input.projectId,
        entity: 'task',
        entityId: id,
        dueDate: input.dueDate,
      })
    }
  }

  const updateTask = async (id: string, patch: Partial<Task>) => {
    await collection.save((items) => {
      const idx = items.findIndex((t) => t.id === id)
      if (idx === -1) return items
      const next = [...items]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
    await log({ action: 'تحديث مهمة', entity: 'task', entityId: id })
  }

  const deleteTask = async (id: string) => {
    await collection.save((items) => items.filter((t) => t.id !== id))
    await log({ action: 'حذف مهمة', entity: 'task', entityId: id })
  }

  return {
    ...filtered,
    createTask,
    updateTask,
    deleteTask,
  }
}
