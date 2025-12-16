import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Project } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'
import { useNotifications } from './useNotifications'

export function useProjects() {
  const { projects } = useFileSystem()
  const collection = useJsonCollection<Project>('projects', projects)
  const { log } = useActivity()
  const { notify } = useNotifications()

  const createProject = async (input: Omit<Project, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])

    const notifyPromises = [
      log({ action: 'إنشاء مشروع', entity: 'project', entityId: id, details: input.title }),
      notify({
        type: 'info',
        message: `تم إنشاء مشروع جديد: ${input.title}`,
        projectId: id,
        entity: 'project',
        entityId: id,
      }),
    ]

    if (input.endDate) {
      notifyPromises.push(
        notify({
          type: 'project_deadline',
          message: `تاريخ انتهاء مشروع "${input.title}" هو ${new Date(input.endDate).toLocaleDateString('ar-EG')}`,
          projectId: id,
          entity: 'project',
          entityId: id,
          dueDate: input.endDate,
        })
      )
    }

    await Promise.all(notifyPromises)
    return id
  }

  const updateProject = async (id: string, patch: Partial<Project>) => {
    await collection.save((items) => {
      const idx = items.findIndex((p) => p.id === id)
      if (idx === -1) return items
      const next = [...items]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
    log({ action: 'تحديث مشروع', entity: 'project', entityId: id }).catch(() => { })
  }

  const deleteProject = async (id: string) => {
    await collection.save((items) => items.filter((p) => p.id !== id))
    log({ action: 'حذف مشروع', entity: 'project', entityId: id }).catch(() => { })
  }

  return {
    ...collection,
    createProject,
    updateProject,
    deleteProject,
  }
}
