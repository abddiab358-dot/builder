import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { ProjectLocation } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useProjectLocations(projectId?: string) {
  const { locations } = useFileSystem()
  const collection = useJsonCollection<ProjectLocation>('locations', locations)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((loc) => (projectId ? loc.projectId === projectId : true)),
  }

  const upsertLocation = async (
    input: Omit<ProjectLocation, 'id' | 'createdAt'> & { id?: string },
  ) => {
    const now = new Date().toISOString()
    if (input.id) {
      const id = input.id
      await collection.save((items) => {
        const idx = items.findIndex((l) => l.id === id)
        if (idx === -1) return items
        const next = [...items]
        next[idx] = { ...next[idx], ...input }
        return next
      })
      await log({ action: 'تحديث موقع مشروع', entity: 'project', entityId: input.projectId })
    } else {
      const id = createId()
      await collection.save((items) => [...items, { ...input, id, createdAt: now }])
      await log({ action: 'تحديد موقع مشروع', entity: 'project', entityId: input.projectId })
    }
  }

  return {
    ...filtered,
    upsertLocation,
  }
}
