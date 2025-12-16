import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { ProjectWork } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useProjectWorks(projectId?: string) {
    const { projectWorks } = useFileSystem()
    const collection = useJsonCollection<ProjectWork>('project_works', projectWorks)
    const { log } = useActivity()

    const filtered = {
        ...collection,
        data: (collection.data ?? []).filter((w) => (projectId ? w.projectId === projectId : true)),
    }

    const createWork = async (title: string, notes?: string) => {
        if (!projectId) return
        const id = createId()
        const now = new Date().toISOString()
        const newWork: ProjectWork = {
            id,
            projectId,
            title,
            isCompleted: false,
            notes,
            createdAt: now,
        }

        await collection.save((items) => [...items, newWork])

        // Log activity
        log({
            action: 'إضافة عمل',
            entity: 'project', // Generic project update or could be specific 'work' entity if added to types
            entityId: projectId,
            details: `إضافة عمل: ${title}`
        }).catch(() => { })
    }

    const toggleWork = async (id: string, isCompleted: boolean) => {
        await collection.save((items) => {
            return items.map((w) => {
                if (w.id === id) {
                    return {
                        ...w,
                        isCompleted,
                        completedAt: isCompleted ? new Date().toISOString() : undefined,
                    }
                }
                return w
            })
        })
    }

    const deleteWork = async (id: string) => {
        await collection.save((items) => items.filter((w) => w.id !== id))
    }

    return {
        ...filtered,
        createWork,
        toggleWork,
        deleteWork,
    }
}
