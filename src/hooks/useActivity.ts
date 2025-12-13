import { useJsonCollection } from './useJsonCollection'
import { useFileSystem } from '../context/FileSystemContext'
import { ActivityEvent } from '../types/domain'
import { createId } from '../utils/id'

export function useActivity() {
  const { activity } = useFileSystem()
  const collection = useJsonCollection<ActivityEvent>('activity', activity)

  const log = async (params: {
    action: string
    entity: ActivityEvent['entity']
    entityId: string
    details?: string
  }) => {
    const event: ActivityEvent = {
      id: createId(),
      timestamp: new Date().toISOString(),
      ...params,
    }
    await collection.save((events) => [...events, event])
  }

  return {
    ...collection,
    log,
  }
}
